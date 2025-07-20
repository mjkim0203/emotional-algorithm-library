document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("player");

  ttContainer.onMessage = function (url) {
    console.log("📩 재생 요청 URL:", url);
    video.src = url;
    video.play();
  };

  ttContainer.mqttConnect(
    "sample",
    TOPIC_TYPE.CONTROL,
    () => console.log("✅ MQTT 연결 성공 (PLAYER)"),
    { brokerUrl: "wss://test.mosquitto.org:8081/mqtt" }
  );
});
