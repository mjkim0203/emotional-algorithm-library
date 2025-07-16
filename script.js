async function getElgatoStream() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const elgatoCamera = devices.find(
    (d) => d.kind === "videoinput" && d.label.toLowerCase().includes("elgato")
  );

  if (!elgatoCamera) {
    alert("Elgato Facecam이 감지되지 않았습니다.");
    throw new Error("Elgato Facecam not found");
  }

  return navigator.mediaDevices.getUserMedia({
    video: { deviceId: { exact: elgatoCamera.deviceId }, width: 640, height: 480 },
    audio: false
  });
}

async function init() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models");

  try {
    const stream = await getElgatoStream();
    const video = document.createElement("video");
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

      const bannerEl = document.getElementById("emotion-banner");
      const linkEl = document.getElementById("emotion-link");

      canvas.width = 640;
      canvas.height = 480;
      const displaySize = { width: 640, height: 480 };
      faceapi.matchDimensions(canvas, displaySize);

      let stop = false;
      setInterval(async () => {
        if (stop) return;
        stop = true;

        const result = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold: 0.3 }))
          .withFaceLandmarks(true)
          .withFaceExpressions();

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // (감정 처리 로직은 기존 코드 유지)
        // ... 감정 분석, 색상, 그래픽 업데이트 부분 ...

        stop = false;
      }, 100);
    };
  } catch (err) {
    console.error("Webcam 초기화 실패:", err);
  }
}

init();
