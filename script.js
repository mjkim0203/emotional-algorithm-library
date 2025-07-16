let video = document.createElement("video");
let stream = null;
let stop = false;

async function init() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");

  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === "videoinput");

  const externalCam = videoDevices.find(d => d.label.toLowerCase().includes("usb")) || videoDevices[videoDevices.length - 1];

  stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: externalCam.deviceId },
    audio: false
  });

  video.srcObject = stream;
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;

  video.onloadedmetadata = () => {
    video.play();

    const canvas = faceapi.createCanvasFromMedia(video);
    const container = document.getElementById("canvasContainer");
    container.innerHTML = "";
    container.appendChild(canvas);

    canvas.width = 360;
    canvas.height = 640;

    const displaySize = { width: 360, height: 640 };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      if (stop) return;
      stop = true;

      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold: 0.5 });
      const result = await faceapi.detectSingleFace(video, options);

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
        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 4;
        ctx.strokeRect(canvas.width - box.x - box.width, box.y, box.width, box.height);
      }

      stop = false;
    }, 200);
  };
}

init();
