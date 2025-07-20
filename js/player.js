console.log("▶▶▶ player.js 로드됨");

document.addEventListener("DOMContentLoaded", () => {
  console.log("▶ DOMContentLoaded 발생");

  const projectCode = "sample";

  ttContainer.mqttConnect(
    projectCode,
    TOPIC_TYPE.DISPLAY,
    () => console.log("✅ MQTT 연결 성공 (DISPLAY)"),
    {
      brokerUrl: "wss://test.mosquitto.org:8081/mqtt"
    }
  );

  ttContainer.onMessage = function (message) {
    console.log("📨 수신 메시지:", message);

    const video = document.getElementById("player");
    video.src = message;
    video.load();
    video.play()
      .then(() => console.log("▶ 비디오 자동 재생됨"))
      .catch(err => console.error("❌ 재생 오류:", err));
  };
});
