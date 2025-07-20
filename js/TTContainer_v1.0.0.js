// TTContainer_v1.0.0.js

const TOPIC_TYPE = {
  DISPLAY: "/goldstar/display",
  CONTROL: "/goldstar/control"
};

function TTContainer() {
  this.mqttClient = null;
  this.projectCode = "";
  this.mqttInfo = {
    topicType: "",
    brokerUrl: ""
  };
  this.mqttConnected = false;
  this.onMessage = null;
}

TTContainer.prototype.mqttConnect = function (projectCode, topicType, callback, options = {}) {
  this.projectCode = projectCode;
  this.mqttInfo.topicType = topicType;
  this.mqttInfo.brokerUrl = options.brokerUrl || "wss://test.mosquitto.org:8081/mqtt";

  const clientId = "client_" + Math.random().toString(16).substr(2, 8);
  this.mqttClient = new Paho.MQTT.Client(this.mqttInfo.brokerUrl, clientId);

  this.mqttClient.onConnectionLost = (responseObject) => {
    console.error("❌ MQTT 연결 끊김:", responseObject.errorMessage);
    this.mqttConnected = false;
  };

  this.mqttClient.onMessageArrived = (message) => {
    console.log("📨 MQTT 메시지 도착:", message.destinationName, message.payloadString);
    if (this.onMessage) {
      this.onMessage(message.payloadString);
    }
  };

  this.mqttClient.connect({
    useSSL: this.mqttInfo.brokerUrl.startsWith("wss://"),
    onSuccess: () => {
      console.log("✅ MQTT 연결 성공");
      this.mqttConnected = true;

      const topic = projectCode + topicType;
      this.subscribe(topic);
      if (callback) callback();
    },
    onFailure: (e) => {
      console.error("❌ MQTT 연결 실패:", e);
    }
  });
};

TTContainer.prototype.subscribe = function (topic) {
  if (!this.mqttClient || !this.mqttConnected) {
    console.error("⚠️ MQTT 클라이언트가 연결되지 않았습니다.");
    return;
  }
  this.mqttClient.subscribe(topic, { qos: 0 });
  console.log("📡 구독 완료:", topic);
};

TTContainer.prototype.publish = function (topic, message) {
  if (!this.mqttClient || !this.mqttConnected) {
    console.error("⚠️ MQTT 연결되지 않음. publish 실패");
    return;
  }

  const mqttMessage = new Paho.MQTT.Message(message);
  mqttMessage.destinationName = topic;
  this.mqttClient.send(mqttMessage);
  console.log("📤 메시지 전송됨:", topic, message);
};

TTContainer.prototype.sendMessage = function (message) {
  const topic =
    this.mqttInfo.topicType === TOPIC_TYPE.DISPLAY
      ? this.projectCode + TOPIC_TYPE.CONTROL
      : this.projectCode + TOPIC_TYPE.DISPLAY;

  console.log("📨 sendMessage 호출됨");
  console.log("→ 전송 대상 토픽:", topic);
  console.log("→ 메시지 내용:", message);

  this.publish(topic, message);
};

window.ttContainer = new TTContainer();
