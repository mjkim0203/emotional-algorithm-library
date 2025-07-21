ttContainer.onMessage = function (url) {
  const video = document.getElementById("player");
  console.log("📩 수신 메시지:", url);

  if (!video) {
    console.error("❌ 비디오 요소를 찾을 수 없습니다.");
    return;
  }

  if (!url.endsWith(".mp4")) {
    console.warn("⚠️ 수신된 URL이 .mp4로 끝나지 않습니다:", url);
  }

  console.log("▶️ 재생할 영상 URL 설정:", url);
  video.src = url;
  video.load();
  video.play().catch(err => {
    console.warn("⚠️ 자동 재생 실패:", err.message);
  });
};

ttContainer.mqttConnect(
  "sample",
  "display",
  () => console.log("✅ MQTT 연결 성공 (PLAYER)"),
  { brokerUrl: "wss://test.mosquitto.org:8081/mqtt" }
);
