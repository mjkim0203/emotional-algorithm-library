
// 감정별 색상 및 링크 설정
const emotionColors = {
  neutral: "#AAAEAA",
  happy: "#FFE048",
  sad: "#A7C9FF",
  disgusted: "#D0FF3E",
  surprised: "#FF865C",
  angry: "#FF6489",
  fearful: "#CE6EB5"
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

const prompts = [
  "지금 어떤 감정이 드시나요?",
  "당신을 가장 쉽게 웃게 만드는 건 무엇인가요?",
  "기억에 남는 슬펐던 경험은 어떤 게 있나요?",
  "최근 어떤 일에 화가 났나요?",
  "가장 최근에 무서웠던 순간은 언제였나요?",
  "불쾌하거나 역겨운 느낌이 들었던 상황은 있었나요?",
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
  const toHex = (c) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
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

  stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
  video.srcObject = stream;
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;

  video.onloadedmetadata = () => {
    video.play();

    const canvas = faceapi.createCanvasFromMedia(video);
    const container = document.getElementById("canvasContainer");
    const bannerEl = document.getElementById("emotion-banner");
    const linkEl = document.getElementById("emotion-link");

    container.innerHTML = "";
    container.appendChild(canvas);

    canvas.width = 640;
    canvas.height = 480;
    const displaySize = { width: 640, height: 480 };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      if (stop) return;
      stop = true;

      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold: 0.3 });
      const result = await faceapi.detectSingleFace(video, options).withFaceLandmarks(true).withFaceExpressions();

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
        const targetColor = blendEmotionColor(expressions);
        window._boxColor = window._boxColor ? lerpColor(window._boxColor, targetColor, 0.4) : targetColor;

        if (bannerEl) bannerEl.style.backgroundColor = window._boxColor;

        const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
        const topEmotion = sorted[0][0];

        const mirroredBoxX = canvas.width - box.x - box.width;
        ctx.strokeStyle = window._boxColor;
        ctx.lineWidth = 4.5;
        ctx.strokeRect(mirroredBoxX, box.y, box.width, box.height);

        ctx.font = "18px 'Pretendard', sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        const padding = 6;
        const label = `${topEmotion} (${(sorted[0][1] * 100).toFixed(1)}%)`;
        const textX = mirroredBoxX + 2;
        const textY = box.y - 30;
        const textWidth = ctx.measureText(label).width;
        const textHeight = 24;

        ctx.fillStyle = window._boxColor;
        ctx.fillRect(textX - padding, textY - padding, textWidth + padding * 2, textHeight + padding * 1.2);
        ctx.fillStyle = "#000000";
        ctx.fillText(label, textX, textY);

        const linkEl = document.getElementById("emotion-link");
        if (emotionLinks[topEmotion]) {
          linkEl.href = emotionLinks[topEmotion];
          linkEl.classList.add("active");
        } else {
          linkEl.href = "#";
          linkEl.classList.remove("active");
        }
      }
      stop = false;
    }, 100);
  };
}
init();
