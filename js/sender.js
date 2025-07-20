
const projectCode = "sample";

ttContainer.mqttConnect(
  projectCode,
  TOPIC_TYPE.CONTROL,
  () => console.log("✅ MQTT 연결 성공 (CONTROL)"),
  {
    brokerUrl: "wss://test.mosquitto.org:8081/mqtt"
  }
);

function publishMessage() {
  const url = document.getElementById("videoUrl").value;
  if (!url.endsWith(".mp4")) {
    alert("⚠️ .mp4 링크 입력 필요");
    return;
  }
  ttContainer.sendMessage(url);
}
