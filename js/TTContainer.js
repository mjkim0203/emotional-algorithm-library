const TOPIC_TYPE = {
  CONTROL: "control",
  DISPLAY: "display"
};

const ttContainer = {
  client: null,
  topic: null,
  onMessage: null,

  mqttConnect: function (prefix, type, onConnect, options = {}) {
    const brokerUrl = options.brokerUrl || "wss://test.mosquitto.org:8081/mqtt";
    this.topic = `${prefix}/goldstar/${type}`;

    console.log("브로커 URL:", brokerUrl);
    console.log("구독 토픽:", this.topic);

    this.client = new Paho.MQTT.Client(brokerUrl, "client-" + parseInt(Math.random() * 10000));

    this.client.onConnectionLost = function (response) {
      console.warn("연결 끊김:", response.errorMessage);
    };

    this.client.onMessageArrived = function (message) {
      console.log("📩 메시지 수신:", message.payloadString);
      if (typeof ttContainer.onMessage === "function") {
        ttContainer.onMessage(message.payloadString);
      }
    };

    this.client.connect({
      onSuccess: onConnect,
      useSSL: true
    });
  },

  sendMessage: function (payload) {
    if (!this.client || !this.topic) {
      console.error("MQTT 미연결 상태입니다.");
      return;
    }

    const message = new Paho.MQTT.Message(payload);
    message.destinationName = this.topic;
    this.client.send(message);
  }
};
