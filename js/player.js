// js/player.js

window.addEventListener("DOMContentLoaded", () => {
  const videoElement = document.getElementById("player");

  // ✅ 메시지 수신 시 호출될 함수 정의
  ttContainer.onMessage = (url) => {
    console.log("🎥 재생할 URL 수신됨:", url);
    videoElement.src = url;
    videoElement.load();
    videoElement.play();
  };

  // ✅ MQTT 연결
  ttContainer.mqttConnect(
    "sample",
    "display", // ✅ sender와 동일한 토픽
    () => console.log("✅ MQTT 연결 성공 (DISPLAY)"),
    {
      brokerUrl: "wss://test.mosquitto.org:8081/mqtt"
    }
  );
});
