
const emotionImages = {"neutral": "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-100.png?v=1751373938451/IMOJI-100.png", "happy": "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-200.png?v=1751373942329/IMOJI-200.png", "sad": "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-300.png?v=1751373951234/IMOJI-300.png", "angry": "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-400.png?v=1751373958905/IMOJI-400.png", "fearful": "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-500.png?v=1751373957111/IMOJI-500.png", "disgusted": "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-600.png?v=1751373966696/IMOJI-600.png", "surprised": "https://cdn.glitch.global/b5dd1b0e-2595-4522-b3c9-fac2d8d11eb4/IMOJI-700.png?v=1751373970745/IMOJI-700.png"};
const captureImageEl = document.getElementById("capture-image");
const linkEl = document.getElementById("emotion-link");

const emotionLinks = {
  happy: "https://example.com/happy",
  sad: "https://example.com/sad",
  angry: "https://example.com/angry",
  fearful: "https://example.com/fearful",
  disgusted: "https://example.com/disgusted",
  surprised: "https://example.com/surprised",
  neutral: "https://example.com/neutral"
};

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

let video = document.createElement("video");
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  document.getElementById("canvasContainer").appendChild(video);
});

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models")
]).then(startDetection);

function startDetection() {
  setInterval(async () => {
    const result = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
    if (result && result.expressions) {
      const sorted = Object.entries(result.expressions).sort((a, b) => b[1] - a[1]);
      const topEmotion = sorted[0][0];
      captureImageEl.src = "https://cdn.glitch.global/f52c6b01-3ecd-4d0c-9574-b68cf7003384/CAPTURE%20.png?v=1751635645071/CAPTURE.png";

      // Highlight icon
      for (const k in emotionImages) {
        const icon = document.getElementById("icon-" + k);
        if (icon) icon.classList.remove("active");
      }
      const activeIcon = document.getElementById("icon-" + topEmotion);
      if (activeIcon) activeIcon.classList.add("active");

      // Link to correct page
      if (emotionLinks[topEmotion]) {
        linkEl.href = emotionLinks[topEmotion];
        linkEl.classList.add("active");
      } else {
        linkEl.href = "#";
        linkEl.classList.remove("active");
      }
    }
  }, 500);
}
