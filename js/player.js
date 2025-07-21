ttContainer.onMessage = function (url) {
  const video = document.getElementById("player");
  if (!video) {
    console.error("❌ 비디오 요소를 찾을 수 없습니다.");
    return;
  }

  console.log("▶️ 재생할 영상 URL:", url);
  video.src = url;
  video.preload = "auto";  // ✅ 빠른 버퍼링 유도
  video.load();
  video.play().then(() => {
    console.log("🎬 자동 재생 성공");
  }).catch(err => {
    console.warn("⚠️ 자동 재생 실패:", err.message);
  });
};

ttContainer.mqttConnect(
  "sample",
  "display",
  () => console.log("📡 연결 및 구독 완료 (PLAYER)"),
  { brokerUrl: "wss://test.mosquitto.org:8081/mqtt" }
);
