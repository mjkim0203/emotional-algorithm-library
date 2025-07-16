* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: 'Pretendard', sans-serif;
  background-color: #000000;
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}
.prompt-wrapper {
  width: 100%;
  max-width: 640px;
  background-color: black;
  padding: 12px 16px;
  margin-bottom: 16px;
  text-align: center;
}
.prompt-text {
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
}
#emotion-banner {
  width: 100%;
  max-width: 640px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 400;
  font-family: 'Pretendard', sans-serif;
  margin-bottom: 0px;
  transition: background-color 0.3s ease;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
canvas {
  width: 100%;
  max-width: 640px;
  aspect-ratio: 4 / 3;
  background-color: black;
}
#canvasContainer {
  width: 100%;
  max-width: 640px;
  position: relative;
}
.emotion-button {
  margin-top: 16px;
  background: none;
  border: none;
  padding: 0;
  pointer-events: none;
}
.emotion-button.active {
  pointer-events: auto;
}
#capture-image {
  width: 100px;
  height: auto;
  display: block;
  margin: 0 auto;
}
#emotion-graphic {
  width: 90px;
  height: auto;
  margin-bottom: 12px;
  transition: opacity 0.3s ease;
}
#capture-text {
  color: white;
  font-size: 20px;
  margin-top: 20px;
  margin-bottom: 8px;
  text-align: center;
  font-family: 'Pretendard', sans-serif;
}
#capture-guide {
  color: #888888;
  font-size: 16px;
  margin-top: 0px;
  text-align: center;
  font-family: 'Pretendard', sans-serif;
}

<!-- script.js -->
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
  promptEl.innerText = prompts[Math.floor(Math.random() * prompts.length)];
});

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

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHex(r, g, b) {
  const toHex = (c) => ("0" + Math.round(c).toString(16)).slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function blendEmotionColor(expressions) {
  let total = 0, r = 0, g = 0, b = 0;
  for (const [emo, weight] of Object.entries(expressions)) {
    if (emotionColors[emo]) {
      const rgb = hexToRgb(emotionColors[emo]);
      r += rgb.r * weight;
      g += rgb.g * weight;
      b += rgb.b * weight;
      total += weight;
    }
  }
  return total === 0 ? "#000000" : rgbToHex(r / total, g / total, b / total);
}

const video = document.createElement("video");
let stop = false;

async function init() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");

  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(d => d.kind === "videoinput");
  const elgato = videoDevices.find(d => d.label.toLowerCase().includes("elgato"));
  if (!elgato) return alert("Elgato Facecam을 찾을 수 없습니다.");

  const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: elgato.deviceId } }, audio: false });
  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;

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
      const result = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
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
        bannerEl.style.backgroundColor = color;

        const topEmotion = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0][0];
        if (emotionLinks[topEmotion]) {
          linkEl.href = emotionLinks[topEmotion];
          linkEl.classList.add("active");
        } else {
          linkEl.href = "#";
          linkEl.classList.remove("active");
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        const mirroredX = canvas.width - box.x - box.width;
        ctx.strokeRect(mirroredX, box.y, box.width, box.height);
      }
      stop = false;
    }, 200);
  };
}

init();
