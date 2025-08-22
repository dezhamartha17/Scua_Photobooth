const card1 = document.getElementById("card1");
const card2 = document.getElementById("card2");
const ornament1 = document.getElementById("ornament1");
const ornament2 = document.getElementById("ornament2");

function resetOrnaments() {
  ornament1.classList.remove("shrink", "expand", "center");
  ornament2.classList.remove("shrink", "expand", "center");
  void ornament1.offsetWidth; // Trigger reflow
  void ornament2.offsetWidth; // Trigger reflow
}

function switchCards() {
  resetOrnaments();
  ornament1.classList.add("shrink", "center");
  ornament2.classList.add("shrink", "center");

  setTimeout(() => {
    ornament1.classList.toggle("card1");
    ornament1.classList.toggle("card2");
    ornament2.classList.toggle("card1");
    ornament2.classList.toggle("card2");

    ornament1.classList.remove("center");
    ornament2.classList.remove("center");
    ornament1.classList.add("expand");
    ornament2.classList.add("expand");

    card1.classList.toggle("active");
    card1.classList.toggle("inactive");
    card2.classList.toggle("active");
    card2.classList.toggle("inactive");
  }, 600);
}

card1.addEventListener("click", switchCards);
card2.addEventListener("click", switchCards);

const backButtons = document.querySelectorAll(".back-button");

backButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const backToSectionId = this.getAttribute("data-back-to");

    // Hide all sections
    document.querySelectorAll("section").forEach((section) => {
      section.classList.add("hidden");
    });

    // Show the target section
    const element = document.getElementById(backToSectionId);
    if (element) {
      element.classList.remove("hidden");
    } else {
      console.warn(`Element with ID "${backToSectionId}" not found.`);
    }

    // Ensure the buttons remain visible
    document.querySelectorAll(".button-container button").forEach((btn) => {
      btn.hidden = false;
    });
  });
});

document.getElementById("start-button").addEventListener("click", function () {
  document.getElementById("welcome-screen").classList.add("hidden");
  document.getElementById("gm-selection").classList.remove("hidden");
});

document.getElementById("config").addEventListener("click", function () {
  document.getElementById("welcome-screen").classList.add("hidden");
  document.getElementById("config-section").classList.remove("hidden");
});

document
  .getElementById("config-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {};

    formData.forEach((value, key) => {
      if (value.trim()) {
        // Hanya tambahkan key-value pair jika value tidak kosong
        data[key] = value;
      }
    });

    if (Object.keys(data).length === 0) {
      Swal.fire(
        "Error",
        "Please fill in at least one field before submitting.",
        "error"
      );
      return;
    }

    fetch("http://localhost:3000/update-config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          Swal.fire("Success", result.message, "success");
        } else {
          Swal.fire("Error", result.message, "error");
        }
      })
      .catch((error) => {
        Swal.fire(
          "Error",
          "An error occurred while updating configuration.",
          "error"
        );
      });
  });

document
  .getElementById("close-config-section")
  .addEventListener("click", function () {
    document.getElementById("config-section").classList.add("hidden");
    document.getElementById("welcome-screen").classList.remove("hidden");
  });

const gmButtons = document.querySelectorAll(".gm-button");
let selectedGM = null;
let selectedPose = "pose1"; // Default ke pose1
let selectedFrame = "frame1"; // Default ke frame1
let selectedFrameUrl = ""; // Variable untuk menyimpan URL frame yang dipilih

// Mengatur event listener untuk memilih GM
// Fungsi untuk memilih GM secara default
function selectDefaultGM() {
  const defaultGMButton = document.querySelector('.gm-button[data-gm="Utut"]');
  defaultGMButton.classList.add("selected");

  selectedGM = defaultGMButton.getAttribute("data-gm");
  const selectedGMImage = defaultGMButton.getAttribute("data-img");

  // Tampilkan gambar Grand Master yang dipilih
  const selectedGMImageElement = document.getElementById("selected-gm-image");
  selectedGMImageElement.src = selectedGMImage;

  // Perbarui pose dan preview frame berdasarkan GM yang dipilih
  updatePoseImages(selectedGM);
  updateFramePreview(selectedFrame, selectedGM, selectedPose);
}

// Event listener untuk semua tombol GM
gmButtons.forEach((button) => {
  button.addEventListener("click", function () {
    gmButtons.forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
    selectedGM = button.getAttribute("data-gm");
    const selectedGMImage = button.getAttribute("data-img");

    // Tampilkan gambar Grand Master yang dipilih
    const selectedGMImageElement = document.getElementById("selected-gm-image");
    selectedGMImageElement.src = selectedGMImage;

    // Update pose images dan frame preview berdasarkan GM yang dipilih
    updatePoseImages(selectedGM);
    updateFramePreview(selectedFrame, selectedGM, selectedPose);
  });
});

window.onload = function () {
  selectDefaultGM(); // Memilih GM Utut secara default
  selectDefaultFrame(); // Memilih frame1 secara default
};

// Mengatur event listener untuk memilih pose
const poseOptions = document.querySelectorAll(".pose-option");
poseOptions.forEach((option) => {
  option.addEventListener("click", function () {
    poseOptions.forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");
    selectedPose = option.getAttribute("data-pose");

    // Update frame preview berdasarkan frame, GM, dan pose yang dipilih
    updateFramePreview(selectedFrame, selectedGM, selectedPose);
  });
});

// Mengatur event listener untuk memilih frame
const frameOptions = document.querySelectorAll(".frame-option");
frameOptions.forEach((option) => {
  option.addEventListener("click", function () {
    frameOptions.forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");
    selectedFrame = option.getAttribute("data-frame");
    selectedFrameUrl = option.querySelector("img").src; // Update URL frame yang dipilih

    // Update frame preview berdasarkan frame, GM, dan pose yang dipilih
    updateFramePreview(selectedFrame, selectedGM, selectedPose);
  });
});

function selectDefaultFrame() {
  const defaultFrameOption = document.querySelector(
    '.frame-option[data-frame="frame1"]'
  );
  defaultFrameOption.classList.add("selected");

  selectedFrame = defaultFrameOption.getAttribute("data-frame");
  selectedFrameUrl = defaultFrameOption.querySelector("img").src; // Update URL frame yang dipilih

  // Update frame preview berdasarkan frame, GM, dan pose yang dipilih
  updateFramePreview(selectedFrame, selectedGM, selectedPose);
}

// Fungsi untuk memperbarui gambar pose
function updatePoseImages(selectedGM) {
  const pose1Image = document.querySelector(
    ".pose-option[data-pose='pose1'] img"
  );
  const pose2Image = document.querySelector(
    ".pose-option[data-pose='pose2'] img"
  );
  if (selectedGM === "Utut") {
    pose1Image.src = "../public/images/gm-pose/Pose 1.png";
    pose2Image.src = "../public/images/gm-pose/Pose 2.svg";
  } else if (selectedGM === "citra") {
    pose1Image.src = "../public/images/gm-pose/Pose 1-4.png";
    pose2Image.src = "../public/images/gm-pose/Pose 2-4.png";
  } else if (selectedGM === "medina") {
    pose1Image.src = "../public/images/gm-pose/Pose 1-3.png";
    pose2Image.src = "../public/images/gm-pose/Pose 2-3.png";
  } else if (selectedGM === "Susanto") {
    pose1Image.src = "../public/images/gm-pose/Pose 1-1.png";
    pose2Image.src = "../public/images/gm-pose/Pose 2-1.png";
  } else if (selectedGM === "Irene") {
    pose1Image.src = "../public/images/gm-pose/Pose 1-2.png";
    pose2Image.src = "../public/images/gm-pose/Pose 2-2.png";
  } else if (selectedGM === "Novendra") {
    pose1Image.src = "../public/images/gm-pose/Pose 1-5.png";
    pose2Image.src = "../public/images/gm-pose/Pose 2-5.png";
  }
}

