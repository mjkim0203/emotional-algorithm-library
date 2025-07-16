async function init() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");

  // 외부 웹캠 우선 선택
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cams = devices.filter(device => device.kind === "videoinput");
  const externalCam = cams.find(d => d.label.toLowerCase().includes("usb")) || cams[cams.length - 1];

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: externalCam.deviceId },
    audio: false
  });

  const video = document.createElement("video");
  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;

  video.addEventListener("loadedmetadata", () => {
    video.play();

    const canvas = faceapi.createCanvasFromMedia(video);
    const container = document.getElementById("canvasContainer");
    container.innerHTML = "";
    container.appendChild(canvas);

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const displaySize = { width: canvas.width, height: canvas.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 128 }))
        .withFaceLandmarks(true)
        .withFaceExpressions();

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (detections) {
        const resized = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvas, resized);
        faceapi.draw.drawFaceLandmarks(canvas, resized);
        faceapi.draw.drawFaceExpressions(canvas, resized);
      }
    }, 200);
  });
}

init();
