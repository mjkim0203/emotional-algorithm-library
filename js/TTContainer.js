const TOPIC_TYPE = {
  DISPLAY: "display",
  CONTROL: "control",
};

const ttContainer = {
  mqttClient: null,
  mqttConnected: false,
  onMessage: null,

  mqttConnect(projectCode, mode, onConnectCallback, mqttInfo = {}) {
    const brokerUrl = mqttInfo.brokerUrl || "wss://test.mosquitto.org:8081/mqtt";
    const topic = `sample/goldstar/${mode}`;
    const clientId = "client_" + Math.random().toString(16).substr(2, 8);

    console.log("🚀 브로커 연결 시작:", brokerUrl);
    console.log("📡 구독할 토픽:", topic);

    try {
      this.mqttClient = new Paho.Client(brokerUrl, clientId);
    } catch (e) {
      console.error("❌ Paho Client 생성 실패:", e);
      return;
    }

    this.mqttClient.onConnectionLost = (responseObject) => {
      console.warn("⚠️ MQTT 연결 끊김:", responseObject.errorMessage);
    };

    this.mqttClient.onMessageArrived = (message) => {
      console.log("📨 수신 메시지:", message.payloadString);
      if (this.onMessage) this.onMessage(message.payloadString);
    };

    this.mqttClient.connect({
      onSuccess: () => {
        console.log("✅ MQTT 연결 성공");
        this.mqttConnected = true;
        this.subscribe(topic);
        if (onConnectCallback) onConnectCallback();
      },
      onFailure: (e) => {
        console.error("❌ MQTT 연결 실패:", e.errorMessage);
      },
      useSSL: brokerUrl.startsWith("wss://"),
    });

    this.projectTopic = topic;
  },

  subscribe(topic) {
    if (!this.mqttClient || !this.mqttConnected) {
      console.error("⚠️ MQTT 클라이언트가 연결되지 않았습니다.");
      return;
    }
    this.mqttClient.subscribe(topic, { qos: 0 });
    console.log("📡 구독 완료:", topic);
  },

  sendMessage(message) {
    if (!this.mqttClient || !this.mqttConnected) {
      console.error("⚠️ MQTT 연결되지 않음, 전송 실패");
      return;
    }

    const msg = new Paho.Message(message);
    msg.destinationName = this.projectTopic;
    this.mqttClient.send(msg);
    console.log("📤 메시지 전송:", message);
  }
};