function updateFramePreview(selectedFrame, selectedGM, selectedPose) {
  const framePreview = document.getElementById("framePreview");
  let previewImageUrl;

  // Menambahkan latar belakang gambar SVG
  const svgBackground = "url('../public/Group 283 (2).svg')";

  // Pastikan GM dan pose sudah dipilih sebelum mengatur URL gambar
  if (selectedGM && selectedPose) {
    previewImageUrl = `../public/frame-gm/${selectedGM}-${selectedPose}-${selectedFrame}.png`;
    framePreview.style.backgroundImage = `url(${previewImageUrl}), ${svgBackground}`;
    document.querySelectorAll(".box").forEach((box) => {
      box.style.backgroundImage = `url(${previewImageUrl}), ${svgBackground} `;
    });
  } else {
    framePreview.style.backgroundImage = svgBackground; // Menyimpan gambar SVG sebagai latar belakang default
    document.querySelectorAll(".box").forEach((box) => {
      box.style.backgroundImage = ""; // Hapus gambar untuk .box jika tidak ada pilihan GM atau pose
    });
  }
}

// Event listener untuk tombol seleksi GM
document
  .getElementById("select-gm-button")
  .addEventListener("click", function () {
    if (selectedGM) {
      document.getElementById("gm-selection").classList.add("hidden");
      document.getElementById("pose-selection").classList.remove("hidden");
    } else {
      document.getElementById("gm-selection").classList.remove("hidden");
      document.getElementById("pose-selection").classList.add("hidden");
      Swal.fire("Error", "Please select a Grand Master.", "error");
    }
  });

// Event listener untuk tombol seleksi pose
document
  .getElementById("select-pose-button")
  .addEventListener("click", function () {
    if (selectedPose) {
      document.getElementById("pose-selection").classList.add("hidden");
      document.getElementById("frame-selection").classList.remove("hidden");

      // Update frame preview dengan pilihan default
      updateFramePreview(selectedFrame, selectedGM, selectedPose);
    } else {
      Swal.fire("Error", "Please select a pose.", "error");
    }
  });

// Event listener untuk tombol seleksi frame
document
  .getElementById("select-frame-button")
  .addEventListener("click", function () {
    if (selectedFrame) {
      document.getElementById("frame-selection").classList.add("hidden");
      document.getElementById("loading-screen").classList.remove("hidden");
    } else {
      Swal.fire("Error", "Please select a frame.", "error");
    }
  });

document
  .getElementById("loading-screen-button")
  .addEventListener("click", function () {
    document.getElementById("loading-screen").classList.add("hidden");
    document.getElementById("take-photos").classList.remove("hidden");
  });

document
  .getElementById("retake-photo-button")
  .addEventListener("click", function () {
    document.getElementById("loading-screen").classList.add("hidden");
    document.getElementById("retake-photos").classList.remove("hidden");
  });

let photoCount = 0;
document
  .getElementById("take-photo-button")
  .addEventListener("click", function () {
    photoCount++;
    if (photoCount < 4) {
      document.getElementById("camera-screen").classList.add("hidden");
    } else {
      document.getElementById("camera-screen").classList.add("hidden");
      document.getElementById("photo-review").classList.remove("hidden");
      document.getElementById("waiting-screen").classList.add("hidden");
      document.getElementById("camera-screen").classList.add("hidden");
      displaySelectedOptions();
    }
  });

document.getElementById("qr-code").addEventListener("click", function () {
  document.getElementById("photo-review").classList.add("hidden");
  document.getElementById("qr-scan").classList.remove("hidden");
});

document
  .getElementById("scan-qr-button")
  .addEventListener("click", function () {
    document.getElementById("qr-scan").classList.add("hidden");
    document.getElementById("photo-review").classList.remove("hidden");
    document.getElementById("approve-photo-button").classList.remove("hidden");
  });

document
  .getElementById("photo-printing")
  .addEventListener("click", function () {
    document.getElementById("photo-review").classList.add("hidden");
    document.getElementById("photo-printing-v2").classList.remove("hidden");

    const photoContainer = document.querySelector(
      ".slider-for .swiper-wrapper"
    );

    // Clear any existing images
    photoContainer.innerHTML = "";

    console.log("Selected Photos:", selectedPhotoSrc); // Debugging line

    // Create and append image elements for each selected photo
    selectedPhotoSrc.forEach((src) => {
      const printingPhoto = document.createElement("img");
      printingPhoto.src = src;
      printingPhoto.classList.add("bouncing"); // Add the bouncing class to apply the animation

      const slideFor = document.createElement("div");
      slideFor.classList.add("swiper-slide");
      slideFor.appendChild(printingPhoto);
      photoContainer.appendChild(slideFor);

      console.log("Adding Photo:", src); // Debugging line

      // Simulate printing process
      setTimeout(() => {
        printPhoto(printingPhoto.src);
      }, 3000); // Simulate 3 seconds of printing process
    });

    // Initialize Swiper instance for the photo-printing-v2 section
    const printingSwiper = new Swiper(".slider-for", {
      slidesPerView: 1.5,
      spaceBetween: 3,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });
  });

// Event listener for selecting photos
document.querySelectorAll(".photo-grid img").forEach((img) => {
  img.addEventListener("click", () => {
    img.classList.toggle("selected");
  });
});

function printPhoto(photoSrc) {
  // Simulate the print action
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`<img src="${photoSrc}" style="width: 100%;">`);
  printWindow.document.close();
  printWindow.print();
  printWindow.close();

  // Reset the application after printing
  resetApplication();
}

function resetApplication() {
  document.getElementById("photo-review").classList.remove("hidden");
  document.getElementById("photo-printing-v2").classList.add("hidden");
  document.getElementById("printing-photo").classList.add("hidden");
  document.getElementById("printing-photo").classList.remove("bouncing");

  // Display thank you message for 3 seconds
  const thankYouMessage = document.createElement("div");
  thankYouMessage.textContent = "Terima kasih telah berfoto bersama kami!";
  thankYouMessage.style.position = "fixed";
  thankYouMessage.style.top = "50%";
  thankYouMessage.style.left = "50%";
  thankYouMessage.style.transform = "translate(-50%, -50%)";
  thankYouMessage.style.padding = "20px";
  thankYouMessage.style.background = "#fff";
  thankYouMessage.style.border = "1px solid #ccc";
  thankYouMessage.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
  thankYouMessage.style.zIndex = "1000";
  document.body.appendChild(thankYouMessage);

  setTimeout(() => {
    // Remove thank you message after 3 seconds
    document.body.removeChild(thankYouMessage);

    // Reload the page to reset the application
    window.location.reload();
  }, 3000); // Display thank you message for 3 seconds
}

// document
//     .getElementById("approve-photo-button")
//     .addEventListener("click", function() {
//         if (selectedPhotos.length === 0) {
//             alert("Harap pilih setidaknya satu foto terlebih dahulu.");
//             return;
//         }

//         // Check if four photos are taken
//         if (totalPhotos.length < 4) {
//             alert("Mohon tunggu hingga semua 4 foto telah diambil.");
//             return;
//         }
//         document.getElementById("photo-review").classList.add("hidden");
//         document.getElementById("email-input").classList.remove("hidden");
//     });

let hasRetaken = false; // Flag to track if retake has already been performed
let photosToRetake = []; // Array to store photos that need to be retaken

document
  .getElementById("retake-photo-button")
  .addEventListener("click", function () {
    if (selectedPose && selectedGM) {
      if (hasRetaken) {
        Swal.fire({
          icon: "warning",
          title: "Pemberitahuan",
          text: "Anda hanya bisa melakukan retake sekali.",
          confirmButtonText: "OK",
        });
        document.getElementById("photo-review").classList.remove("hidden");
        document.getElementById("retake-photos").classList.add("hidden");
        return;
      }

      const allPhotos = document.querySelectorAll(".photo-grid img");
      photosToRetake = []; // reset array foto untuk diambil ulang

      for (let i = 0; i < allPhotos.length; i++) {
        if (!allPhotos[i].classList.contains("selected")) {
          photosToRetake.push(i); // hanya tambahkan yang tidak dipilih ke array
        }
      }

      hasRetaken = true;

      // Tampilkan tampilan "retake-photos" dan sembunyikan "photo-review"
      document.getElementById("photo-review").classList.add("hidden");
      document.getElementById("retake-photos").classList.remove("hidden");

      // Mulai sesi kamera untuk mengambil ulang foto yang dibutuhkan
      startCameraSession(selectedGM, selectedPose, photosToRetake);
    } else {
      alert("Please select both a Grand Master and a pose.");
    }
  });

