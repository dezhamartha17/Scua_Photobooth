require("dotenv").config(); // Load environment variables

const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const { google } = require("googleapis");
const stream = require("stream");
const cors = require("cors");
const fs = require("fs");
const midtransClient = require("midtrans-client");
const axios = require("axios");

const app = express();
const port = 3000;

const configPath = path.join(__dirname, "config.json");
let currentConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Initialize Midtrans Snap with the current configuration
let snap = new midtransClient.Snap({
  isProduction: true,
  serverKey: currentConfig.midtransServerKey,
  clientKey: currentConfig.midtransClientKey,
});

// Initialize Nodemailer transport with the current configuration
let transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: currentConfig.emailUser,
    pass: currentConfig.emailPass,
  },
});

// Function to reload configuration
const reloadConfig = () => {
  try {
    currentConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // Update Nodemailer transport
    transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: currentConfig.emailUser,
        pass: currentConfig.emailPass,
      },
    });

    // Create new instance of Snap with updated keys
    snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: currentConfig.midtransServerKey,
      clientKey: currentConfig.midtransClientKey,
    });

    // Update Google Drive folder ID
    DRIVE_FOLDER_ID = currentConfig.googleDriveFolderId;
  } catch (error) {
    console.error("Error reloading configuration:", error);
  }
};

// Setup CORS
app.use(cors());

// Setup body parser
app.use(bodyParser.json({ limit: "300mb" }));
app.use(express.json());

// Google Drive API setup
const KEYFILEPATH = path.join(__dirname, "upload.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];
let DRIVE_FOLDER_ID = currentConfig.googleDriveFolderId;

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const upload = multer(); // Configure multer to handle file uploads

// Endpoint to create a Midtrans transaction
app.post("/create-transaction", (req, res) => {
  const orderData = {
    transaction_details: {
      order_id: "order-id-" + new Date().getTime(),
      gross_amount: 10, // Adjust the amount as needed
    },
    customer_details: {
      first_name: "Pelanggan",
      last_name: "Photobooth Musium Scua",
      email: "museumcaturindonesia@gmail.com",
      phone: "08123456789",
    },
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

// Endpoint to upload files to Google Drive
app.post("/upload", upload.any(), async (req, res) => {
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

// Endpoint to send email and upload files to Google Drive
app.post("/send-email", async (req, res) => {
  const { email, photos } = req.body;
  console.log("Received email:", email);
  console.log("Received photos:", photos);

  const attachments = photos.map((photo, index) => ({
    filename: `image${index + 1}.jpg`,
    content: Buffer.from(photo.split("base64,")[1], "base64"),
    encoding: "base64",
  }));

  const mailOptions = {
    from: "noreply@example.com",
    to: email,
    subject: "Photobooth Museum Scua",
    text: "Result Photobooth",
    attachments: attachments,
  };

  const filePaths = [];
  try {
    for (let i = 0; i < photos.length; i++) {
      const filePath = path.join(__dirname, `image${i + 1}.jpg`);
      filePaths.push(filePath);
      fs.writeFileSync(
        filePath,
        Buffer.from(photos[i].split("base64,")[1], "base64")
      );
    }

    const drive = await authenticateGoogleDrive();
    for (const filePath of filePaths) {
      const fileName = path.basename(filePath);
      await uploadFile(drive, {
        originalname: fileName,
        buffer: fs.readFileSync(filePath),
        mimetype: "image/jpeg",
      });
    }

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res.status(500).json({ success: false, error: error.message });
      }
      console.log("Email sent: " + info.response);
      res.status(200).json({ success: true });
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    filePaths.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }
});

// Endpoint to update configuration
app.post("/update-config", (req, res) => {
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
      reloadConfig(); // Reload the configuration
      res
        .status(200)
        .json({ success: true, message: "Configuration updated successfully" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Contoh menggunakan Express.js
app.get("/get-new-frame", (req, res) => {
  const newFrames = [
    {
      id: "frame5",
      imageSrc: "../public/images/Group_257.png",
      altText: "Frame 5",
    },
    // Tambahkan frame tambahan jika diperlukan
  ];
  res.json(newFrames);
});
