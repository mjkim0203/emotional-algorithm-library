const TOPIC_TYPE = {
  CONTROL: 'control',
  DISPLAY: 'display'
};

const ttContainer = {
  client: null,

  mqttConnect: function(projectCode, type, onConnected, options) {
    const topic = `${projectCode}/goldstar/${type}`;
    const clientId = `client_${Math.random().toString(16).substr(2, 8)}`;
    const brokerUrl = options.brokerUrl;

    console.log("브로커 URL:", brokerUrl);
    console.log("구독 토픽:", topic);

    this.client = new Paho.Client(brokerUrl, clientId);

    this.client.onConnectionLost = (response) => {
      console.warn("🔌 연결 끊김:", response.errorMessage);
    };

    this.client.onMessageArrived = (message) => {
      console.log("📩 메시지 수신:", message.payloadString);
      if (typeof this.onMessage === 'function') {
        this.onMessage(message.payloadString);
      }
    };

    this.client.connect({
      onSuccess: () => {
        console.log("✅ 연결 성공");
        this.client.subscribe(topic);
        if (onConnected) onConnected();
      },
      onFailure: (err) => {
        console.error("❌ 연결 실패:", err.errorMessage);
      }
    });
  },

  sendMessage: function(msg) {
    const topic = `${"sample"}/goldstar/display`;
    const message = new Paho.Message(msg);
    message.destinationName = topic;
    this.client.send(message);
  },

  onMessage: null
};
