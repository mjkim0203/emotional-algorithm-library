const emotionColors = {
  neutral: "#AAAEAA",
  happy: "#FFE048",
  sad: "#A7C9FF",
  disgusted: "#D0FF3E",
  surprised: "#FF865C",
  angry: "#FF6489",
  fearful: "#CE6EB5"
};

const emotionLabels = {
  neutral: "Neutral",
  happy: "Joy",
  sad: "Sadness",
  angry: "Anger",
  fearful: "Fear",
  disgusted: "Disgust",
  surprised: "Surprise"
};

const prompts = [
  "지금 어떤 감정이 드시나요?",
  "당신을 가장 쉽게 웃게 만드는 건 무엇인가요?",
  "기억에 남는 슬펐던 경험은 어떤 게 있나요?"
];

window.addEventListener("DOMContentLoaded", () => {
  const promptEl = document.querySelector(".prompt-text");
  promptEl.innerText = prompts[Math.floor(Math.random() * prompts.length)];
  startCamera();
});

async function startCamera() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");

  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevice = devices.find(device =>
    device.kind === "videoinput" && device.label.toLowerCase().includes("elgato")
  );

  if (!videoDevice) {
    alert("Elgato Facecam을 찾을 수 없습니다.");
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: videoDevice.deviceId },
    audio: false
  });

  const video = document.createElement("video");
  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;

  const container = document.getElementById("canvasContainer");
  const canvas = faceapi.createCanvasFromMedia(video);
  container.appendChild(canvas);
  canvas.width = 360;
  canvas.height = 640;

  const displaySize = { width: 360, height: 640 };
  faceapi.matchDimensions(canvas, displaySize);

  video.onloadeddata = () => {
    setInterval(async () => {
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceExpressions();

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (detections) {
        const resized = faceapi.resizeResults(detections, displaySize);
        const expressions = resized.expressions;

        const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
        const top = sorted[0];
        const emotion = top[0];
        const label = `${emotionLabels[emotion]} (${(top[1]*100).toFixed(1)}%)`;

        const box = resized.detection.box;
        ctx.strokeStyle = emotionColors[emotion];
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        ctx.font = "20px Pretendard";
        ctx.fillStyle = emotionColors[emotion];
        ctx.fillText(label, box.x + 4, box.y - 8);

        const banner = document.getElementById("emotion-banner");
        banner.style.backgroundColor = emotionColors[emotion] || "#444";
      }
    }, 100);
  };
}
