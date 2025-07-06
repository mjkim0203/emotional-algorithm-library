
const emotionImages = {
  Neutral: "assets/IMOJI-100.png",
  Joy: "assets/IMOJI-200.png",
  Sadness: "assets/IMOJI-300.png",
  Anger: "assets/IMOJI-400.png",
  Fear: "assets/IMOJI-500.png",
  Disgust: "assets/IMOJI-600.png",
  Surprise: "assets/IMOJI-700.png"
};

window.addEventListener("DOMContentLoaded", () => {
  const promptEl = document.querySelector(".prompt-text");
  const prompts = [
    "지금 어떤 감정이 드시나요?",
    "당신을 가장 쉽게 웃게 만드는 건 무엇인가요?",
    "기억에 남는 슬펐던 경험은 어떤 게 있나요?",
    "최근 어떤 일에 화가 났나요?",
    "가장 최근에 무서웠던 순간은 언제였나요?",
    "불쾌하거나 역겨운 느낌이 들었던 상황은 있었나요?",
    "예상치 못한 일이 생겼을 때 어떤 감정이 드시나요?"
  ];
  promptEl.innerText = prompts[Math.floor(Math.random() * prompts.length)];
});

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
    faceapi.matchDimensions(canvas, { width: video.width, height: video.height });

    setInterval(async () => {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detection) {
        const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
        const topEmotion = sorted[0][0];
        const emotionMap = {
          neutral: "Neutral",
          happy: "Joy",
          sad: "Sadness",
          angry: "Anger",
          fearful: "Fear",
          disgusted: "Disgust",
          surprised: "Surprise"
        };
        const graphic = document.getElementById("emotion-graphic");
        const mapped = emotionMap[topEmotion];
        if (emotionImages[mapped]) {
          graphic.src = emotionImages[mapped];
        }
      }
    }, 500);
  });
}
init();
