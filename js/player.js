ttContainer.onMessage = function(payload) {
  const video = document.getElementById("player");
  video.src = payload;
};
ttContainer.mqttConnect(
  "sample",
  TOPIC_TYPE.DISPLAY,
  () => console.log("✅ MQTT 연결 성공 (DISPLAY)")
);
