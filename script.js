
const emotionImages = {
  neutral: "assets/IMOJI-100.png",
  happy: "assets/IMOJI-200.png",
  sad: "assets/IMOJI-300.png",
  angry: "assets/IMOJI-400.png",
  fearful: "assets/IMOJI-500.png",
  disgusted: "assets/IMOJI-600.png",
  surprised: "assets/IMOJI-700.png"
};

async function init() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");

  const video = document.createElement("video");
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;

  video.addEventListener("loadeddata", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.getElementById("canvasContainer").appendChild(canvas);

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detection) {
        const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
        const topEmotion = sorted[0][0];

        const graphic = document.getElementById("emotion-graphic");
        if (emotionImages[topEmotion]) {
          graphic.src = emotionImages[topEmotion];
        }
      }
    }, 500);
  });
}
init();
