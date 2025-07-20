// TTContainer.js

const TOPIC_TYPE = {
  DISPLAY: "display",
  CONTROL: "control"
};

const ttContainer = {
  mqttClient: null,
  mqttConnected: false,
  onMessage: null,

  mqttConnect(projectCode, type, onSuccess, mqttInfo = {}) {
    const brokerHost = mqttInfo.brokerUrl?.replace(/^wss?:\/\//, "").split(":")[0] || "test.mosquitto.org";
    const brokerPort = Number(mqttInfo.brokerUrl?.match(/:(\d+)/)?.[1]) || 8081;
    const brokerPath = mqttInfo.brokerUrl?.split(brokerPort)[1] || "/mqtt";

    const clientId = "client_" + Math.random().toString(16).substr(2, 8);
    const topic = `${projectCode}/goldstar/${type}`;

    console.log("📡 Connecting to broker:", brokerHost, brokerPort, brokerPath);

    // ✅ 핵심: Paho.MQTT.Client 사용
    this.mqttClient = new Paho.MQTT.Client(brokerHost, brokerPort, brokerPath, clientId);

    this.mqttClient.onConnectionLost = response => {
      console.error("🚫 MQTT 연결 끊김:", response.errorMessage);
      this.mqttConnected = false;
    };

    this.mqttClient.onMessageArrived = message => {
      console.log("📨 MQTT 수신 메시지:", message.payloadString);
      if (typeof this.onMessage === "function") {
        this.onMessage(message.payloadString);
      }
    };

    this.mqttClient.connect({
      useSSL: true,
      onSuccess: () => {
        console.log("✅ MQTT 연결 성공:", topic);
        this.mqttConnected = true;
        this.mqttClient.subscribe(topic);
        console.log("📡 구독 완료:", topic);
        if (typeof onSuccess === "function") onSuccess();
      },
      onFailure: err => {
        console.error("❌ MQTT 연결 실패:", err.errorMessage);
      }
    });

    this._currentTopic = topic;
  },

  sendMessage(message) {
    if (!this.mqttClient || !this.mqttConnected) {
      console.error("⚠️ MQTT 클라이언트가 연결되지 않았습니다.");
      return;
    }

    if (!this._currentTopic) {
      console.error("⚠️ 전송할 토픽이 설정되지 않았습니다.");
      return;
    }

    const msg = new Paho.MQTT.Message(message);
    msg.destinationName = this._currentTopic;
    this.mqttClient.send(msg);
    console.log("📤 메시지 전송됨:", message);
  }
};
