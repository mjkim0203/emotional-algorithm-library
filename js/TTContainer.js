const TOPIC_TYPE = {
  DISPLAY: "display",
  CONTROL: "control"
};

const ttContainer = {
  mqttClient: null,
  mqttConnected: false,

  mqttConnect(projectCode, topicType, onSuccess, options = {}) {
    const brokerUrl = options.brokerUrl || "wss://test.mosquitto.org:8081/mqtt";
    const clientId = "client_" + Math.random().toString(16).substr(2, 8);

    console.log("📡 브로커 URL:", brokerUrl);

    const host = new URL(brokerUrl).hostname;
    const port = parseInt(new URL(brokerUrl).port);
    const path = new URL(brokerUrl).pathname;

    // ✅ 핵심: mqttws31.js의 Client 생성자 사용
    const client = new Paho.MQTT.Client(host, port, path, clientId);

    client.onConnectionLost = err => {
      console.error("❌ MQTT 연결 끊김", err);
    };

    client.onMessageArrived = msg => {
      console.log("📨 MQTT 메시지 수신:", msg.payloadString);
      if (typeof this.onMessage === "function") {
        this.onMessage(msg.payloadString);
      }
    };

    client.connect({
      useSSL: true,
      onSuccess: () => {
        console.log("✅ MQTT 연결 성공");
        this.mqttClient = client;
        this.mqttConnected = true;

        const topic = `${projectCode}/goldstar/${topicType}`;
        client.subscribe(topic);
        console.log("📡 구독 토픽:", topic);

        if (typeof onSuccess === "function") {
          onSuccess();
        }
      },
      onFailure: err => {
        console.error("❌ MQTT 연결 실패", err);
      }
    });
  },

  sendMessage(payload) {
    if (!this.mqttConnected || !this.mqttClient) {
      console.warn("⚠️ MQTT 연결이 안 되어 있음");
      return;
    }

    const topic = "sample/goldstar/display";
    const msg = new Paho.MQTT.Message(payload);
    msg.destinationName = topic;
    this.mqttClient.send(msg);
    console.log("📤 MQTT 메시지 전송:", payload);
  },

  onMessage: null
};