function startCameraSession(selectedGM, selectedPose, photosToRetake) {
  document.getElementById("loading-screen").classList.add("hidden");
  document.getElementById("retake-photos").classList.remove("hidden");

  photosToRetake.forEach((index) => {
    const photoElement = document.querySelector(
      `.photo-grid img:nth-child(${index + 1})`
    );
    if (photoElement) {
      photoElement.src = ""; // Clear the image source
      photoElement.classList.remove("selected"); // Remove selected class if any
    }
  });

  const video = document.querySelector("#video-webcam");
  const canvas = document.querySelector("#canvas2");
  const context = canvas.getContext("2d");
  const arVideo = document.createElement("video");
  const frameImage = new Image();
  let hasPaused = false;
  let cameraSoundCount = 0;

  arVideo.loop = true;
  arVideo.muted = true;

  const videoSrcMap = {
    citra: {
      pose1: "objek/GM Citra/Video GM - Citra 1.webm",
      default: "objek/GM Citra/Video GM - Citra 2.webm",
    },
    Utut: {
      pose1: "objek/GM Utut/Video GM - Utut 1.webm",
      default: "objek/GM Utut/Video GM - Utut 2 (4).webm",
    },
    medina: {
      pose1: "objek/GM Medina/medina.webm",
      default: "objek/GM Medina/Video GM - Medina 2 (1).webm",
    },
    Susanto: {
      pose1: "objek/GM Susanto/Video GM - SUSANTO.webm",
      default: "objek/GM Susanto/Video GM - SUSANTO 2 (1).webm",
    },
    Irene: {
      pose1: "objek/GM Irene/Video GM - Irene 2.webm",
      default: "objek/GM Irene/Video GM - Irene 1.webm",
    },
    Novendra: {
      pose1: "objek/GM Novendra/Video GM - Novendra 1.webm",
      default: "objek/GM Novendra/Video GM - Novendra 2.webm",
    },
  };

  arVideo.src =
    videoSrcMap[selectedGM][selectedPose] || videoSrcMap[selectedGM].default;

  frameImage.src = selectedFrameUrl;
  frameImage.onload = function () {
    requestAnimationFrame(draw);
  };

  arVideo.onloadeddata = async () => {
    try {
      await arVideo.play();
      console.log("AR video is playing");
      arVideo.playbackRate = 1;
      checkAndPause();
    } catch (error) {
      console.error("Error playing AR video:", error);
    }
  };

  function checkAndPause() {
    const targetTime = 8.1;
    const tolerance = 0.1;

    requestAnimationFrame(() => {
      if (
        Math.abs(arVideo.currentTime - targetTime) < tolerance &&
        !hasPaused
      ) {
        hasPaused = true;
        arVideo.pause();
        console.log(
          `Video paused at ${arVideo.currentTime.toFixed(2)} seconds`
        );
        arVideo.style.visibility = "visible";
        arVideo.style.display = "block";
      } else {
        checkAndPause();
      }
    });
  }

  navigator.mediaDevices
    .getUserMedia({
      video: {
        width: { ideal: 1280 }, // Atur resolusi lebih rendah
        height: { ideal: 720 },
        frameRate: { ideal: 15 }, // Turunkan frame rate jika memungkinkan
      },
    })
    .then(handleVideo)
    .catch(videoError);

  function handleVideo(stream) {
    video.srcObject = stream;
    video.play().catch((error) => {
      console.error("Error playing webcam video:", error);
    });
  }

  function videoError(e) {
    alert("Izinkan menggunakan webcam untuk demo!");
  }

  let arVideoX = parseFloat(localStorage.getItem("arVideoX")) || 0;
  let arVideoY = parseFloat(localStorage.getItem("arVideoY")) || 0;
  let arVideoZ = parseFloat(localStorage.getItem("arVideoZ")) || 0;

  function draw() {
    // Clear the canvas before drawing new frames
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.filter = "contrast(1.2) brightness(1.1) saturate(1.2)";

    // Set the desired canvas size explicitly
    var desiredCanvasWidth = 1205; // Your desired width
    var desiredCanvasHeight = 1795; // Your desired height

    // Set the canvas size explicitly to your desired values
    canvas.width = desiredCanvasWidth;
    canvas.height = desiredCanvasHeight;

    var videoWidth = video.videoWidth;
    var videoHeight = video.videoHeight;

    // Set the width to follow the video height due to 90-degree rotation
    var videoAspect = videoWidth / videoHeight;
    var canvasAspect = desiredCanvasWidth / desiredCanvasHeight;

    // Calculate the scale factor to make the video fill the entire canvas
    var scaleFactor = Math.max(
      desiredCanvasWidth / videoHeight,
      desiredCanvasHeight / videoWidth
    );

    // Calculate new video dimensions after scaling
    var scaledVideoWidth = videoHeight * scaleFactor;
    var scaledVideoHeight = videoWidth * scaleFactor;

    // Save the current context state
    context.save();

    // Move the origin to the center of the canvas and rotate 90 degrees
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(-1, 1);
    context.rotate((270 * Math.PI) / 180); // Rotate 90 degrees to portrait

    // Draw the video with the correct scaling, centered on the canvas
    context.drawImage(
      video,
      -scaledVideoHeight / 2, // Adjust the x position to center
      -scaledVideoWidth / 2, // Adjust the y position to center
      scaledVideoHeight, // Height after scaling
      scaledVideoWidth // Width after scaling
    );

    // Restore context after drawing the video
    context.restore();

    // Handle AR element (without distortion)
    var arAspect = arVideo.videoWidth / arVideo.videoHeight;
    var arScaleFactor = Math.max(
      canvas.width / arVideo.videoWidth,
      canvas.height / arVideo.videoHeight
    );

    var arWidth = arVideo.videoWidth * arScaleFactor;
    var arHeight = arVideo.videoHeight * arScaleFactor;

    // Save the current context state before drawing AR elements
    context.save();
    context.translate(
      (canvas.width - arWidth) / 2 + arVideoX, // Posisi X
      (canvas.height - arHeight) / 2 + arVideoY // Posisi Y
    );
    context.scale(arVideoZ, arVideoZ);

    // Draw AR video if it's ready to play
    if (arVideo.readyState >= 2) {
      context.drawImage(arVideo, 0, 0, arWidth, arHeight);
    }

    // Restore context after drawing AR elements
    context.restore();

    // Draw the selected frame over the video
    context.save();
    context.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
    context.restore();

    // Request the next frame to continue rendering
    requestAnimationFrame(draw);
  }


  function applySharpeningFilter(imageData) {
    const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);
    const src = imageData.data;
    const sw = imageData.width;
    const sh = imageData.height;
    const output = context.createImageData(sw, sh);
    const dst = output.data;

    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const sy = y;
        const sx = x;
        const dstOff = (y * sw + x) * 4;
        let r = 0,
          g = 0,
          b = 0;

        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = sy + cy - halfSide;
            const scx = sx + cx - halfSide;

            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              const srcOff = (scy * sw + scx) * 4;
              const wt = weights[cy * side + cx];
              r += src[srcOff] * wt;
              g += src[srcOff + 1] * wt;
              b += src[srcOff + 2] * wt;
            }
          }
        }

        dst[dstOff] = r;
        dst[dstOff + 1] = g;
        dst[dstOff + 2] = b;
        dst[dstOff + 3] = 255;
      }
    }

    context.putImageData(output, 0, 0);
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  applySharpeningFilter(imageData);

  function moveARVideo(deltaX, deltaY, deltaZ) {
    arVideoX += deltaX;
    arVideoY += deltaY;
    arVideoZ += deltaZ;

    if (arVideoZ <= 0) {
      arVideoZ = 0.1;
    }

    localStorage.setItem("arVideoX", arVideoX);
    localStorage.setItem("arVideoY", arVideoY);
    localStorage.setItem("arVideoZ", arVideoZ);
  }

  moveARVideo(0, 0, 0);

  async function takePhotos() {
    const countdownVideoContainer = document.getElementById(
      "countdown-video-container2"
    );
    const reviewFrames = [
      document.getElementById("captured-photo-1"),
      document.getElementById("captured-photo-2"),
      document.getElementById("captured-photo-3"),
      document.getElementById("captured-photo-4"),
      document.getElementById("captured-photo-5"),
    ];

    photosToRetake.forEach((index) => {
      reviewFrames[index].src = "";
    });
    const videoWebcam = document.getElementById("canvas");
    const delay = 3000;
    let isFirstPhoto = true;

    const delayFunction = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const takeSinglePhoto = async (index) => {
      console.log(`Taking photo ${index + 1}`);
      await delayFunction(index * delay);

      const countdownVideo = document.createElement("video");

      if (index > 0 && !breakPlayed) {
        arVideo.pause();
        countdownVideo.src = "objek/break.webm";
        breakPlayed = true;

        videoWebcam.style.filter = "blur(5px) grayscale(100%)";

        countdownVideo.addEventListener("ended", () => {
          videoWebcam.style.filter = "";
          console.log("AR video paused after break.webm");
          if (!bawahVideoPlayed) {
            const photoVideo = document.getElementById("photo-video2");
            photoVideo.src = "objek/bawah.webm";
            photoVideo.style.display = "block";
            photoVideo.play();
            photoVideo.addEventListener("ended", () => {
              photoVideo.src = "objek/UI motion 4.2.webm";
              photoVideo.loop = true;
              photoVideo.play();
              bawahVideoPlayed = true;
            });
          }
        });
      } else {
        countdownVideo.src =
          index === 0 ? "objek/UI 1.webm" : "objek/UI 2.webm";
      }

      countdownVideo.autoplay = true;
      countdownVideo.muted = true;
      countdownVideo.loop = false;
      countdownVideoContainer.style.display = "block";
      countdownVideoContainer.style.visibility = "visible";
      countdownVideo.style.width = "900px";
      countdownVideo.classList.add("countdown-video");
      countdownVideoContainer.innerHTML = "";
      countdownVideoContainer.appendChild(countdownVideo);

      await new Promise((resolve) => {
        countdownVideo.addEventListener("ended", resolve);
      });

      console.log(`Countdown video ended for photo ${index + 1}`);
      countdownVideoContainer.innerHTML = "";

      if (index > 0) {
        let countdownValue = 4;
        const countdownInterval = setInterval(async () => {
          countdownValue -= 1;

          if (countdownValue === 3) {
            const countdown4Video = document.createElement("video");
            countdown4Video.src = "objek/UI motion 4.1.webm";
            countdown4Video.autoplay = true;
            countdown4Video.muted = true;
            countdown4Video.loop = false;
            countdown4Video.style.width = "1000px";
            countdown4Video.classList.add("countdown-video");

            countdownVideoContainer.innerHTML = "";
            countdownVideoContainer.appendChild(countdown4Video);

            await new Promise((resolve) => {
              countdown4Video.addEventListener("ended", resolve);
            });
            countdownVideoContainer.innerHTML = "";
          }

          if (countdownValue <= -3) {
            clearInterval(countdownInterval);

            const photoDataUrl = canvas.toDataURL("image/png");

            reviewFrames[index].src = photoDataUrl;

            if (cameraSoundCount < 10) {
              const cameraSound = new Audio("objek/camera-250776.mp3");
              cameraSound.play();
              cameraSoundCount++;
            }
            canvas.style.transition =
              "all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
            canvas.style.transform = "scale(1.05)";

            setTimeout(() => {
              canvas.style.transform = "scale(0.2) translate(-50%, -50%)";
              canvas.style.top = "50%";
              canvas.style.left = "50%";
              canvas.style.borderRadius = "10px";
              canvas.style.boxShadow =
                "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)";

              reviewFrames[index].src = photoDataUrl;

              setTimeout(() => {
                canvas.style.transition =
                  "all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
                canvas.style.transform = "scale(1) translate(0, 0)";
                canvas.style.top = "";
                canvas.style.left = "";
                canvas.style.borderRadius = "";
                canvas.style.boxShadow = "";

                setTimeout(() => {
                  canvas.style.transition = "";
                }, 500);
              }, 700);
            }, 200);

            if (index === 4) {
              setTimeout(() => {
                document
                  .getElementById("retake-photos")
                  .classList.add("hidden");
                document
                  .getElementById("photo-review")
                  .classList.remove("hidden");

                stopVideoAndAR();
                cleanupAfterRetake();
              }, 8000);
              arVideo.play();
            }
          }
        }, 1000);
      } else {
        isFirstPhoto = false;
      }
    };
    if (photosToRetake && photosToRetake.length > 0) {
      breakPlayed = false;
      bawahVideoPlayed = false;
      for (let i = 0; i < photosToRetake.length; i++) {
        await takeSinglePhoto(photosToRetake[i]);
      }
    } else {
      for (let i = 0; i < 5; i++) {
        await takeSinglePhoto(i);
      }
    }
  }

  function stopVideoAndAR() {
    let videoTracks = video.srcObject.getTracks();
    videoTracks.forEach((track) => track.stop());
    arVideo.pause();
    arVideo.srcObject = null;
  }

  function cleanupAfterRetake() {
    const canvas = document.getElementById("canvas2");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    countdownVideoContainer.innerHTML = ""; // Hapus semua elemen di container setelah penggunaan

    document.getElementById("countdown-video-container2").style.display =
      "none";
  }

  setTimeout(takePhotos, 5000);
}
document
  .getElementById("scan-qr-button")
  .addEventListener("click", function () {
    document.getElementById("qr-scan").classList.add("hidden");
    document.getElementById("photo-printing").classList.remove("hidden");
  });

