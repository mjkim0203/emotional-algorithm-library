// js/player.js
console.log("▶▶▶ player.js 로드됨");

document.addEventListener('DOMContentLoaded', () => {
  console.log("▶ DOMContentLoaded");

  ttContainer.mqttConnect(
    "sample",
    TOPIC_TYPE.DISPLAY,
    () => console.log("✅ MQTT 연결 성공 (DISPLAY)")
  );

  ttContainer.onMessage = msg => {
    console.log("📨 수신 메시지:", msg);
    const video = document.getElementById("player");
    video.src = msg;
    video.load();
    video.play().then(
      () => console.log("▶ 비디오 자동 재생됨"),
      err => console.error("❌ 재생 오류:", err)
    );
  };
});
