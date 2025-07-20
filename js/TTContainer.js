const TOPIC_TYPE = {
  DISPLAY: "display",
  CONTROL: "control",
};

const ttContainer = {
  mqttClient: null,
  mqttConnected: false,
  onMessage: null,

  mqttConnect(projectCode, topicType, onConnect, options = {}) {
    const brokerUrl = options.brokerUrl || "wss://test.mosquitto.org:8081/mqtt";
    const topic = `sample/goldstar/${topicType}`;

    console.log("📡 브로커 URL:", brokerUrl);
    console.log("📡 구독 토픽:", topic);

    const clientId = "client_" + Math.random().toString(16).substr(2, 8);
    const client = new Paho.Client("test.mosquitto.org", 8081, "/mqtt", clientId);

    client.onConnectionLost = (responseObject) => {
      console.error("🔌 연결 끊김:", responseObject.errorMessage);
    };

    client.onMessageArrived = (message) => {
      console.log("📨 메시지 수신:", message.payloadString);
      if (this.onMessage) {
        this.onMessage(message.payloadString);
      }
    };

    client.connect({
      onSuccess: () => {
        console.log("✅ MQTT 연결 성공");
        this.mqttClient = client;
        this.mqttConnected = true;
        client.subscribe(topic);
        console.log("📡 구독 완료:", topic);
        if (onConnect) onConnect();
      },
      onFailure: (error) => {
        console.error("❌ MQTT 연결 실패:", error);
      },
      useSSL: true,
    });
  },

  sendMessage(payload) {
    const topic = "sample/goldstar/display";

    if (!this.mqttClient || !this.mqttConnected) {
      console.error("⚠️ MQTT 클라이언트가 연결되지 않았습니다.");
      return;
    }

    const message = new Paho.Message(payload);
    message.destinationName = topic;
    this.mqttClient.send(message);
    console.log("📤 메시지 전송:", payload);
  }
};
