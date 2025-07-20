console.log("▶▶▶ player.js 로드됨");

document.addEventListener("DOMContentLoaded", () => {
  console.log("▶ DOMContentLoaded 발생");

  const projectCode = "sample";

  TTContainer.mqttConnect(
    projectCode,
    "DISPLAY",
    () => console.log("✅ MQTT 연결 성공 (DISPLAY)")
  );

  TTContainer.onMessage = function (message) {
    console.log("▶ 수신된 메시지:", message);
    const video = document.getElementById("player");
    video.src = message;
    video.load();
    video.play().then(() => {
      console.log("▶ 비디오 자동 재생 성공");
    }).catch(err => {
      console.error("❌ 비디오 재생 오류:", err);
    });
  };
});