const { ipcRenderer } = require("electron");

let currentActiveGM = null;

function selectGM(gmName) {
  const gmButtons = document.querySelectorAll(".gm-button");

  gmButtons.forEach((button) => {
    const img = button.querySelector("img");
    // Set image to inactive state
    img.src = button.getAttribute("data-img-inactive");
    button.classList.remove("active");
  });

  // Find the selected button and update its image to active state
  const selectedButton = document.querySelector(
    `.gm-button[data-gm="${gmName}"]`
  );
  if (selectedButton) {
    const img = selectedButton.querySelector("img");
    img.src = selectedButton.getAttribute("data-img-active");
    selectedButton.classList.add("active");
    currentActiveGM = gmName;
  }
}

let animationFrameId;
document
  .getElementById("loading-screen-button")
  .addEventListener("click", async function () {
    if (selectedPose && selectedGM) {
      document.getElementById("loading-screen").classList.add("hidden");
      document.getElementById("take-photos").classList.remove("hidden");

      const video = document.querySelector("#video-webcam");
      const canvas = document.querySelector("#canvas");
      const context = canvas.getContext("2d");
      const arVideo = document.createElement("video");
      const frameImage = new Image();
      let hasPaused = false;
      let cameraSoundCount = 0;

      arVideo.loop = true;
      arVideo.muted = true;

      const videoSrcMap = {
        citra: {
          pose1: "objek/GM Citra/Video GM - Citra 1.webm",
          default: "objek/GM Citra/Video GM - Citra 2.webm",
        },
        Utut: {
          pose1: "objek/GM Utut/Video GM - UTUT 1.webm",
          default: "objek/GM Utut/Video GM - UTUT 2_1.webm",
        },
        medina: {
          pose1: "objek/GM Medina/Video GM - MEDINA 1.webm",
          default: "objek/GM Medina/Video GM - Medina 2.webm",
        },
        Susanto: {
          pose1: "objek/GM Susanto/Video GM - SUSANTO 1.webm",
          default: "objek/GM Susanto/Video GM - SUSANTO 2 2.webm",
        },
        Irene: {
          pose1: "objek/GM Irene/Video GM - IRENE 2.webm",
          default: "objek/GM Irene/Video GM - IRENE 1.webm",
        },
        Novendra: {
          pose1: "objek/GM Novendra/Video GM - NOVENDRA 1.webm",
          default: "objek/GM Novendra/Video GM - NOVENDRA 2.webm",
        },
      };

      arVideo.src =
        videoSrcMap[selectedGM][selectedPose] ||
        videoSrcMap[selectedGM].default;

      frameImage.src = selectedFrameUrl;
      frameImage.onload = function () {
        requestAnimationFrame(draw);
      };

      arVideo.onloadeddata = async () => {
        try {
          // Play the AR video when it's ready
          await arVideo.play();
          console.log("AR video is playing");

          arVideo.playbackRate = 1;

          checkAndPause();
        } catch (error) {
          console.error("Error playing AR video:", error);
        }
      };

      // Function to check and pause at 8.1 seconds
      function checkAndPause() {
        const targetTime = 8.1;
        const tolerance = 0.1; // Tolerance for pausing

        // Use requestAnimationFrame for smooth checking
        requestAnimationFrame(() => {
          // Check if currentTime is within the target range
          if (
            Math.abs(arVideo.currentTime - targetTime) < tolerance &&
            !hasPaused
          ) {
            hasPaused = true; // Set to true to avoid multiple pauses
            arVideo.pause(); // Pause the video
            console.log(
              `Video paused at ${arVideo.currentTime.toFixed(2)} seconds`
            );

            // Ensure the video remains visible after pausing
            arVideo.style.visibility = "visible"; // Make sure the video is visible
            arVideo.style.display = "block"; // Ensure display is not none
          } else {
            // Continue checking until the target time is reached
            checkAndPause(); // Recursively call until paused
          }
        });
      }

      // Helper function for delay
      function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      // Event listener untuk memperbarui waktu
      // arVideo.addEventListener("timeupdate", function() {
      //     var cTime = arVideo.currentTime;

      //     // Menjeda video pada waktu 8.9 detik
      //     if (Math.abs(cTime - 8.9) < 0.1) {
      //         arVideo.pause();
      //         console.log("Video paused at 8.9 seconds and will not resume");
      //         // Hapus setTimeout untuk mencegah video diputar kembali
      //     }
      // });

      navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { ideal: 1920 }, // Atur resolusi lebar (ideal)
            height: { ideal: 1080 }, // Atur resolusi tinggi (ideal)
            frameRate: { ideal: 30 }, // Atur frame rate yang stabil
          },
        })
        .then(handleVideo)
        .catch(videoError);

      function handleVideo(stream) {
        video.srcObject = stream;
        video.play().catch((error) => {
          console.error("Error playing webcam video:", error);
        });
      }

      function videoError(e) {
        alert("Izinkan menggunakan webcam untuk demo!");
      }

      let arVideoX = parseFloat(localStorage.getItem("arVideoX")) || 0;
      let arVideoY = parseFloat(localStorage.getItem("arVideoY")) || 0;
      let arVideoZ = parseFloat(localStorage.getItem("arVideoZ")) || 0;

      function draw() {
        // Clear the canvas before drawing new frames
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.filter = "contrast(1.2) brightness(1.1) saturate(1.2)";

        // Set the desired canvas size explicitly
        var desiredCanvasWidth = 1205; // Your desired width
        var desiredCanvasHeight = 1795; // Your desired height

        // Set the canvas size explicitly to your desired values
        canvas.width = desiredCanvasWidth;
        canvas.height = desiredCanvasHeight;

        var videoWidth = video.videoWidth;
        var videoHeight = video.videoHeight;

        // Set the width to follow the video height due to 90-degree rotation
        var videoAspect = videoWidth / videoHeight;
        var canvasAspect = desiredCanvasWidth / desiredCanvasHeight;

        // Calculate the scale factor to make the video fill the entire canvas
        var scaleFactor = Math.max(
          desiredCanvasWidth / videoHeight,
          desiredCanvasHeight / videoWidth
        );

        // Calculate new video dimensions after scaling
        var scaledVideoWidth = videoHeight * scaleFactor;
        var scaledVideoHeight = videoWidth * scaleFactor;

        // Save the current context state
        context.save();

        // Move the origin to the center of the canvas and rotate 90 degrees
        context.translate(canvas.width / 2, canvas.height / 2);
        context.scale(-1, 1);
        context.rotate((270 * Math.PI) / 180); // Rotate 90 degrees to portrait

        // Draw the video with the correct scaling, centered on the canvas
        context.drawImage(
          video,
          -scaledVideoHeight / 2, // Adjust the x position to center
          -scaledVideoWidth / 2, // Adjust the y position to center
          scaledVideoHeight, // Height after scaling
          scaledVideoWidth // Width after scaling
        );

        // Restore context after drawing the video
        context.restore();

        // Handle AR element (without distortion)
        var arAspect = arVideo.videoWidth / arVideo.videoHeight;
        var arScaleFactor = Math.max(
          canvas.width / arVideo.videoWidth,
          canvas.height / arVideo.videoHeight
        );

        var arWidth = arVideo.videoWidth * arScaleFactor;
        var arHeight = arVideo.videoHeight * arScaleFactor;

        // Save the current context state before drawing AR elements
        context.save();
        context.translate(
          (canvas.width - arWidth) / 2 + arVideoX, // Posisi X
          (canvas.height - arHeight) / 2 + arVideoY // Posisi Y
        );
        context.scale(arVideoZ, arVideoZ);

        // Draw AR video if it's ready to play
        if (arVideo.readyState >= 2) {
          context.drawImage(arVideo, 0, 0, arWidth, arHeight);
        }

        // Restore context after drawing AR elements
        context.restore();

        // Draw the selected frame over the video
        context.save();
        context.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        context.restore();

        // Request the next frame to continue rendering
        requestAnimationFrame(draw);
      }

      function applySharpeningFilter(imageData) {
        const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        const side = Math.round(Math.sqrt(weights.length));
        const halfSide = Math.floor(side / 2);
        const src = imageData.data;
        const sw = imageData.width;
        const sh = imageData.height;
        const output = context.createImageData(sw, sh);
        const dst = output.data;

        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const sy = y;
            const sx = x;
            const dstOff = (y * sw + x) * 4;
            let r = 0,
              g = 0,
              b = 0;

            for (let cy = 0; cy < side; cy++) {
              for (let cx = 0; cx < side; cx++) {
                const scy = sy + cy - halfSide;
                const scx = sx + cx - halfSide;

                if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                  const srcOff = (scy * sw + scx) * 4;
                  const wt = weights[cy * side + cx];
                  r += src[srcOff] * wt;
                  g += src[srcOff + 1] * wt;
                  b += src[srcOff + 2] * wt;
                }
              }
            }

            dst[dstOff] = r;
            dst[dstOff + 1] = g;
            dst[dstOff + 2] = b;
            dst[dstOff + 3] = 255; // Alpha
          }
        }

        context.putImageData(output, 0, 0);
      }

      // Terapkan filter setelah mengambil gambar
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      applySharpeningFilter(imageData);

      function moveARVideo(deltaX, deltaY, deltaZ) {
        arVideoX += deltaX;
        arVideoY += deltaY;
        arVideoZ += deltaZ;

        // Ensure scale is not too small
        if (arVideoZ <= 0) {
          arVideoZ = 0.1;
        }

        // Save settings to localStorage for persistence
        localStorage.setItem("arVideoX", arVideoX);
        localStorage.setItem("arVideoY", arVideoY);
        localStorage.setItem("arVideoZ", arVideoZ);
      }

      // Example usage
      moveARVideo(0, 0, 0);

      // arVideo.addEventListener("timeupdate", function() {
      //     var cTime = arVideo.currentTime;
      //     if (Math.abs(cTime - 8.9) < 0.1) {
      //         arVideo.pause();
      //         setTimeout(function() {
      //             arVideo.play();
      //         }, 1000);
      //     }
      // });

      async function takePhotos() {
        const countdownVideoContainer = document.getElementById(
          "countdown-video-container"
        );
        const reviewFrames = [
          document.getElementById("captured-photo-1"),
          document.getElementById("captured-photo-2"),
          document.getElementById("captured-photo-3"),
          document.getElementById("captured-photo-4"),
          document.getElementById("captured-photo-5"),
        ];

        const videoWebcam = document.getElementById("canvas");
        const delay = 3000;
        let isFirstPhoto = true;
        let breakPlayed = false;
        let bawahVideoPlayed = false;

        // Ensure photoCounter is selected correctly
        let photoCounter = document.getElementById("photo-counter");
        if (!photoCounter) {
          photoCounter = document.createElement("div");
          photoCounter.id = "photo-counter";
          photoCounter.className = "photo-counter";
          document.body.appendChild(photoCounter); // Append to body or another container
        }

        // Function to update counter
        const updatePhotoCounter = (current) => {
          if (current >= 2 && current <= 5) {
            const adjustedCount = current - 1;
            photoCounter.innerHTML = `<span>${adjustedCount}</span> dari 4 foto`;
            photoCounter.style.opacity = "1";
          }
        };

        const delayFunction = (ms) =>
          new Promise((resolve) => setTimeout(resolve, ms));

        const takeSinglePhoto = async (index) => {
          if (index > 1 && index <= 4) {
            updatePhotoCounter(index);
          }
          console.log(`Taking photo ${index + 1}`);
          await delayFunction(index * delay);

          const countdownVideo = document.createElement("video");

          if (index > 0 && !breakPlayed) {
            arVideo.pause();
            countdownVideo.src = "objek/break.webm";
            breakPlayed = true;

            videoWebcam.style.filter = "blur(5px) grayscale(100%)";

            countdownVideo.addEventListener("ended", () => {
              videoWebcam.style.filter = "";
              console.log("AR video paused after break.webm");
              if (!bawahVideoPlayed) {
                const photoVideo = document.getElementById("photo-video");
                photoVideo.src = "objek/bawah.webm";
                photoVideo.style.display = "block";
                photoVideo.play();
                photoVideo.addEventListener("ended", () => {
                  photoVideo.src = "objek/UI motion 4.2.webm";
                  photoVideo.loop = true;
                  photoVideo.play();
                  bawahVideoPlayed = true;
                });
              }
            });
          } else {
            countdownVideo.src =
              index === 0 ? "objek/UI 1.webm" : "objek/UI 2.webm";
          }

          countdownVideo.autoplay = true;
          countdownVideo.muted = true;
          countdownVideo.loop = false;
          countdownVideo.style.width = "800px";
          countdownVideo.classList.add("countdown-video");
          countdownVideoContainer.innerHTML = "";
          countdownVideoContainer.appendChild(countdownVideo);

          await new Promise((resolve) => {
            countdownVideo.addEventListener("ended", resolve);
          });

          console.log(`Countdown video ended for photo ${index + 1}`);
          countdownVideoContainer.innerHTML = "";

          if (index > 0) {
            let countdownValue = 4;
            const countdownInterval = setInterval(async () => {
              countdownValue -= 1;

              if (countdownValue === 3) {
                const countdown4Video = document.createElement("video");
                countdown4Video.src = "objek/UI motion 4.1.webm";
                countdown4Video.autoplay = true;
                countdown4Video.muted = true;
                countdown4Video.loop = false;
                countdown4Video.style.width = "1000px";
                countdown4Video.classList.add("countdown-video");

                countdownVideoContainer.innerHTML = "";
                countdownVideoContainer.appendChild(countdown4Video);

                await new Promise((resolve) => {
                  countdown4Video.addEventListener("ended", resolve);
                });
                countdownVideoContainer.innerHTML = "";
              }

              if (countdownValue <= -3) {
                clearInterval(countdownInterval); // Stop the countdown

                // Capture the photo and display it in the review frame
                const photoDataUrl = canvas.toDataURL("image/png");

                reviewFrames[index].src = photoDataUrl;

                if (cameraSoundCount < 10) {
                  const cameraSound = new Audio("objek/camera-250776.mp3");
                  cameraSound.play();
                  cameraSoundCount++; // Increment the counter
                }

                if (index === 3) {
                  setTimeout(() => {
                    updatePhotoCounter(5); // Langsung update ke 4 dari 4
                  }, 200);
                } else if (index >= 1 && index < 3) {
                  setTimeout(() => {
                    updatePhotoCounter(index + 1);
                  }, 200);
                }
                canvas.style.transition =
                  "all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
                canvas.style.transform = "scale(1.05)"; // Slight zoom effect

                setTimeout(() => {
                  canvas.style.transform = "scale(0.2) translate(-50%, -50%)";
                  canvas.style.top = "50%";
                  canvas.style.left = "50%";
                  canvas.style.borderRadius = "10px";
                  canvas.style.boxShadow =
                    "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)";

                  // Display the captured photo in the review frame
                  reviewFrames[index].src = photoDataUrl;

                  // Reset canvas style after animation
                  setTimeout(() => {
                    canvas.style.transition =
                      "all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
                    canvas.style.transform = "scale(1) translate(0, 0)";
                    canvas.style.top = "";
                    canvas.style.left = "";
                    canvas.style.borderRadius = "";
                    canvas.style.boxShadow = "";

                    // Remove transition after reset to avoid affecting future manipulations
                    setTimeout(() => {
                      canvas.style.transition = "";
                    }, 500);
                  }, 700); // Increased delay before resetting
                }, 200); // Short delay after the initial zoom

                if (index === 4) {
                  setTimeout(() => {
                    document
                      .getElementById("take-photos")
                      .classList.add("hidden");
                    document
                      .getElementById("photo-review")
                      .classList.remove("hidden");

                    // Stop the webcam and AR video after the last photo
                    stopVideoAndAR();
                  }, 9000);
                  arVideo.play();
                }
              }
            }, 1000);
          } else {
            isFirstPhoto = false;
          }
        };

        // Jika ini adalah sesi retake, hanya ambil foto yang perlu diambil ulang
        if (photosToRetake && photosToRetake.length > 0) {
          for (let i = 0; i < photosToRetake.length; i++) {
            await takeSinglePhoto(photosToRetake[i]);
          }
        } else {
          // Jika bukan sesi retake, ambil semua foto
          for (let i = 0; i < 5; i++) {
            await takeSinglePhoto(i);
          }
        }
      }

      function stopVideoAndAR() {
        // Hentikan stream video dari webcam
        const video = document.querySelector("#video-webcam");
        const stream = video.srcObject;
        const tracks = stream.getTracks();

        tracks.forEach(function (track) {
          track.stop();
        });

        // Hentikan rendering dengan requestAnimationFrame
        cancelAnimationFrame(draw);

        // Refresh the canvas
        const canvas = document.querySelector("#canvas");
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        countdownVideoContainer.innerHTML = ""; // Hapus semua elemen di container setelah penggunaan

        // Optionally, redraw any necessary elements here
        // For example, you might want to redraw the background or any static elements
        // drawBackground(); // Uncomment and implement this if needed
      }

      setTimeout(takePhotos, 5000);

      document
        .getElementById("open-ar-settings")
        .addEventListener("click", function () {
          document
            .getElementById("ar-settings-modal")
            .classList.remove("hidden");
        });

      document
        .getElementById("close-modal")
        .addEventListener("click", function () {
          document.getElementById("ar-settings-modal").classList.add("hidden");
        });

      document
        .getElementById("slider-x")
        .addEventListener("input", function () {
          arVideoX = parseFloat(this.value);
          document.getElementById("value-x").textContent = arVideoX;
          localStorage.setItem("arVideoX", arVideoX);
          requestAnimationFrame(draw);
        });

      document
        .getElementById("slider-y")
        .addEventListener("input", function () {
          arVideoY = parseFloat(this.value);
          document.getElementById("value-y").textContent = arVideoY;
          localStorage.setItem("arVideoY", arVideoY);
          requestAnimationFrame(draw);
        });

      document
        .getElementById("slider-z")
        .addEventListener("input", function () {
          arVideoZ = parseFloat(this.value);
          document.getElementById("value-z").textContent = arVideoZ;
          localStorage.setItem("arVideoZ", arVideoZ);
          requestAnimationFrame(draw);
        });

      document
        .getElementById("save-settings")
        .addEventListener("click", function () {
          arVideoX = parseFloat(document.getElementById("slider-x").value);
          arVideoY = parseFloat(document.getElementById("slider-y").value);
          arVideoZ = parseFloat(document.getElementById("slider-z").value);

          localStorage.setItem("arVideoX", arVideoX);
          localStorage.setItem("arVideoY", arVideoY);
          localStorage.setItem("arVideoZ", arVideoZ);

          console.log("Settings saved:", arVideoX, arVideoY, arVideoZ); // Log saved settings

          document.getElementById("ar-settings-modal").classList.add("hidden");
          requestAnimationFrame(draw); // Ensure the canvas is redrawn with the new settings
        });

      document
        .getElementById("cancel-settings")
        .addEventListener("click", function () {
          document.getElementById("ar-settings-modal").classList.add("hidden");
          // Optionally, you could reload the saved settings here
        });

      document
        .getElementById("reset-settings")
        .addEventListener("click", function () {
          arVideoX = 0;
          arVideoY = 0;
          arVideoZ = 0.9;

          document.getElementById("slider-x").value = arVideoX;
          document.getElementById("slider-y").value = arVideoY;
          document.getElementById("slider-z").value = arVideoZ;

          document.getElementById("value-x").textContent = arVideoX;
          document.getElementById("value-y").textContent = arVideoY;
          document.getElementById("value-z").textContent = arVideoZ;

          localStorage.setItem("arVideoX", arVideoX);
          localStorage.setItem("arVideoY", arVideoY);
          localStorage.setItem("arVideoZ", arVideoZ);

          requestAnimationFrame(draw); // Ensure the canvas is redrawn with the reset values
        });

      // Apply saved settings when the page loads
      window.addEventListener("load", function () {
        // Try to get saved values, fallback to default if not found
        const savedX = localStorage.getItem("arVideoX");
        const savedY = localStorage.getItem("arVideoY");
        const savedZ = localStorage.getItem("arVideoZ");

        arVideoX = savedX !== null ? parseFloat(savedX) : 0;
        arVideoY = savedY !== null ? parseFloat(savedY) : 0;
        arVideoZ = savedZ !== null ? parseFloat(savedZ) : 0.9;

        document.getElementById("slider-x").value = arVideoX;
        document.getElementById("slider-y").value = arVideoY;
        document.getElementById("slider-z").value = arVideoZ;

        document.getElementById("value-x").textContent = arVideoX;
        document.getElementById("value-y").textContent = arVideoY;
        document.getElementById("value-z").textContent = arVideoZ;

        // Ensure the canvas is redrawn with the saved settings
        requestAnimationFrame(draw);
      });
    } else {
      alert("Pilih pose dan frame terlebih dahulu.");
    }
  });

