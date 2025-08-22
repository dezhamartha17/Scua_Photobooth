// const cards = document.querySelectorAll(".card");

// cards.forEach((card) => {
//     card.addEventListener("click", () => {
//         const maxZIndex = Math.max(
//             ...Array.from(cards).map((c) =>
//                 parseInt(window.getComputedStyle(c).zIndex)
//             )
//         );

//         // Set all cards to have a z-index one less than maxZIndex
//         cards.forEach((c) => {
//             c.style.zIndex = maxZIndex - 1;
//             c.classList.remove("active");
//         });

//         // Set the clicked card to have the highest z-index
//         card.style.zIndex = maxZIndex;
//         card.classList.add("active");

//         // Adjust the transform property to maintain the overlap effect
//         cards.forEach((c) => {
//             if (c !== card) {
//                 c.style.transform = `translate(60px, -30px)`;
//             } else {
//                 c.style.transform = `translate(0px, 0px)`;
//             }
//         });
//     });
// });
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
    pose2Image.src = "../public/images/gm-pose/Pose 2.png";
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
        alert("You have already retaken the photos once.");
        document.getElementById("photo-review").classList.remove("hidden");
        document.getElementById("take-photos").classList.add("hidden");
        return;
      }

      const photoElements = document.querySelectorAll(".photo-grid img");
      photosToRetake = [];

      // Hanya tambahkan foto yang tidak dipilih ke dalam photosToRetake
      photoElements.forEach((img, index) => {
        if (!img.classList.contains("selected")) {
          photosToRetake.push(index + 1);
        }
      });

      if (photosToRetake.length > 0) {
        hasRetaken = true;

        // Restart aplikasi kembali ke loading-screen
        document.getElementById("loading-screen").classList.remove("hidden");
        document.getElementById("photo-review").classList.add("hidden");
        document.getElementById("take-photos").classList.add("hidden");

        // Tampilkan ulang loading screen, kemudian mulai sesi kamera baru
        setTimeout(() => {
          document.getElementById("loading-screen").classList.add("hidden");
          document.getElementById("take-photos").classList.remove("hidden");

          // Mulai sesi pengambilan foto untuk yang tidak terpilih
          startCameraSession(selectedGM, selectedPose, photosToRetake);
        }, 2000); // Simulasi waktu loading
      } else {
        alert(
          "All photos are selected. Please deselect some photos before retaking."
        );
      }
    } else {
      alert("Please select both a Grand Master and a pose.");
    }
  });

