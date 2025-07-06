
const emotionImages = {
  Neutral: "assets/IMOJI-100.png",
  Joy: "assets/IMOJI-200.png",
  Sadness: "assets/IMOJI-300.png",
  Anger: "assets/IMOJI-400.png",
  Fear: "assets/IMOJI-500.png",
  Disgust: "assets/IMOJI-600.png",
  Surprise: "assets/IMOJI-700.png"
};

const emotionMap = {
  neutral: "Neutral",
  happy: "Joy",
  sad: "Sadness",
  angry: "Anger",
  fearful: "Fear",
  disgusted: "Disgust",
  surprised: "Surprise"
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

  const video = document.getElementById("video");
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;

  video.addEventListener("loadeddata", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.getElementById("canvasContainer").appendChild(canvas);

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const result = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (result) {
        const resized = faceapi.resizeResults(result, displaySize);
        const box = resized.detection.box;
        const expressions = result.expressions;

        const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
        const topEmotion = sorted[0][0];
        const emotionName = emotionMap[topEmotion];
        const label = `${emotionName} (${(sorted[0][1] * 100).toFixed(1)}%)`;

        // Draw box and label
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        ctx.font = "18px Pretendard";
        ctx.fillStyle = "#FFD700";
        ctx.fillText(label, box.x, box.y - 10);

        
        // Update image
        const linkEl = document.getElementById("emotion-link");
        const emotionLinks = {
          Neutral: "https://example.com/neutral",
          Joy: "https://example.com/happy",
          Sadness: "https://example.com/sad",
          Anger: "https://example.com/angry",
          Fear: "https://example.com/fearful",
          Disgust: "https://example.com/disgusted",
          Surprise: "https://example.com/surprised"
        };
        if (emotionLinks[emotionName]) {
          linkEl.href = emotionLinks[emotionName];
          linkEl.classList.add("active");
        } else {
          linkEl.href = "#";
          linkEl.classList.remove("active");
        }

        const graphic = document.getElementById("emotion-graphic");
        if (emotionImages[emotionName]) {
          graphic.src = emotionImages[emotionName];
        }
      }
    }, 300);
  });
}
init();