let photoCounter = 0;

document.getElementById("take-photo-button").addEventListener("click", () => {
  ipcRenderer.send("open-camera-window");
});

let selectedPhotoSrc = []; // Array to store selected photo sources

// Function to handle the photo approval process
document
  .getElementById("approve-photo-button")
  .addEventListener("click", () => {
    const selectedPhotos = document.querySelectorAll(
      ".photo-grid img.selected"
    );
    const totalPhotos = document.querySelectorAll(".photo-grid img");

    if (selectedPhotos.length === 0) {
      Swal.fire(
        "Error",
        "Harap pilih setidaknya satu foto terlebih dahulu.",
        "error"
      );
      return;
    }

    // Check if four photos are taken
    if (totalPhotos.length < 4) {
      Swal.fire(
        "Error",
        "Mohon tunggu hingga semua 4 foto telah diambil.",
        "error"
      );
      return;
    }

    // Initialize Swiper.js
    const swiperContainer = document.querySelector(".slider-for");
    const swiperWrapper = swiperContainer.querySelector(".swiper-wrapper");

    // Clear previous Swiper slides
    swiperWrapper.innerHTML = "";

    // Initialize Swiper instance
    const swiper = new Swiper(swiperContainer, {
      slidesPerView: "auto", // Show multiple slides at once
      spaceBetween: 10, // Space between slides
      loop: true, // Loop slides
      // Add additional Swiper options here
    });

    const photoContainer = document.querySelector(
      "#photo-printing-v2 .swiper-wrapper"
    );
    photoContainer.innerHTML = ""; // Clear previous selections in photo-printing-v2

    selectedPhotoSrc = []; // Clear previous selections
    selectedPhotos.forEach((img) => {
      const imgCloneFor = img.cloneNode();
      imgCloneFor.classList.remove("captured-photo", "selected");
      const slideFor = document.createElement("div");
      slideFor.classList.add("swiper-slide");
      slideFor.appendChild(imgCloneFor);
      swiperWrapper.appendChild(slideFor);

      const imgClonePrinting = img.cloneNode(); // Clone for photo-printing-v2
      imgClonePrinting.classList.add("printing-photo"); // Add any necessary classes for styling
      photoContainer.appendChild(imgClonePrinting); // Append to photo-printing-v2

      // Store selected photo src in the array
      selectedPhotoSrc.push(img.src);
    });

    // Update Swiper after adding slides
    swiper.update();

    // Trigger animation by adding a class
    photoContainer.classList.add("animate");

    // Transition to the next section
    document.getElementById("photo-review").classList.add("hidden");
    document.getElementById("email-input").classList.remove("hidden");

    // Remove the animation class after animation completes to reset state
    setTimeout(() => {
      photoContainer.classList.remove("animate");
    }, 2000); // Adjust timing to match animation duration
  });

