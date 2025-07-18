
const emotionColors = {
  neutral: "#AAAEAA", happy: "#FFE048", sad: "#A7C9FF",
  disgusted: "#D0FF3E", surprised: "#FF865C", angry: "#FF6489", fearful: "#CE6EB5"
};

const emotionLinks = {
  happy: "https://example.com/happy", sad: "https://example.com/sad",
  angry: "https://example.com/angry", fearful: "https://example.com/fearful",
  disgusted: "https://example.com/disgusted", surprised: "https://example.com/surprised",
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
  "지금 어떤 감정이 드시나요?", "당신을 가장 쉽게 웃게 만드는 건 무엇인가요?",
  "기억에 남는 슬펐던 경험은 어떤 게 있나요?", "최근 어떤 일에 화가 났나요?",
  "가장 최근에 무서웠던 순간은 언제였나요?", "불쾌하거나 역겨운 느낌이 들었던 상황은 있었나요?",
  "예상치 못한 일이 생겼을 때 어떤 감정이 드시나요?"
];

window.addEventListener("DOMContentLoaded", () => {
  const promptEl = document.querySelector(".prompt-text");
  const randomIndex = Math.floor(Math.random() * prompts.length);
  promptEl.innerText = prompts[randomIndex];
});

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHex(r, g, b) {
  const toHex = (c) => (Math.round(c).toString(16).padStart(2, "0"));
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function blendEmotionColor(expressions) {
  let total = 0, r = 0, g = 0, b = 0;
  for (const emotion in expressions) {
    if (emotionColors[emotion]) {
      const weight = expressions[emotion];
      const rgb = hexToRgb(emotionColors[emotion]);
      r += rgb.r * weight;
      g += rgb.g * weight;
      b += rgb.b * weight;
      total += weight;
    }
  }
  return total === 0 ? "#000000" : rgbToHex(r / total, g / total, b / total);
}

function lerpColor(from, to, alpha = 0.2) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex(
    a.r + (b.r - a.r) * alpha,
    a.g + (b.g - a.g) * alpha,
    a.b + (b.b - a.b) * alpha
  );
}

let video = document.createElement("video");
let stream = null, stop = false;

async function init() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  } catch (e) {
    alert("카메라 접근 오류: " + e.message);
    return;
  }

  video.srcObject = stream;
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;

  video.onloadedmetadata = () => {
    video.play();
    const canvas = faceapi.createCanvasFromMedia(video);
    const container = document.getElementById("canvasContainer");
    const bannerEl = document.getElementById("emotion-banner");
    const linkEl = document.getElementById("emotion-link");
    const graphicEl = document.getElementById("emotion-graphic");

    container.innerHTML = "";
    container.appendChild(canvas);
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      if (stop) return;
      stop = true;

      const result = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 128 }))
        .withFaceLandmarks().withFaceExpressions();

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      if (result) {
        const resized = faceapi.resizeResults(result, displaySize);
        const box = resized.detection.box;
        const expressions = result.expressions;
        const color = blendEmotionColor(expressions);
        window._boxColor = window._boxColor ? lerpColor(window._boxColor, color) : color;

        if (bannerEl) bannerEl.style.backgroundColor = window._boxColor;

        const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
        const topEmotion = sorted[0][0];
        const label = `${topEmotion.toUpperCase()} (${(sorted[0][1] * 100).toFixed(1)}%)`;

        ctx.strokeStyle = window._boxColor;
        ctx.lineWidth = 4;
        const mirroredX = canvas.width - box.x - box.width;
        ctx.strokeRect(mirroredX, box.y, box.width, box.height);

        ctx.font = "clamp(12px, 2.4vh, 24px) Pretendard";
        ctx.fillStyle = window._boxColor;
        ctx.fillRect(mirroredX, box.y - 30, ctx.measureText(label).width + 10, 28);
        ctx.fillStyle = "#000";
        ctx.fillText(label, mirroredX + 5, box.y - 25);

        const emotionName = topEmotion.charAt(0).toUpperCase() + topEmotion.slice(1).toLowerCase();
        if (emotionImages[emotionName]) graphicEl.src = emotionImages[emotionName];

        const captureImageEl = document.getElementById("capture-image");
        captureImageEl.src = "https://cdn.glitch.global/f52c6b01-3ecd-4d0c-9574-b68cf7003384/CAPTURE%20.png?v=1751635645071/CAPTURE.png";

        if (emotionLinks[topEmotion]) {
          linkEl.href = emotionLinks[topEmotion];
          linkEl.classList.add("active");
        } else {
          linkEl.href = "#";
          linkEl.classList.remove("active");
        }
      }

      stop = false;
    }, 150);
  };
}

init();






