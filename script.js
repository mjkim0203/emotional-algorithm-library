
async function getExternalWebcamStream() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(d => d.kind === 'videoinput');
  const elgatoCam = videoDevices.find(device => device.label.toLowerCase().includes('elgato'));
  if (!elgatoCam) {
    alert('Elgato Facecam이 감지되지 않았습니다.');
    return null;
  }
  return await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: { exact: elgatoCam.deviceId },
      width: { ideal: 720 },
      height: { ideal: 1280 }
    },
    audio: false
  });
}

async function init() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
  await faceapi.nets.faceExpressionNet.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');

  const stream = await getExternalWebcamStream();
  if (!stream) return;

  const video = document.createElement("video");
  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;
  video.style.transform = "scaleX(-1)";
  document.getElementById("canvasContainer").appendChild(video);

  video.onloadedmetadata = () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    document.getElementById("canvasContainer").appendChild(canvas);
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true).withFaceExpressions();
      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections) {
        faceapi.draw.drawDetections(canvas, resized);
        faceapi.draw.drawFaceLandmarks(canvas, resized);
        faceapi.draw.drawFaceExpressions(canvas, resized);
      }
    }, 200);
  };
}
init();
