const projectCode = "sample";
ttContainer.mqttConnect(
  projectCode,
  TOPIC_TYPE.DISPLAY,
  () => console.log("🟢 MQTT 연결 성공 (DISPLAY)"),
  {
    brokerUrl: "wss://test.mosquitto.org:8081/mqtt"  // ✅ EMQX로 수정
  }
);


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
    ttContainer.sendMessage(videoSrc);
  });
});
