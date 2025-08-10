ttContainer.onMessage = function (url) {
  const video = document.getElementById("player");
  if (!video) {
    console.error("❌ 비디오 요소를 찾을 수 없습니다.");
    return;
  }

  console.log("▶️ 재생할 영상 URL:", url);
  video.src = url;
  video.load();
  video.play().catch(err => {
    console.warn("⚠️ 자동 재생 실패:", err.message);
  });
};

// ✅ 브로커 자동 페일오버: EMQX → HiveMQ → Mosquitto
ttContainer.mqttConnect(
  "sample",
  TOPIC_TYPE.DISPLAY, // ← 최신 TTContainer.js 기준
  () => console.log("✅ MQTT 연결 성공 (PLAYER)"),
  {
    brokers: [
      { type: "url", url: "wss://broker.emqx.io:8084/mqtt" },
      { type: "url", url: "wss://broker.hivemq.com:8884/mqtt" },
      { type: "url", url: "wss://test.mosquitto.org:8081/mqtt" }
    ]
  }
);
