// player.js

console.log("📥 player.js 로딩됨");

document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 DOMContentLoaded 발생");

  const videoElement = document.getElementById("player");

  ttContainer.onMessage = (url) => {
    console.log("🎥 재생할 URL 수신됨:", url);

    if (!url.endsWith(".mp4")) {
      console.warn("⚠️ 잘못된 비디오 URL입니다:", url);
      return;
    }

    videoElement.src = url;
    videoElement.load();
    videoElement.play()
      .then(() => console.log("▶️ 비디오 재생 시작됨"))
      .catch((e) => console.error("❌ 재생 실패:", e));
  };

  // MQTT 연결
  ttContainer.mqttConnect(
    "sample",
    "display", // ✅ sender와 동일하게 맞춤
    () => console.log("✅ MQTT 연결 성공 (DISPLAY)"),
    { brokerUrl: "wss://test.mosquitto.org:8081/mqtt" }
  );
});
