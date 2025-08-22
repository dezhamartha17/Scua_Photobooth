const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const { google } = require("googleapis");
const stream = require("stream");
const cors = require("cors");
const fs = require("fs");
const midtransClient = require("midtrans-client");
const axios = require("axios");
const { dialog } = require("electron");

console.error = () => {};
console.log = () => {};
console.warn = () => {};

let mainWindow;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  dialog.showErrorBox(
    "Aplikasi Sudah Berjalan",
    "Aplikasi tidak bisa dibuka karena masih berjalan."
  );
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Jika ada instance kedua yang coba dijalankan, fokus ke window utama
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createMainWindow() {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      fullscreen: true,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        enableWebSQL: false,
        webSecurity: false,
        backgroundThrottling: false,
        autoHideMenuBar: true,
      },
    });
    console.time("Page Load Time");

    mainWindow.loadFile("views/index.html").catch((err) => {
      console.error("Failed to load index.html:", err);
      mainWindow.webContents.send(
        "load-error",
        "Failed to load the application."
      );
    });

    mainWindow.on("closed", () => {
      mainWindow = null;
    });

    mainWindow.on("maximize", () => {
      mainWindow.setFullScreen(true);
      mainWindow.setMenuBarVisibility(false);
    });

    mainWindow.on("unmaximize", () => {
      mainWindow.setFullScreen(false);
    });
  }

  function logCPUUsage() {
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce(
      (acc, cpu) => acc + Object.values(cpu.times).reduce((a, b) => a + b, 0),
      0
    );

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;

    const usage = 100 - Math.round((100 * idle) / total);
    console.log(`CPU Usage: ${usage}%`);
  }

  app.whenReady().then(() => {
    createMainWindow();

    mainWindow.webContents.on("did-finish-load", () => {
      console.timeEnd("Page Load Time");
      mainWindow.webContents.send("main-window-ready");
    });

    ipcMain.on(
      "photo-taken",
      throttle((event, photoDataUrl) => {
        try {
          if (photoDataUrl.length < 50 * 1024 * 1024) {
            mainWindow.webContents.send("photo-taken", photoDataUrl);
          } else {
            console.warn("Image size is too large.");
          }
        } catch (err) {
          console.error("Failed to process photo:", err);
        }
      }, 1000)
    );

    ipcMain.on("submit-email", async (event, email) => {
      try {
        const fetch = await import("node-fetch").then(
          (module) => module.default
        );
        const response = await fetch("http://localhost:3000/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, photo: selectedPhotoSrc }),
        });

        const data = await response.json();
        mainWindow.webContents.send("email-submission-response", data.success);
      } catch (error) {
        console.error("Error:", error);
        mainWindow.webContents.send("email-submission-response", false);
      }
    });

    setInterval(() => {
      try {
        logCPUUsage();
      } catch (error) {
        console.error("Failed to get CPU usage:", error);
      }
    }, 5000);

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  require("dotenv").config();

  const expressApp = express();
  const port = 3000;

  const configPath = path.join(__dirname, "config.json");
  let currentConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

  let snap = new midtransClient.Snap({
    isProduction: true,
    serverKey: currentConfig.midtransServerKey,
    clientKey: currentConfig.midtransClientKey,
  });

  let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: currentConfig.emailUser,
      pass: currentConfig.emailPass,
    },
  });

  const reloadConfig = () => {
    try {
      currentConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

      transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: currentConfig.emailUser,
          pass: currentConfig.emailPass,
        },
      });

      snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: currentConfig.midtransServerKey,
        clientKey: currentConfig.midtransClientKey,
      });

      DRIVE_FOLDER_ID = currentConfig.googleDriveFolderId;
    } catch (error) {
      console.error("Error reloading configuration:", error);
    }
  };

  expressApp.use(cors());
  expressApp.use(bodyParser.json({ limit: "300mb" }));
  expressApp.use(express.json());

  const KEYFILEPATH = path.join(__dirname, "upload.json");
  const SCOPES = ["https://www.googleapis.com/auth/drive"];
  let DRIVE_FOLDER_ID = currentConfig.googleDriveFolderId;

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  const upload = multer();

  expressApp.post("/create-transaction", (req, res) => {
    const { transaction_details, customer_details } = req.body;

    const orderData = {
      transaction_details: {
        order_id: transaction_details.order_id,
        gross_amount: transaction_details.gross_amount, // gunakan gross_amount dari request
      },
      customer_details: customer_details,
    };

    snap
      .createTransaction(orderData)
      .then((transaction) => {
        res.json({ token: transaction.token });
      })
      .catch((error) => {
        console.error("Error creating transaction:", error);
        res.status(500).json({ error: error.message });
      });
  });

  expressApp.post("/upload", upload.any(), async (req, res) => {
    try {
      const drive = await authenticateGoogleDrive();
      const { files } = req;

      for (const file of files) {
        await uploadFile(drive, file);
      }

      res.status(200).send("Files uploaded successfully");
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const authenticateGoogleDrive = async () => {
    const authClient = await auth.getClient();
    return google.drive({
      version: "v3",
      auth: authClient,
    });
  };

  const uploadFile = async (drive, fileObject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);

    try {
      const { data } = await drive.files.create({
        media: {
          mimeType: fileObject.mimetype,
          body: bufferStream,
        },
        resource: {
          name: fileObject.originalname,
          parents: [DRIVE_FOLDER_ID],
        },
        fields: "id,name",
      });
      console.log(`Uploaded file ${data.name} with ID ${data.id}`);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  expressApp.post("/send-email", async (req, res) => {
    const { email, photos } = req.body;
    const filePaths = [];
    const driveLinks = [];

    try {
      // Upload photos to Google Drive first
      const drive = await authenticateGoogleDrive();

      // Process each photo concurrently (in parallel)
      const uploadPromises = photos.map(async (photo, i) => {
        // Save photo temporarily
        const filePath = path.join(__dirname, `image${i + 1}.jpg`);
        filePaths.push(filePath);
        fs.writeFileSync(
          filePath,
          Buffer.from(photo.split("base64,")[1], "base64")
        );

        // Upload to Google Drive
        const { data } = await drive.files.create({
          media: {
            mimeType: "image/jpeg",
            body: fs.createReadStream(filePath),
          },
          resource: {
            name: `image${i + 1}.jpg`,
            parents: [DRIVE_FOLDER_ID],
          },
          fields: "id,webViewLink",
        });

        // Store the sharing link
        await drive.permissions.create({
          fileId: data.id,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        });

        driveLinks.push(data.webViewLink);
      });

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Prepare email with links
      const mailOptions = {
        from: "noreply@example.com",
        to: email,
        subject: "Photobooth Museum Scua",
        html: `
        <h2>Your Photobooth Results</h2>
        <p>Here are the links to your photos:</p>
        ${driveLinks
          .map(
            (link, index) => `
          <p>Photo ${index + 1}: <a href="${link}">Click here to view</a></p>
        `
          )
          .join("")}
      `,
      };

      // Send email with links
      await new Promise((resolve, reject) => {
        transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("Error sending email:", error);
            reject(error);
          } else {
            console.log("Email sent: " + info.response);
            resolve();
          }
        });
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ success: false, error: error.message });
    } finally {
      // Clean up temporary files
      filePaths.forEach((filePath) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });

  expressApp.post("/update-config", (req, res) => {
    const {
      googleDriveFolderId,
      emailUser,
      emailPass,
      midtransServerKey,
      midtransClientKey,
    } = req.body;

    const newConfig = {
      googleDriveFolderId:
        googleDriveFolderId || currentConfig.googleDriveFolderId,
      emailUser: emailUser || currentConfig.emailUser,
      emailPass: emailPass || currentConfig.emailPass,
      midtransServerKey: midtransServerKey || currentConfig.midtransServerKey,
      midtransClientKey: midtransClientKey || currentConfig.midtransClientKey,
    };

    fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), (err) => {
      if (err) {
        console.error("Error updating configuration file:", err);
        res.status(500).json({
          success: false,
          message: "Failed to update configuration file",
        });
      } else {
        console.log("Configuration updated successfully.");
        reloadConfig();
        res.status(200).json({
          success: true,
          message: "Configuration updated successfully",
        });
      }
    });
  });

  expressApp.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });

  expressApp.get("/get-new-frame", (req, res) => {
    const newFrames = [
      {
        id: "frame5",
        imageSrc: "../public/images/Group_257.png",
        altText: "Frame 5",
      },
    ];
    res.json(newFrames);
  });
}