// document.getElementById("approve-photo-button").addEventListener("click", () => {
//     document.getElementById("photo-review").classList.add("hidden");
//     document.getElementById("email-input").classList.remove("hidden");
// });

document
  .getElementById("submit-email-button")
  .addEventListener("click", function () {
    const email = document.getElementById("email").value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email pattern for validation

    if (email && emailPattern.test(email)) {
      Swal.fire({
        title: "Apakah email Anda sudah benar?",
        text: email,
        showCancelButton: false,
        confirmButtonColor: "#8B4513", // Warna tombol konfirmasi
        cancelButtonColor: "#d33", // Warna tombol cancel
        confirmButtonText: "Kirim & Cetak Foto",
        customClass: {
          popup: "custom-swal", // Menggunakan class kustom Swal
          footer: "custom-swal", // Jika sudut ingin muncul di bawah juga
        },
        position: "top", // Mengatur posisi modal
        showClass: {
          popup: "swal2-noanimation", // Custom show animation
        },
        // Mengatur jarak dari atas layar
        target: document.body,
        willOpen: () => {
          document.querySelector(".swal2-popup").style.top = "60vh";
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Hide email input section and show QR code payment section
          document.getElementById("email-input").classList.add("hidden");
          document.getElementById("qr-scan").classList.remove("hidden");
        }
      });
    } else {
      alert("Please enter a valid email address.");
    }
  });

