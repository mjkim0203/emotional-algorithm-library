const TOPIC_TYPE = {
  CONTROL: "control",
  DISPLAY: "display"
};

(function () {
  const container = {
    client: null,
    topic: null,

    mqttConnect: function (prefix, type, onConnect, options = {}) {
      const brokerUrl = options.brokerUrl || "wss://test.mosquitto.org:8081/mqtt";
      this.topic = `${prefix}/goldstar/${type}`;

      console.log("브로커 URL:", brokerUrl);
      console.log("구독 토픽:", this.topic);

      // ✅ 정확한 생성자: Paho.MQTT.Client
      this.client = new Paho.MQTT.Client(brokerUrl, "client-" + Math.floor(Math.random() * 10000));

      this.client.onConnectionLost = function (response) {
        console.warn("MQTT 연결 끊김:", response.errorMessage);
      };

      this.client.onMessageArrived = function (message) {
        console.log("📩 수신 메시지:", message.payloadString);
        if (typeof container.onMessage === "function") {
          container.onMessage(message.payloadString);
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
      console.log("📤 메시지 전송됨:", payload);
    }
  };

  // ✅ 반드시 전역으로 노출
  window.ttContainer = container;
})();
