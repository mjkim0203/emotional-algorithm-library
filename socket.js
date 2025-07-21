// ✅ 토픽 타입 정의
const TOPIC_TYPE = {
  DISPLAY: "display"
};

// ✅ MQTT 연결
const projectCode = "sample";
ttContainer.mqttConnect(
  projectCode,
  TOPIC_TYPE.DISPLAY,
  () => console.log("🟢 MQTT 연결 성공 (DISPLAY)"),
  {
    brokerUrl: "wss://broker.hivemq.com:8000/mqtt"
  }
);

// ✅ next-button 클릭 시 videoSrc와 audioSrc 사용
document.querySelectorAll('.next-button').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();

    const videoSrc = btn.dataset.videoSrc.trim();
    const audioSrc = btn.dataset.audioSrc.trim();     

    triggerAudio.src = audioSrc;
    triggerAudio.currentTime = 0;
    triggerAudio.play().catch(err =>
      console.warn('Audio play failed:', err)
    );

    console.log('▶ sendControlMessage:', videoSrc);
    ttContainer.sendMessage(videoSrc);  // publish → sendMessage로 통일
  });
});
