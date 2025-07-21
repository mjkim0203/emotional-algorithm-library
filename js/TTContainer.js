const ttContainer = {
  client: null,
  topic: null,
  onMessage: null,

  mqttConnect(prefix, type, onConnect, options = {}) {
    const brokerUrl = options.brokerUrl || "wss://test.mosquitto.org:8081/mqtt";
    this.topic = `${prefix}/goldstar/${type}`;

    console.log("📡 브로커 URL:", brokerUrl);
    console.log("📨 구독 토픽:", this.topic);

    this.client = new Paho.MQTT.Client(brokerUrl, "client-" + Math.random());

    this.client.onConnectionLost = (response) => {
      console.warn("⚠️ 연결 끊김:", response.errorMessage);
    };

    this.client.onMessageArrived = (message) => {
      console.log("📥 수신된 메시지:", message.payloadString);
      if (typeof this.onMessage === "function") {
        this.onMessage(message.payloadString);
      }
    };

    this.client.connect({
      onSuccess: onConnect,
      useSSL: true
    });
  },

  sendMessage(payload) {
    if (!this.client || !this.topic) {
      console.error("❌ MQTT 연결되지 않음");
      return;
    }
    const message = new Paho.MQTT.Message(payload);
    message.destinationName = this.topic;
    this.client.send(message);
  }
};
