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
      console.error("❌ Paho.MQTT가 정의되지 않았습니다.");
      return;
    }

    this.client = new Paho.MQTT.Client(brokerUrl, "client-" + Math.floor(Math.random() * 10000));

    this.client.onConnectionLost = function (response) {
      console.warn("⚠️ MQTT 연결 끊김:", response.errorMessage);
    };

    this.client.onMessageArrived = function (message) {
      console.log("📩 수신 메시지:", message.payloadString);
      if (typeof ttContainer.onMessage === "function") {
        ttContainer.onMessage(message.payloadString);
      } else {
        console.warn("⚠️ ttContainer.onMessage 핸들러가 정의되어 있지 않습니다.");
      }
    };

    this.client.connect({
      useSSL: true,
      cleanSession: true,
      keepAliveInterval: 30,
      timeout: 5,
      onSuccess: () => {
        console.log("✅ MQTT 연결 성공");
        this.client.subscribe(this.topic);  // ✅ 연결 즉시 구독
        console.log("📥 토픽 구독 완료:", this.topic);
        if (typeof onConnect === "function") onConnect();
      },
      onFailure: (e) => {
        console.error("❌ MQTT 연결 실패:", e.errorMessage);
      }
    });
  },

  sendMessage: function (payload) {
    if (!this.client || !this.topic) {
      console.error("❌ MQTT 클라이언트가 연결되지 않았습니다.");
      return;
    }

    const message = new Paho.MQTT.Message(payload);
    message.destinationName = this.topic;
    message.retained = true; // ✅ 새로운 구독자도 받을 수 있게
    console.log("📤 메시지 전송됨:", payload);
    this.client.send(message);
  }
};
