'use strict';

const TOPIC_TYPE = {
  DISPLAY: "/goldstar/display",
  CONTROL: "/goldstar/control",
};

const ttContainer = {
  projectCode: null,
  mqttInfo: {
    clientId: "Web_Client_" + parseInt(Math.random() * 100 * 100, 10),

    // ✅ 브로커 자동 페일오버: EMQX → HiveMQ → Mosquitto
    brokers: [
      { type: "url", url: "wss://broker.emqx.io:8084/mqtt" },
      { type: "url", url: "wss://broker.hivemq.com:8884/mqtt" },
      { type: "url", url: "wss://test.mosquitto.org:8081/mqtt" }
    ],

    keepAliveInterval: 30,
    isReconnect: true,
    reconnectTriesPerBroker: 4,   // 브로커당 재시도 한도
    topicType: null,
  },

  mqttClient: null,
  mqttConnected: false,

  // 내부 상태
  _brokerIndex: 0,
  _retryCountThisBroker: 0,
  _currentBroker: null,

  mqttConnect(projectCode, topic_type, onConnected = function () {}) {
    if (topic_type == null) {
      console.error("topic_type is required for mqttConnect");
      return;
    }
    this.onConnected = onConnected;
    this.projectCode = projectCode;
    this.mqttInfo.topicType = topic_type;

    // 초기화
    this._brokerIndex = 0;
    this._retryCountThisBroker = 0;

    this._tryConnectToCurrentOrNextBroker();
  },

  _tryConnectToCurrentOrNextBroker() {
    const brokers = this.mqttInfo.brokers;
    if (!Array.isArray(brokers) || brokers.length === 0) {
      console.error("No MQTT brokers configured.");
      return;
    }

    if (this._brokerIndex >= brokers.length) {
      console.error("❌ 모든 브로커 연결 실패:", brokers.map(b => b.url).join(", "));
      return;
    }

    this._currentBroker = brokers[this._brokerIndex];
    const broker = this._currentBroker;

    const clientId = this.mqttInfo.clientId + "_" + Date.now();
    try {
      if (broker.type === "url") {
        console.log("📡 MQTT 연결 시도:", broker.url);
        this.mqttClient = new Paho.MQTT.Client(broker.url, clientId);
      } else {
        console.error("Unsupported broker config:", broker);
        return this._advanceBrokerAndRetry();
      }
    } catch (e) {
      console.error("❌ MQTT Client 생성 실패:", e);
      return this._advanceBrokerAndRetry();
    }

    const self = this;

    this.mqttClient.onConnectionLost = function (responseObject) {
      console.warn("⚠️ onConnectionLost:", responseObject && responseObject.errorMessage);
      self.mqttClient = null;
      self.mqttConnected = false;

      if (!self.mqttInfo.isReconnect) return;

      setTimeout(() => {
        self._retryOrAdvanceBroker();
      }, 1200);
    };

    this.mqttClient.onMessageArrived = async function (message) {
      setTimeout(function () {
        self.recvMessage(message.destinationName, message.payloadString);
      });
    };

    const connectOptions = {
      keepAliveInterval: this.mqttInfo.keepAliveInterval,
      useSSL: broker.url.startsWith("wss://"),
      onSuccess: function () {
        self.mqttConnected = true;
        self._retryCountThisBroker = 0;
        console.log("✅ MQTT Connected:", broker.url);

        const topic = self.projectCode + self.mqttInfo.topicType;
        self.subscribe(topic);

        self.onConnected();
      },
      onFailure: function (message) {
        self.mqttConnected = false;
        console.error("❌ MQTT Connect Failed:", broker.url, message && message.errorMessage);
        if (!self.mqttInfo.isReconnect) return;
        self._retryOrAdvanceBroker();
      },
    };

    try {
      this.mqttClient.connect(connectOptions);
    } catch (e) {
      console.error("❌ connect 호출 실패:", e);
      this._advanceBrokerAndRetry();
    }
  },

  _retryOrAdvanceBroker() {
    if (this._retryCountThisBroker < (this.mqttInfo.reconnectTriesPerBroker | 0)) {
      this._retryCountThisBroker++;
      console.log(`🔁 재시도(${this._retryCountThisBroker}/${this.mqttInfo.reconnectTriesPerBroker}) - 동일 브로커`);
      this._tryConnectToCurrentOrNextBroker();
    } else {
      console.log("⏭️ 브로커 변경 (재시도 한도 초과)");
      this._advanceBrokerAndRetry();
    }
  },

  _advanceBrokerAndRetry() {
    this._brokerIndex++;
    this._retryCountThisBroker = 0;
    setTimeout(() => this._tryConnectToCurrentOrNextBroker(), 800);
  },

  subscribe(topic) {
    if (this.mqttClient == null || !this.mqttConnected) {
      return console.error("MQTT Client is not connected.");
    }
    this.mqttClient.subscribe(topic, { qos: 0 });
    console.log("📥 SUB:", topic);
  },

  publish(topic, message, qos = 0) {
    if (this.mqttClient == null || !this.mqttConnected) {
      return console.error("MQTT Client is not connected.");
    }
    this.mqttClient.send(topic, message, qos);
    console.log("📤 PUB:", topic, message);
  },

  recvMessage(topic, message) {
    try {
      if (this.mqttClient == null || !this.mqttConnected) {
        return console.error("MQTT Client is not connected.");
      }
      this.onMessage(message);
    } catch (error) {
      console.log("recvMessage Err", error);
    }
  },

  sendMessage(message) {
    // 현재 페이지 타입 기준으로 반대 토픽에 전송
    let topic;
    if (this.mqttInfo.topicType === TOPIC_TYPE.DISPLAY) {
      topic = this.projectCode + TOPIC_TYPE.CONTROL;
    } else {
      topic = this.projectCode + TOPIC_TYPE.DISPLAY;
    }
    this.publish(topic, message);
  },

  onConnected: function () {},
  onMessage: function () {},
};