function startCameraSession(selectedGM, selectedPose, photosToRetake) {
  const countdownVideoContainer = document.getElementById(
    "countdown-video-container"
  );
  let currentPhotoIndex = 0;

  const video = document.querySelector("#video-webcam");
  const canvas = document.querySelector("#canvas");
  const context = canvas.getContext("2d");
  const arVideo = document.createElement("video");
  const frameImage = new Image();
  let hasPaused = false;

  arVideo.loop = true;
  arVideo.muted = true;

  if (selectedGM === "citra") {
    arVideo.src =
      selectedPose === "pose1"
        ? "objek/GM Citra/GM Citra 2.webm"
        : "objek/GM Citra/GM Citra.webm";
  } else if (selectedGM === "Utut") {
    arVideo.src =
      selectedPose === "pose1"
        ? "objek/GM Utut/GM Utut.webm"
        : "objek/GM Utut/GM Utut 2.webm";
  } else if (selectedGM === "medina") {
    arVideo.src =
      selectedPose === "pose1"
        ? "objek/GM Medina/GM Medina 1.webm"
        : "objek/GM Medina/GM Medina 2.webm";
  } else if (selectedGM === "Susanto") {
    arVideo.src =
      selectedPose === "pose1"
        ? "objek/GM Susanto/GM Susanto 1.webm"
        : "objek/GM Susanto/GM Susanto 2.webm";
  } else if (selectedGM === "Irene") {
    arVideo.src =
      selectedPose === "pose1"
        ? "objek/GM Irene/GM Irene 1.webm"
        : "objek/GM Irene/GM Irene 2.webm";
  } else if (selectedGM === "Novendra") {
    arVideo.src =
      selectedPose === "pose1"
        ? "objek/GM Novendra/GM Novendra 1.webm"
        : "objek/GM Novendra/GM Novendra 2.webm";
  }

  frameImage.src = selectedFrameUrl;
  frameImage.onload = function () {
    requestAnimationFrame(draw);
  };

  arVideo.onloadeddata = () => {
    arVideo.playbackRate = 1; // Menetapkan kecepatan normal
    arVideo.play().catch((error) => {
      console.error("Error playing video:", error);
    });
  };

  avigator.mediaDevices
    .getUserMedia({ video: true })
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
  let arVideoZ = parseFloat(localStorage.getItem("arVideoZ")) || 1.4;

  // Deklarasi awal untuk koordinat dan skala AR
  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Setting aspect ratio and scaling
    var aspect = video.videoWidth / video.videoHeight;
    var scale = Math.min(
      canvas.width / video.videoHeight,
      canvas.height / video.videoWidth
    );

    // Set canvas size to match the original video resolution
    canvas.width = video.videoHeight; // Width follows video height due to 90-degree rotation
    canvas.height = video.videoWidth; // Height follows video width
    context.imageSmoothingEnabled = true;
    context.imageSmootingQuality = "high";
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((-90 * Math.PI) / 180); // Rotate 90 degrees left for portrait mode
    context.drawImage(
      video,
      -canvas.height / 2,
      -canvas.width / 2,
      canvas.height,
      canvas.width
    );
    context.restore();

    // Draw AR element (if any) without distortion
    var arAspect = arVideo.videoWidth / arVideo.videoHeight;
    var arWidth, arHeight;

    if (canvas.width / canvas.height > arAspect) {
      arHeight = (canvas.height - 70) * arVideoZ; // Adjust for padding
      arWidth = arHeight * arAspect;
    } else {
      arWidth = (canvas.width - 80) * arVideoZ; // Adjust for padding
      arHeight = arWidth / arAspect;
    }

    context.save();
    context.translate(
      arVideoX + (canvas.width - arWidth) / 2,
      arVideoY + (canvas.height - arHeight) / 2
    );

    // Optimized AR video drawing
    if (arVideo.readyState >= 2) {
      // Start drawing as soon as the video has enough data
      context.drawImage(arVideo, 0, 0, arWidth, arHeight);
    }

    context.restore();

    // Draw frame
    context.drawImage(frameImage, 0, 0, canvas.width, canvas.height);

    requestAnimationFrame(draw);
  }

  function moveARVideo(deltaX, deltaY, deltaZ) {
    arVideoX += deltaX;
    arVideoY += deltaY;
    arVideoZ += deltaZ;

    // Ensure scale is not too small
    if (arVideoZ <= 0) {
      arVideoZ = 0.1;
    }
  }

  // Example usage
  moveARVideo(10, 5, 0.1);

  arVideo.addEventListener("timeupdate", function () {
    var cTime = arVideo.currentTime;
    if (Math.abs(cTime - 8.9) < 0.1) {
      arVideo.pause();
      setTimeout(function () {
        arVideo.play();
      }, 1000);
    }
  });

  //   var arVideo = document.getElementById("video");

  // setInterval(pVideo, 3000); //function reference

  // var nextPause = [7];
  // var pauseIndex = 0;

  // function pVideo() {
  //     arVideo.ontimeupdate = function(e) {
  //         cTime = arVideo.currentTime;
  //         var pauseTime = nextPause[pauseIndex];
  //         if (cTime >= pauseTime) {
  //             arVideo.pause();
  //             setTimeout(arVideo.play, 3000); //unpause after 2 seconds
  //             if (++index <= nextPause.length) index++;
  //             else index = 0;
  //         }
  //     };
  // }

  let breakPlayed = false; // Menandakan apakah break.webm sudah dimainkan atau belum

  function takeNextPhoto() {
    if (currentPhotoIndex < photosToRetake.length) {
      const photoNumber = photosToRetake[currentPhotoIndex];

      setTimeout(() => {
        const countdownVideo = document.createElement("video");

        // Cek apakah break.webm sudah diputar, jika belum, putar terlebih dahulu
        if (!breakPlayed && currentPhotoIndex > 0) {
          countdownVideo.src = "objek/break.webm";
          breakPlayed = true; // Tandai bahwa break.webm sudah diputar
        } else {
          countdownVideo.src =
            currentPhotoIndex === 0 ? "objek/UI 1.webm" : "objek/UI 2.webm";
        }

        countdownVideo.autoplay = true;
        countdownVideo.muted = true;
        countdownVideo.loop = false;
        countdownVideo.style.width = "800px";
        countdownVideo.classList.add("countdown-video");
        countdownVideoContainer.innerHTML = "";
        countdownVideoContainer.appendChild(countdownVideo);

        countdownVideo.addEventListener("ended", () => {
          countdownVideoContainer.innerHTML = "";

          let countdownValue = 4;
          const countdownInterval = setInterval(() => {
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

              countdown4Video.addEventListener("ended", () => {
                countdownVideoContainer.innerHTML = "";
              });
            }

            if (countdownValue <= 0) {
              clearInterval(countdownInterval);

              const flash = document.getElementById("flash");
              flash.classList.remove("hidden");
              flash.classList.add("show");

              setTimeout(() => {
                flash.classList.remove("show");
                flash.classList.add("hidden");

                const photoDataUrl = canvas.toDataURL("image/png");
                const photoElement = document.getElementById(
                  `captured-photo-${photoNumber}`
                );

                if (
                  photoElement &&
                  !photoElement.classList.contains("selected")
                ) {
                  photoElement.src = photoDataUrl; // Hanya update foto yang tidak dipilih
                }

                currentPhotoIndex++;
                takeNextPhoto();
              }, 500);
            }
          }, 1000);
        });
      }, 2000);
    } else {
      document.getElementById("take-photos").classList.add("hidden");
      document.getElementById("photo-review").classList.remove("hidden");
    }
  }

  takeNextPhoto();
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
  .addEventListener("click", function () {
    if (selectedPose && selectedGM) {
      document.getElementById("loading-screen").classList.add("hidden");
      document.getElementById("take-photos").classList.remove("hidden");

      const video = document.querySelector("#video-webcam");
      const canvas = document.querySelector("#canvas");
      const context = canvas.getContext("2d");
      const arVideo = document.createElement("video");
      const frameImage = new Image();
      let hasPaused = false;

      arVideo.loop = true;
      arVideo.muted = true;

      if (selectedGM === "citra") {
        arVideo.src =
          selectedPose === "pose1"
            ? "objek/GM Citra/GM Citra 2.webm"
            : "objek/GM Citra/GM Citra.webm";
      } else if (selectedGM === "Utut") {
        arVideo.src =
          selectedPose === "pose1"
            ? "objek/GM Utut/GM Utut.webm"
            : "objek/GM Utut/GM Utut 2.webm";
      } else if (selectedGM === "medina") {
        arVideo.src =
          selectedPose === "pose1"
            ? "objek/GM Medina/s.webm"
            : "objek/GM Medina/GM Medina 2.webm";
      } else if (selectedGM === "Susanto") {
        arVideo.src =
          selectedPose === "pose1"
            ? "objek/GM Susanto/GM Susanto 1.webm"
            : "objek/GM Susanto/GM Susanto 2.webm";
      } else if (selectedGM === "Irene") {
        arVideo.src =
          selectedPose === "pose1"
            ? "objek/GM Irene/GM Irene 1.webm"
            : "objek/GM Irene/GM Irene 2.webm";
      } else if (selectedGM === "Novendra") {
        arVideo.src =
          selectedPose === "pose1"
            ? "objek/GM Novendra/GM Novendra 1.webm"
            : "objek/GM Novendra/GM Novendra 2.webm";
      }

      frameImage.src = selectedFrameUrl;
      frameImage.onload = function () {
        requestAnimationFrame(draw);
      };

      arVideo.onloadeddata = () => {
        arVideo.playbackRate = 1; // Menetapkan kecepatan normal
        arVideo.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      };

      navigator.mediaDevices
        .getUserMedia({ video: true })
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
      let arVideoZ = parseFloat(localStorage.getItem("arVideoZ")) || 0.9;

      // Deklarasi awal untuk koordinat dan skala AR
      function draw() {
        // Clear the canvas before drawing new frames
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Get the video resolution (dynamic based on camera input)
        var videoWidth = video.videoWidth;
        var videoHeight = video.videoHeight;

        // Set canvas size based on the scaled video resolution
        var scaleFactor = 4; // Set the scaling factor to 4
        canvas.width = videoHeight * scaleFactor; // Scale width by 4
        canvas.height = videoWidth * scaleFactor; // Scale height by 4

        // Image smoothing settings for high-quality output
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        // Save the current context state
        context.save();

        // Move the origin to the center of the canvas and rotate for portrait mode
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate((-90 * Math.PI) / 180); // Rotate 90 degrees to portrait

        // Scale the entire context by the scaling factor
        context.scale(scaleFactor, scaleFactor);

        // Draw the video, considering the aspect ratio and dynamic resolution
        context.drawImage(
          video,
          -canvas.height / 2 / scaleFactor,
          -canvas.width / 2 / scaleFactor, // Adjust for scaling
          canvas.height / scaleFactor, // Original height (before scaling)
          canvas.width / scaleFactor // Original width (before scaling)
        );

        // Restore context to undo the rotation and scaling
        context.restore();

        // Handle AR element (without distortion)
        var arAspect = arVideo.videoWidth / arVideo.videoHeight;
        var arWidth, arHeight;

        if (canvas.width / canvas.height > arAspect) {
          arHeight = ((canvas.height - 70) / scaleFactor) * arVideoZ; // Adjust height with padding and scaling
          arWidth = arHeight * arAspect; // Maintain AR video aspect ratio
        } else {
          arWidth = ((canvas.width - 80) / scaleFactor) * arVideoZ; // Adjust width with padding and scaling
          arHeight = arWidth / arAspect; // Maintain AR video aspect ratio
        }

        // Save the current context state before drawing AR elements
        context.save();
        context.translate(
          (arVideoX + (canvas.width / scaleFactor - arWidth) / 2) * scaleFactor,
          (arVideoY + (canvas.height / scaleFactor - arHeight) / 2) *
            scaleFactor
        );

        // Scale AR elements as well
        context.scale(scaleFactor, scaleFactor);

        // Draw AR video if it's ready to play
        if (arVideo.readyState >= 2) {
          context.drawImage(arVideo, 0, 0, arWidth, arHeight);
        }

        // Restore context after drawing AR elements
        context.restore();

        // Draw the selected frame over the video (also scaled)
        context.save();
        context.scale(scaleFactor, scaleFactor);
        context.drawImage(
          frameImage,
          0,
          0,
          canvas.width / scaleFactor,
          canvas.height / scaleFactor
        );
        context.restore();

        // Request the next frame to continue rendering
        requestAnimationFrame(draw);
      }

      function moveARVideo(deltaX, deltaY, deltaZ) {
        arVideoX += deltaX;
        arVideoY += deltaY;
        arVideoZ += deltaZ;

        // Ensure scale is not too small
        if (arVideoZ <= 0) {
          arVideoZ = 0.1;
        }
      }

      // Example usage
      moveARVideo(10, 5, 0.1);

      arVideo.addEventListener("timeupdate", function () {
        var cTime = arVideo.currentTime;
        if (Math.abs(cTime - 9) < 0.1) {
          arVideo.pause();
          setTimeout(function () {
            arVideo.play();
          }, 30000);
        }
      });

      //   var arVideo = document.getElementById("video");

      // setInterval(pVideo, 3000); //function reference

      // var nextPause = [7];
      // var pauseIndex = 0;

      // function pVideo() {
      //     arVideo.ontimeupdate = function(e) {
      //         cTime = arVideo.currentTime;
      //         var pauseTime = nextPause[pauseIndex];
      //         if (cTime >= pauseTime) {
      //             arVideo.pause();
      //             setTimeout(arVideo.play, 3000); //unpause after 2 seconds
      //             if (++index <= nextPause.length) index++;
      //             else index = 0;
      //         }
      //     };
      // }

      function takePhotos() {
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

        const videoWebcam = document.getElementById("canvas"); // Elemen video untuk kamera
        const delay = 6000;
        let isFirstPhoto = true;

        let breakPlayed = false;
        let bawahVideoPlayed = false;

        const takeSinglePhoto = (index) => {
          console.log(`Taking photo ${index + 1}`);

          setTimeout(() => {
            const countdownVideo = document.createElement("video");

            if (index > 0 && !breakPlayed) {
              countdownVideo.src = "objek/break.webm";
              breakPlayed = true;

              // Tambahkan efek blur dan greyscale saat break.webm diputar
              videoWebcam.style.filter = "blur(5px) grayscale(100%)";

              countdownVideo.addEventListener("ended", () => {
                // Hapus blur dan greyscale setelah break.webm selesai
                videoWebcam.style.filter = "";

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

            countdownVideo.addEventListener("ended", () => {
              console.log(`Countdown video ended for photo ${index + 1}`);
              countdownVideoContainer.innerHTML = "";

              if (index > 0) {
                let countdownValue = 4;
                const countdownInterval = setInterval(() => {
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

                    countdown4Video.addEventListener("ended", () => {
                      countdownVideoContainer.innerHTML = "";
                    });
                  }

                  if (countdownValue <= 0) {
                    clearInterval(countdownInterval);

                    const flash = document.getElementById("flash");
                    flash.classList.remove("hidden");
                    flash.classList.add("show");

                    setTimeout(() => {
                      flash.classList.remove("show");
                      flash.classList.add("hidden");

                      const photoDataUrl = canvas.toDataURL("image/png");

                      reviewFrames[index].src = photoDataUrl;

                      if (index === 4) {
                        setTimeout(() => {
                          document
                            .getElementById("take-photos")
                            .classList.add("hidden");
                          document
                            .getElementById("photo-review")
                            .classList.remove("hidden");

                          // Hentikan webcam dan AR video setelah selesai foto
                          stopVideoAndAR();
                        }, 8000);
                      }
                    }, 200);
                  }
                }, 1000);
              } else {
                isFirstPhoto = false;
              }
            });
          }, index * delay);
        };

        // Ambil 5 foto
        for (let i = 0; i < 5; i++) {
          takeSinglePhoto(i);
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
        arVideoX = parseFloat(localStorage.getItem("arVideoX")) || 0;
        arVideoY = parseFloat(localStorage.getItem("arVideoY")) || 0;
        arVideoZ = parseFloat(localStorage.getItem("arVideoZ")) || 0.9;

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

ipcRenderer.on("photo-taken", (event, photoDataUrl) => {
  let photoId = `captured-photo-${photoCounter + 1}`;
  let frameOverlayId = `frame-overlay-${photoCounter + 1}`;

  // Create a canvas element
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const arVideo = document.getElementById("ar-video");

  const photoElement = new Image();
  const frameOverlayElement = new Image();

  // Set the sources for the images
  photoElement.src = photoDataUrl;
  frameOverlayElement.src = selectedFrameUrl;

  // Wait for both images to load
  Promise.all([
    new Promise((resolve) => (photoElement.onload = resolve)),
    new Promise((resolve) => (frameOverlayElement.onload = resolve)),
  ])
    .then(() => {
      // Set canvas size to match the photo
      canvas.width = photoElement.width;
      canvas.height = photoElement.height;

      // Draw the photo onto the canvas
      context.drawImage(photoElement, 0, 0);

      // Draw the frame overlay on top of the photo
      context.drawImage(frameOverlayElement, 0, 0, canvas.width, canvas.height);

      // Get the combined image as a data URL
      const combinedDataUrl = canvas.toDataURL("image/png");

      // Update the photo element with the combined image
      const combinedPhotoElement = document.getElementById(photoId);
      combinedPhotoElement.src = combinedDataUrl;

      document.getElementById("camera-screen").classList.add("hidden");
      document.getElementById("photo-review").classList.remove("hidden");

      photoCounter++;

      if (photoCounter === 4) {
        document
          .getElementById("approve-photo-button")
          .classList.remove("hidden");
        arVideo.setAttribute("visible", true);
      }
    })
    .catch((error) => {
      console.error("Error combining images:", error);
    });
});

// document.querySelectorAll(".photo-grid img").forEach((img) => {
//     img.addEventListener("click", () => {
//         document.querySelectorAll(".photo-grid img").forEach((img) => {
//             img.classList.remove("selected");
//         });
//         img.classList.add("selected");
//     });
// });

let selectedPhotoSrc = []; // Array to store selected photo sources

// Function to handle the photo approval process
document
  .getElementById("approve-photo-button")
  .addEventListener("click", () => {
    const selectedPhotos = document.querySelectorAll(
      ".photo-grid img.selected"
    );
    const totalPhotos = document.querySelectorAll(".photo-grid img");

    // Check if at least one photo is selected
    if (selectedPhotos.length === 0) {
      alert("Harap pilih setidaknya satu foto terlebih dahulu.");
      return;
    }

    // Check if four photos are taken
    if (totalPhotos.length < 4) {
      alert("Mohon tunggu hingga semua 4 foto telah diambil.");
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
          document.querySelector(".swal2-popup").style.top = "30vh";
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

// let hasRetaken = false; // Flag to track if retake has already been performed

// document.getElementById("retake-photo-button").addEventListener("click", function() {
//     console.log("Button clicked. hasRetaken:", hasRetaken, "selectedPose:", selectedPose, "selectedGM:", selectedGM);

//     if (selectedPose && selectedGM) {
//         if (hasRetaken) {
//             // Alert user if they try to retake photos again
//             alert("Kamu sudah ulangi 1 kali sebelumnya.");
//             console.log("Retake attempt blocked because hasRetaken is true.");
//             return;
//         }

//         const photoElements = document.querySelectorAll(".photo-grid img");
//         const photosToRetake = [];

//         // Identify which photos are not selected
//         photoElements.forEach((img, index) => {
//             if (!img.classList.contains("selected")) {
//                 photosToRetake.push(index + 1);
//             }
//         });

//         if (photosToRetake.length > 0) {
//             // Set the flag to true immediately after identifying the photos to retake
//             hasRetaken = true;
//             console.log("Setting hasRetaken to true.");

//             console.log("Photos to retake:", photosToRetake);

//             // Clear the photos that need to be retaken
//             photosToRetake.forEach(photoNumber => {
//                 const photoElement = document.getElementById(`captured-photo-${photoNumber}`);
//                 if (photoElement) {
//                     photoElement.src = '../public/images/giphy.gif'; // Reset to placeholder image
//                     console.log(`Photo ${photoNumber} reset to placeholder.`);
//                 }
//             });

//             // Hide the photo review section
//             document.getElementById("photo-review").classList.add("hidden");

//             // Show the camera screen
//             document.getElementById("camera-screen").classList.remove("hidden");

//             // Start the camera session for retaking photos
//             ipcRenderer.send('start-camera', {
//                 gm: selectedGM,
//                 pose: selectedPose
//             });

//             // Reset photo counter based on the first photo that needs retaking
//             photoCounter = Math.min(...photosToRetake) - 1; // Start at the lowest non-selected photo index
//             console.log("Photo counter reset to:", photoCounter);
//         } else {
//             alert("All photos are selected. Please deselect some photos before retaking.");
//             console.log("All photos are selected. No retake needed.");
//         }
//     } else {
//         alert("Please select both a Grand Master and a pose.");
//         console.log("Selection missing. Grand Master or pose not selected.");
//     }
// });

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
