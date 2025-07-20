console.log("▶▶▶ player.js 로드됨");

document.addEventListener('DOMContentLoaded', () => {
  console.log("▶ DOMContentLoaded 발생");

  const projectCode = "sample";

  ttContainer.mqttConnect(
    projectCode,
    TOPIC_TYPE.DISPLAY,
    () => console.log("✅ MQTT 연결 성공 (DISPLAY)"),
    {
      brokerUrl: "wss://test.mosquitto.org:8081/mqtt"  // Mosquitto 브로커
    }
  );

  ttContainer.onMessage = function(message) {
    console.log("📨 수신 메시지:", message);

    const video = document.getElementById("player");

    if (!message.endsWith(".mp4")) {
      console.warn("⚠️ 유효하지 않은 영상 주소:", message);
      return;
    }

    video.src = message;
    video.load();
    video.play().then(() => {
      console.log("▶ 비디오 재생 시작됨");
    }).catch(err => {
      console.error("❌ 재생 실패:", err);
    });
  };
});
