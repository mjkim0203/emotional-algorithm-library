document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ player.js 로딩됨");

  const video = document.getElementById("player");

  ttContainer.onMessage = function (url) {
    console.log("🎥 재생할 URL 수신됨:", url);
    video.src = url;
    video.play().catch(err => {
      console.error("❌ 비디오 재생 실패:", err);
    });
  };

  ttContainer.mqttConnect(
    "sample",
    "display",
    () => console.log("✅ MQTT 연결 성공 (DISPLAY)"),
    { brokerUrl: "wss://test.mosquitto.org:8081/mqtt" }
  );
});
