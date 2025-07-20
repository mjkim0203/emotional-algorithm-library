const TTContainer = (() => {
  let client = null;
  let onMessageCallback = null;

  const mqttConnect = (projectCode, topicType, onConnect, options = {}) => {
    const brokerUrl = options.brokerUrl || "wss://test.mosquitto.org:8081/mqtt";
    const topic = `${projectCode}/goldstar/${topicType.toLowerCase()}`;
    console.log("📡 브로커 URL:", brokerUrl);
    console.log("📩 구독 토픽:", topic);

    client = new Paho.MQTT.Client(brokerUrl, `client-${Date.now()}`);

    client.onConnectionLost = (responseObject) => {
      console.error("❌ 연결 끊김:", responseObject.errorMessage);
    };

    client.onMessageArrived = (message) => {
      console.log("📨 수신 메시지:", message.payloadString);
      if (onMessageCallback) onMessageCallback(message.payloadString);
    };

    client.connect({
      onSuccess: () => {
        console.log("✅ MQTT 연결 성공");
        client.subscribe(topic);
        if (onConnect) onConnect();
      },
      useSSL: true
    });
  };

  const sendMessage = (msg, topic = "sample/goldstar/display") => {
    if (!client || !msg) return;
    const message = new Paho.MQTT.Message(msg);
    message.destinationName = topic;
    client.send(message);
  };

  return {
    mqttConnect,
    sendMessage,
    set onMessage(callback) {
      onMessageCallback = callback;
    }
  };
})();
