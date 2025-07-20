'use strict';

const TOPIC_TYPE = {
  DISPLAY: "/goldstar/display",
  CONTROL: "/goldstar/control",
};

const ttContainer = {
  projectCode: null,
  mqttInfo: {
    clientId: "Web_Client_" + parseInt(Math.random() * 10000, 10),
    host: "test.mosquitto.org",
    port: 8081,
    useSSL: true,
    userName: null,
    password: null,
    keepAliveInterval: 30,
    isReconnect: true,
    topicType: null,
  },
  mqttClient: null,
  mqttConnected: false,

  mqttConnect(projectCode, topic_type, onConnected = function () {}, options = {}) {
    if (!topic_type) {
      console.error("❗ mqttConnect: topic_type이 필요합니다.");
      return;
    }

    this.projectCode = projectCode;
    this.mqttInfo.topicType = topic_type;
    this.onConnected = onConnected;

    if (options.brokerUrl) {
      try {
        const url = new URL(options.brokerUrl);
        this.mqttInfo.host = url.hostname;
        this.mqttInfo.port = parseInt(url.port);
        this.mqttInfo.useSSL = url.protocol === "wss:";
        console.log("🌐 brokerUrl 적용됨:", this.mqttInfo.host, this.mqttInfo.port);
      } catch (e) {
        console.warn("⚠️ brokerUrl 파싱 실패:", options.brokerUrl);
      }
    }

    this.mqttClient = new Paho.MQTT.Client(
      this.mqttInfo.host,
      this.mqttInfo.port,
      "/mqtt",
      this.mqttInfo.clientId
    );

    this.mqttClient.onConnectionLost = (responseObject) => {
      console.warn("⚠️ MQTT 연결 끊김:", responseObject.errorMessage);
      this.mqttConnected = false;

      if (this.mqttInfo.isReconnect) {
        setTimeout(() => {
          console.log("🔁 재연결 시도 중...");
          this.mqttConnect(this.projectCode, this.mqttInfo.topicType, this.onConnected);
        }, 3000);
      }
    };

    this.mqttClient.onMessageArrived = (message) => {
      setTimeout(() => {
        this.recvMessage(message.destinationName, message.payloadString);
      });
    };

    const connectOptions = {
      useSSL: this.mqttInfo.useSSL,
      keepAliveInterval: this.mqttInfo.keepAliveInterval,
      onSuccess: () => {
        this.mqttConnected = true;
        console.log("✅ MQTT 연결 성공:", this.mqttInfo.host + ":" + this.mqttInfo.port);

        const topic = this.projectCode + this.mqttInfo.topicType;
        this.subscribe(topic);
        this.onConnected();
      },
      onFailure: (err) => {
        this.mqttConnected = false;
        console.error("❌ MQTT 연결 실패:", err.errorMessage);

        if (this.mqttInfo.isReconnect) {
          setTimeout(() => {
            this.mqttConnect(this.projectCode, this.mqttInfo.topicType, this.onConnected);
          }, 3000);
        }
      }
    };

    if (typeof this.mqttInfo.userName === 'string') connectOptions.userName = this.mqttInfo.userName;
    if (typeof this.mqttInfo.password === 'string') connectOptions.password = this.mqttInfo.password;

    this.mqttClient.connect(connectOptions);
  },

  subscribe(topic) {
    if (!this.mqttClient || !this.mqttConnected) {
      console.error("⚠️ MQTT 클라이언트가 연결되지 않았습니다.");
      return;
    }
    this.mqttClient.subscribe(topic, { qos: 0 });
    console.log("📡 구독 완료:", topic);
  },

  publish(topic, message, qos = 0) {
    if (!this.mqttClient || !this.mqttConnected) {
      console.error("⚠️ MQTT 연결 안됨 - publish 실패");
      return;
    }
    this.mqttClient.send(topic, message, qos);
    console.log("📤 publish:", topic, message);
  },

  sendMessage(message) {
    const topic = (this.mqttInfo.topicType === TOPIC_TYPE.DISPLAY)
      ? this.projectCode + TOPIC_TYPE.CONTROL
      : this.projectCode + TOPIC_TYPE.DISPLAY;

    console.log("📨 sendMessage 호출됨");
    console.log("→ 전송 대상 토픽:", topic);
    console.log("→ 메시지 내용:", message);

    this.publish(topic, message);
  },

  recvMessage(topic, message) {
    if (!this.mqttConnected) {
      console.warn("⚠️ 연결 상태 아님 - 메시지 무시");
      return;
    }
    console.log("📥 수신된 메시지:", topic, message);
    this.onMessage(message);
  },

  onConnected: function () {},
  onMessage: function () {},
};
