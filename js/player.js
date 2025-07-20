console.log("▶▶▶ player.js 로드됨");

document.addEventListener('DOMContentLoaded', () => {
  console.log("▶ DOMContentLoaded 발생");

  const projectCode = "sample";  // → 구독 토픽: sample/goldstar/display

  ttContainer.mqttConnect(
    projectCode,
    TOPIC_TYPE.DISPLAY, // "/goldstar/display"
    () => console.log("✅ MQTT 연결 성공 (DISPLAY)"),
    {
      brokerUrl: "wss://test.mosquitto.org:8081/mqtt"
    }
  );

  ttContainer.onMessage = function(message) {
    console.log("📨 수신 메시지:", message);

    const video = document.getElementById("player");

    if (!message || typeof message !== 'string') {
      console.warn("⚠️ 메시지가 비어 있거나 문자열이 아님:", message);
      return;
    }

    if (!message.endsWith(".mp4")) {
      console.warn("⚠️ .mp4 파일이 아님 - 무시됨:", message);
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
