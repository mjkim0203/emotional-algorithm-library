// js/TTContainer.js
class TTContainer {
  constructor() {
    this.mqttClient = null;
    this.onMessage = () => {};
  }

  mqttConnect(projectCode, topicType, onConnected, opts = {}) {
    const broker = opts.brokerUrl;
    console.log(`brokerUrl:${broker} 적용됨`);
    const clientId = 'client_' + Math.random().toString(16).slice(2);
    this.mqttClient = new Paho.MQTT.Client(
      broker,
      clientId
    );

    this.mqttClient.onConnectionLost = response => {
      console.error("MQTT 연결 끊김:", response.errorMessage);
    };

    this.mqttClient.onMessageArrived = msg => {
      console.log("📝 Arrived:", msg.destinationName, msg.payloadString);
      this.onMessage(msg.payloadString);
    };

    this.mqttClient.connect({
      useSSL: broker.startsWith('wss'),
      onSuccess: () => {
        const topic = `${projectCode}/${topicType.toLowerCase()}`;
        this.mqttClient.subscribe(topic);
        console.log("✅ MQTT 연결 성공 (" + topicType + ")");
        onConnected();
      },
      onFailure: e => {
        console.error("❌ MQTT 연결 실패:", e.errorMessage);
      }
    });
  }

  sendMessage(payload) {
    if (!this.mqttClient || !this.mqttClient.isConnected()) {
      console.error("⚠️ MQTT 미연결 상태에서 sendMessage 호출");
      return;
    }
    const msg = new Paho.MQTT.Message(payload);
    msg.destinationName = `sample/display`;
    this.mqttClient.send(msg);
    console.log("📨 메시지 발송:", payload);
  }
}

const ttContainer = new TTContainer();

const TOPIC_TYPE = {
  DISPLAY: 'DISPLAY',
  CONTROL: 'CONTROL'
};
