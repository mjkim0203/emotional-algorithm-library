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

    if (typeof Paho === "undefined" || typeof Paho.MQTT === "undefined") {
      console.error("❌ Paho.MQTT가 정의되지 않았습니다. paho-mqtt.min.js가 먼저 로드되어야 합니다.");
      return;
    }

    this.client = new Paho.MQTT.Client(brokerUrl, "client-" + Math.floor(Math.random() * 10000));

    this.client.onConnectionLost = function (response) {
      console.warn("MQTT 연결 끊김:", response.errorMessage);
    };

    this.client.onMessageArrived = function (message) {
      console.log("📩 수신 메시지:", message.payloadString);
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
      console.error("❌ MQTT 클라이언트 연결되지 않음");
      return;
    }

    const message = new Paho.MQTT.Message(payload);
    message.destinationName = this.topic;
    this.client.send(message);
  }
};
