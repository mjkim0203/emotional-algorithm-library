const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const label = document.getElementById('emotion-label');

async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('./model');
}

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;
  return new Promise(res => video.onloadedmetadata = res);
}

async function run() {
  await loadModels();
  await setupCamera();
  const emoModel = await tf.loadLayersModel('./model/model.json');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  async function loop() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );
    if (detections.length) {
      const { x, y, width, height } = detections[0].box;
      let img = tf.browser.fromPixels(video)
        .slice([Math.max(0,y), Math.max(0,x), 0], [height, width, 3])
        .resizeBilinear([48,48])
        .mean(2)
        .expandDims(-1)
        .expandDims(0)
        .div(255.0);

      const preds = emoModel.predict(img);
      const idx = preds.argMax(-1).dataSync()[0];
      const emotions = ['Angry','Disgust','Fear','Happy','Sad','Surprise','Neutral'];
      label.textContent = emotions[idx];

      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      img.dispose();
      preds.dispose();
    }
    requestAnimationFrame(loop);
  }
  loop();
}

run().catch(err => {
  console.error(err);
  label.textContent = '에러 발생 — 콘솔 확인';
});
