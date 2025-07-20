document.addEventListener("DOMContentLoaded", () => {
  console.log("▶▶ player.js 로드됨");

  const projectCode = "sample";
  const video = document.getElementById("player");

  ttContainer.onMessage = (url) => {
    console.log("🎬 수신한 URL:", url);
    video.src = url;
    video.load();
    video.play();
  };

  ttContainer.mqttConnect(
    projectCode,
    TOPIC_TYPE.DISPLAY,
    () => console.log("✅ MQTT 연결 성공 (DISPLAY 모드)"),
    {
      brokerUrl: "wss://test.mosquitto.org:8081/mqtt"
    }
  );
});
