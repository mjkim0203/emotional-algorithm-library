const projectCode = "sample";

ttContainer.mqttConnect(
  projectCode,
  TOPIC_TYPE.DISPLAY,
  () => console.log("🟢 MQTT 연결 성공 (DISPLAY)"),
  {
    // ✅ 자동 페일오버 순서
    brokers: [
      { type: "url", url: "wss://broker.emqx.io:8084/mqtt" },
      { type: "url", url: "wss://broker.hivemq.com:8884/mqtt" },
      { type: "url", url: "wss://test.mosquitto.org:8081/mqtt" }
    ]
  }
);

// 기존 버튼 핸들러 그대로 유지
document.querySelectorAll('.next-button').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();

    const videoSrc = (btn.dataset.videoSrc || "").trim();
    const audioSrc = (btn.dataset.audioSrc || "").trim();

    triggerAudio.src = audioSrc;
    triggerAudio.currentTime = 0;
    triggerAudio.play().catch(err =>
      console.warn('Audio play failed:', err)
    );

    console.log('▶ sendControlMessage:', videoSrc);
    ttContainer.sendMessage(videoSrc);
  });
});
