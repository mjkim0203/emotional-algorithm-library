const emotionColors = {
  neutral: "#AAAEAA", happy: "#FFE048", sad: "#A7C9FF",
  disgusted: "#D0FF3E", surprised: "#FF865C",
  angry: "#FF6489", fearful: "#CE6EB5"
};

const emotionLinks = {
  happy: "https://example.com/happy",
  sad: "https://example.com/sad",
  angry: "https://example.com/angry",
  fearful: "https://example.com/fearful",
  disgusted: "https://example.com/disgusted",
  surprised: "https://example.com/surprised",
  neutral: "https://example.com/neutral"
};

const emotionImages = {
          Neutral: "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-100.png?v=1751373938451/IMOJI-100.png",
          Joy: "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-200.png?v=1751373942329/IMOJI-200.png",
          Sadness: "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-300.png?v=1751373951234/IMOJI-300.png",
          Anger: "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-400.png?v=1751373958905/IMOJI-400.png",
          Fear: "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-500.png?v=1751373957111/IMOJI-500.png",
          Disgust: "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-600.png?v=1751373966696/IMOJI-600.png",
          Surprise: "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-700.png?v=1751373970745/IMOJI-700.png"
        };

const prompts = [
  "지금 어떤 감정이 드시나요?", "당신을 가장 쉽게 웃게 만드는 건?",
  "기억에 남는 슬펐던 경험은?", "최근 어떤 일에 화가 났나요?",
  "가장 최근에 무서웠던 순간은?", "불쾌한 기억이 있었나요?",
  "예상치 못한 일이 생기면 어떤 감정이 드시나요?"
];

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
function rgbToHex(r, g, b) {
  const toHex = (c) => (Math.round(c).toString(16).padStart(2, '0'));
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function blendEmotionColor(expressions) {
  let total = 0, r = 0, g = 0, b = 0;
  for (const emotion in expressions) {
    if (emotionColors[emotion]) {
      const weight = expressions[emotion];
      const rgb = hexToRgb(emotionColors[emotion]);
      r += rgb.r * weight; g += rgb.g * weight; b += rgb.b * weight;
      total += weight;
    }
  }
  return total === 0 ? "#000000" : rgbToHex(r / total, g / total, b / total);
}
function lerpColor(from, to, alpha = 0.4) {
  const a = hexToRgb(from); const b = hexToRgb(to);
  return rgbToHex(
    a.r + (b.r - a.r) * alpha,
    a.g + (b.g - a.g) * alpha,
    a.b + (b.b - a.b) * alpha
  );
}

window.addEventListener("DOMContentLoaded", async () => {
  document.querySelector(".prompt-text").innerText =
    prompts[Math.floor(Math.random() * prompts.length)];

  await faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");

  const video = document.getElementById("video");
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 }, audio: false
  });
  video.srcObject = stream;

  video.onloadedmetadata = () => {
    video.play();

    const canvas = faceapi.createCanvasFromMedia(video);
    const container = document.getElementById("canvasContainer");
    const bannerEl = document.getElementById("emotion-banner");
    const linkEl = document.getElementById("emotion-link");
    const captureImageEl = document.getElementById("capture-image");
    const graphicEl = document.getElementById("emotion-graphic");

    container.innerHTML = "";
    container.appendChild(canvas);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    const displaySize = { width: canvas.width, height: canvas.height };
    faceapi.matchDimensions(canvas, displaySize);

    let lastAnalysis = 0;
    const INTERVAL = 500;

    async function drawLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const now = Date.now();
      if (now - lastAnalysis > INTERVAL) {
        lastAnalysis = now;
        const result = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 128 }))
          .withFaceLandmarks()
          .withFaceExpressions();

        if (result) {
          const resized = faceapi.resizeResults(result, displaySize);
          const box = resized.detection.box;
          const expressions = result.expressions;
          const color = blendEmotionColor(expressions);
          window._boxColor = window._boxColor ? lerpColor(window._boxColor, color) : color;
          if (bannerEl) bannerEl.style.backgroundColor = window._boxColor;

          const labels = {
            neutral: "Neutral", happy: "Joy", sad: "Sadness", angry: "Anger",
            fearful: "Fear", disgusted: "Disgust", surprised: "Surprise"
          };
          const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
          const topEmotion = sorted[0][0];
          const emotionName = labels[topEmotion];
          const label = `${emotionName} (${(sorted[0][1] * 100).toFixed(1)}%)`;

          const mirroredX = canvas.width - box.x - box.width;
          ctx.strokeStyle = window._boxColor;
          ctx.lineWidth = 4;
          ctx.strokeRect(mirroredX, box.y, box.width, box.height);

          ctx.fillStyle = window._boxColor;
          ctx.font = "clamp(14px, 2.2vh, 20px) Pretendard";
          const textX = mirroredX + 4;
          const textY = box.y - 28;
          const textW = ctx.measureText(label).width;
          ctx.fillRect(textX - 6, textY - 4, textW + 12, 28);
          ctx.fillStyle = "#000";
          ctx.fillText(label, textX, textY + 16);

          if (emotionImages[emotionName]) graphicEl.src = emotionImages[emotionName];
          captureImageEl.src = "https://cdn.glitch.global/f52c6b01-3ecd-4d0c-9574-b68cf7003384/CAPTURE%20.png?v=1751635645071/CAPTURE.png";

          if (emotionLinks[topEmotion]) {
            linkEl.href = emotionLinks[topEmotion];
            linkEl.classList.add("active");
          } else {
            linkEl.href = "#";
            linkEl.classList.remove("active");
          }
        }
      }

      requestAnimationFrame(drawLoop);
    }

    drawLoop();
  };
});
