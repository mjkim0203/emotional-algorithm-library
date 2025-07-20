ttContainer.mqttConnect(
  "sample",
  TOPIC_TYPE.CONTROL,
  () => console.log("✅ MQTT 연결 성공 (CONTROL)"),
  { brokerUrl: "wss://test.mosquitto.org:8081/mqtt" }
);

function publishMessage() {
  const url = document.getElementById("videoUrl").value;
  if (!url.endsWith(".mp4")) {
    alert("⚠️ .mp4 링크를 입력해주세요.");
    return;
  }
  ttContainer.sendMessage(url);
}