function resetApp() {
  photoCounter = 0;
  document.querySelectorAll(".photo-grid img").forEach((img) => {
    img.src = "";
  });
  document.querySelectorAll(".photo-grid img").forEach((img) => {
    img.classList.remove("selected");
  });
  document.getElementById("approve-photo-button").classList.add("hidden");
  document.getElementById("camera-screen").classList.remove("hidden");
}

// function displaySelectedOptions() {
//     const reviewSection = document.getElementById("photo-review");
//     const selectedGMElement = document.createElement("p");
//     selectedGMElement.textContent = "Selected Grand Master: " + selectedGM;
//     reviewSection.appendChild(selectedGMElement);

//     const selectedPoseElement = document.createElement("p");
//     selectedPoseElement.textContent = "Selected Pose: " + selectedPose;
//     reviewSection.appendChild(selectedPoseElement);

//     const selectedFrameElement = document.createElement("p");
//     selectedFrameElement.textContent = "Selected Frame: " + selectedFrame;
//     reviewSection.appendChild(selectedFrameElement);
// }

// const qrCodeButton = document.getElementById('qr-code');
// const approvePhotoButton = document.getElementById('approve-photo-button');
// const retakePhotoButton = document.getElementById('retake-photo-button');
// const photoPrintingButton = document.getElementById('photo-printing');
// const photoReviewSection = document.getElementById('photo-review');
// const qrScanSection = document.getElementById('qr-scan'); // Tambahan variabel untuk qr-scan section

