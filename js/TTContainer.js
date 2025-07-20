const TTContainer = {
  mqttClient: null,
  mqttConnected: false,

  mqttConnect(projectCode, topicType, onConnected, options = {}) {
    const broker = options.brokerUrl || "wss://test.mosquitto.org:8081/mqtt";
    console.log("📡 브로커 URL:", broker);

    const topic = `sample/goldstar/${topicType.toLowerCase()}`;
    console.log("📡 구독 토픽:", topic);

    this.mqttClient = new Paho.MQTT.Client(broker, "client-" + Math.random());

    this.mqttClient.onMessageArrived = (msg) => {
      console.log("📨 수신 메시지:", msg.payloadString);
      if (typeof this.onMessage === "function") {
        this.onMessage(msg.payloadString);
      }
    };

    this.mqttClient.connect({
      useSSL: true,
      onSuccess: () => {
        this.mqttConnected = true;
        this.mqttClient.subscribe(topic);
        console.log("✅ MQTT 연결 성공");
        onConnected();
      },
      onFailure: (e) => {
        console.error("❌ MQTT 연결 실패:", e);
      }
    });
  },

  sendMessage(message) {
    if (!this.mqttConnected) {
      console.error("❌ MQTT 미연결 상태");
      return;
    }
    const topic = "sample/goldstar/display";
    const msg = new Paho.MQTT.Message(message);
    msg.destinationName = topic;
    this.mqttClient.send(msg);
    console.log("📤 메시지 발송:", message);
  },

  onMessage: null
};

const TOPIC_TYPE = {
  DISPLAY: "display",
  CONTROL: "control"
};
