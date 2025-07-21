const TOPIC_TYPE = {
  CONTROL: "control",
  DISPLAY: "display"
};

const ttContainer = {
  client: null,
  topic: null,

  mqttConnect: function (prefix, type, onConnect, options = {}) {
    const brokerUrl = options.brokerUrl || "wss://test.mosquitto.org:8081/mqtt";
    this.topic = `${prefix}/goldstar/${type}`;

    console.log("브로커 URL:", brokerUrl);
    console.log("구독 토픽:", this.topic);

    // ✅ Client 생성 (Paho.Client로)
    this.client = new Paho.Client(brokerUrl, "client-" + Math.floor(Math.random() * 10000));

    this.client.onConnectionLost = function (response) {
      console.warn("🔌 연결 끊김:", response.errorMessage);
    };

    this.client.onMessageArrived = function (message) {
      console.log("📨 수신된 메시지:", message.payloadString);
      if (typeof ttContainer.onMessage === "function") {
        ttContainer.onMessage(message.payloadString);
      }
    };

    this.client.connect({
      onSuccess: onConnect,
      useSSL: brokerUrl.startsWith("wss://"),
      onFailure: function (err) {
        console.error("❌ MQTT 연결 실패:", err.errorMessage);
      }
    });
  },

  sendMessage: function (payload) {
    if (!this.client || !this.topic) {
      console.error("⚠️ MQTT 클라이언트가 연결되지 않았습니다.");
      return;
    }

    const message = new Paho.Message(payload);
    message.destinationName = this.topic;
    this.client.send(message);
    console.log("📤 메시지 전송됨:", payload);
  }
};