// qrCodeButton.addEventListener('click', () => {
//     qrCodeButton.classList.add('hidden');
//     approvePhotoButton.classList.remove('hidden');
// });

// approvePhotoButton.addEventListener('click', () => {
//     approvePhotoButton.classList.add('hidden');
//     retakePhotoButton.classList.add('hidden');
//     photoPrintingButton.classList.remove('hidden');
// });

// photoPrintingButton.addEventListener('click', () => {
//     photoReviewSection.classList.add('hidden');
//     photoPrintingButton.classList.remove('hidden');

// });

// retakePhotoButton.addEventListener('click', () => {
//     // Tambahkan logika untuk mengambil foto kembali jika diperlukan
// });

function simulatePrinting() {
  setTimeout(() => {
    // Simulasi selesai mencetak setelah 3 detik
    photoPrintingSection.innerHTML = "<h2>Printing Complete!</h2>";
    const backButton = document.createElement("button");
    backButton.textContent = "Back";
    backButton.classList.add("back-button");
    backButton.setAttribute("data-back-to", "qr-scan"); // Ganti sesuai dengan bagian yang benar
    backButton.addEventListener("click", () => {
      // Kembalikan ke bagian sebelumnya setelah tombol kembali ditekan
      photoPrintingSection.classList.add("hidden");
      photoReviewSection.classList.remove("hidden");
    });
    photoPrintingSection.appendChild(backButton);
  }, 3000); // Simulasi waktu pencetakan 3 detik
}

//test petern
// const background = document.getElementById('gm-selection');
//   const numImages = 5; // Number of images to place
//   const imageSources = [
//     '../public/images/Abadikan dan bagikan pengalamanmu!.png',
//     '../public/images/Abadikan dan bagikan pengalamanmu!.png',
//     // Add more image paths
//   ];

//   for (let i = 0; i < numImages; i++) {
//     const img = document.createElement('img');
//     img.src = imageSources[Math.floor(Math.random() * imageSources.length)];
//     img.className = 'img1'; // Apply the img1 class

//     const randomX = (Math.random() * 200 - 100) + 'vw';
//     const randomY = (Math.random() * 200 - 100) + 'vh';
//     const randomDuration = (Math.random() * 20 + 5) + 's';

//     img.style.setProperty('--random-x', randomX);
//     img.style.setProperty('--random-y', randomY);
//     img.style.setProperty('--random-duration', randomDuration);

//     img.style.top = Math.random() * 100 + '%';
//     img.style.left = Math.random() * 100 + '%';

//     background.appendChild(img);
//   }

document.querySelector(".restart-application").addEventListener("click", () => {
  ipcRenderer.send("restart-application");
});

ipcRenderer.on("perform-restart", () => {
  ipcRenderer.send("perform-restart");
});

// Initialize the keyboard
const Keyboard = window.SimpleKeyboard.default;
let isCapsLockActive = false;
let isLocked = false;

const keyboard = new Keyboard({
  onChange: (input) => onChange(input),
  onKeyPress: (button) => onKeyPress(button),
  layout: {
    default: [
      "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
      "{tab} q w e r t y u i o p [ ] \\",
      "a s d f g h j k l ; ' {enter}",
      "{shift} z x c v b n m , . / {shift}",
      "{@gmail.com} {symbols}",
    ],
    shift: [
      "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
      "{tab} Q W E R T Y U I O P { } |",
      'A S D F G H J K L : " {enter}',
      "{shift} Z X C V B N M < > ? {shift}",
      "{@gmail.com} {symbols}",
    ],
    numbers: [
      "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
      "{tab} q w e r t y u i o p [ ] \\",
      "a s d f g h j k l ; ' {enter}",
      "{shift} z x c v b n m , . / {shift}",
      "{@gmail.com} {symbols}",
    ],
    symbols: [
      "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
      "{tab} Q W E R T Y U I O P { } |",
      'A S D F G H J K L : " {enter}',
      "{shift} Z X C V B N M < > ? {shift}",
      "{@gmail.com} {numbers}",
    ],
  },
  display: {
    "{bksp}": "⌫",
    "{enter}": "⏎",
    "{shift}": "⇧",
    "{@gmail.com}": "@gmail.com",
    "{tab}": "⇥",
    "{numbers}": "123",
    "{symbols}": "#+=",
    "{abc}": "ABC",
  },
});

function onChange(input) {
  document.getElementById("email").value = input;
}

function onKeyPress(button) {
  console.log("Button pressed", button);

  if (button === "{shift}" || button === "{capslock}") handleShift();
  if (button === "{numbers}") handleNumbers();
  if (button === "{symbols}") handleSymbols();
  if (button === "{abc}") handleABC();

  // Jika tombol @gmail.com ditekan, tambahkan ke input email
  if (button === "{@gmail.com}") {
    let emailInput = document.getElementById("email");
    emailInput.value += "@gmail.com";
    keyboard.setInput(emailInput.value); // Update input di keyboard
  }

  if (button === "{enter}") {
    document.getElementById("submit-email-button").click();
  }
}

function handleShift() {
  let currentLayout = keyboard.options.layoutName;
  let shiftToggle = currentLayout === "default" ? "shift" : "default";
  keyboard.setOptions({
    layoutName: shiftToggle,
  });
}

function handleNumbers() {
  keyboard.setOptions({
    layoutName: "numbers",
  });
}

function handleSymbols() {
  keyboard.setOptions({
    layoutName: "symbols",
  });
}

function handleABC() {
  keyboard.setOptions({
    layoutName: "default",
  });
}

// Attach the keyboard to the input field
document.getElementById("email").addEventListener("focus", () => {
  keyboard.setInput(document.getElementById("email").value);
  keyboard.open();
});

document.getElementById("email").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent default form submission behavior
    document.getElementById("submit-email-button").click();
  }
});

document.getElementById("email").addEventListener("blur", () => {
  keyboard.close();
});

// Function to adjust keyboard size on window resize
function adjustKeyboardSize() {
  const keyboardContainer = document.querySelector(".simple-keyboard");
  if (keyboardContainer) {
    keyboardContainer.style.width = "900vh";
    keyboardContainer.style.height = "auto";
  }
}

// Call adjustKeyboardSize on window resize
window.addEventListener("resize", adjustKeyboardSize);

// Initial adjustment
adjustKeyboardSize();

document
  .getElementById("show-modal-button")
  .addEventListener("click", function () {
    document.getElementById("config-modal").classList.remove("hidden");
  });
document
  .getElementById("close-modal-button")
  .addEventListener("click", function () {
    document.getElementById("config-modal").classList.add("hidden");
  });

document
  .getElementById("config-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const googleKeyFilePath =
      document.getElementById("googleKeyFilePath").value;
    const googleDriveFolderId = document.getElementById(
      "googleDriveFolderId"
    ).value;
    const emailUser = document.getElementById("emailUser").value;
    const emailPass = document.getElementById("emailPass").value;
    const midtransServerKey =
      document.getElementById("midtransServerKey").value;
    const midtransClientKey =
      document.getElementById("midtransClientKey").value;

    // Update .env file or server configuration with new values
    // You might want to send this data to your server here using fetch or AJAX

    console.log("Updated values:", {
      googleKeyFilePath,
      googleDriveFolderId,
      emailUser,
      emailPass,
      midtransServerKey,
      midtransClientKey,
    });

    document.getElementById("config-modal").classList.add("hidden");
  });
