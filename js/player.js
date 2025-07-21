// js/player.js

window.addEventListener("DOMContentLoaded", () => {
  const videoElement = document.getElementById("player");

  // ✅ 메시지 수신 콜백 등록
  ttContainer.onMessage = (url) => {
    console.log("🎥 재생할 URL 수신됨:", url);
    videoElement.src = url;
    videoElement.load();
    videoElement.play();
  };

  // ✅ MQTT 연결 시작
  ttContainer.mqttConnect(
    "sample",
    "display",
    () => console.log("✅ MQTT 연결 성공 (DISPLAY)"),
    {
      brokerUrl: "wss://test.mosquitto.org:8081/mqtt"
    }
  );
});
