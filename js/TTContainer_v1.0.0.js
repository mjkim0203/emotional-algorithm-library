'use strict';

const TOPIC_TYPE = {
	DISPLAY: "/goldstar/display",
	CONTROL: "/goldstar/control",
};

const ttContainer = {
	projectCode: null,
	mqttInfo: {
		clientId: "Web_Client_" + parseInt(Math.random() * 10000, 10),
		host: "broker.hivemq.com",          // ✅ HiveMQ broker
		port: 8884,                          // ✅ HiveMQ WSS 포트
		useSSL: true,                        // ✅ SSL 사용
		userName: null,                      // HiveMQ public broker는 인증 불필요
		password: null,
		keepAliveInterval: 30,
		isReconnect: true,
		topicType: null,
	},
	mqttClient: null,
	mqttConnected: false,

	mqttConnect(projectCode, topic_type, onConnected = function () {}) {
		if (!topic_type) {
			console.error("❗ mqttConnect: topic_type이 필요합니다.");
			return;
		}

		this.onConnected = onConnected;
		this.projectCode = projectCode;
		this.mqttInfo.topicType = topic_type;

		this.mqttClient = new Paho.MQTT.Client(
			this.mqttInfo.host,
			this.mqttInfo.port,
			"/mqtt", // ✅ HiveMQ WebSocket 경로
			this.mqttInfo.clientId
		);

		this.mqttClient.onConnectionLost = (responseObject) => {
			console.warn("MQTT 연결 끊김:", responseObject?.errorMessage);
			this.mqttConnected = false;

			if (this.mqttInfo.isReconnect) {
				setTimeout(() => {
					this.mqttConnect(projectCode, topic_type);
				}, 3000);
			}
		};

		this.mqttClient.onMessageArrived = (message) => {
			setTimeout(() => {
				this.recvMessage(message.destinationName, message.payloadString);
			});
		};

		this.mqttClient.connect({
			useSSL: this.mqttInfo.useSSL,
			keepAliveInterval: this.mqttInfo.keepAliveInterval,
			onSuccess: () => {
				this.mqttConnected = true;
				console.log("✅ HiveMQ 연결 성공");

				const topic = this.projectCode + this.mqttInfo.topicType;
				this.subscribe(topic);

				this.onConnected();
			},
			onFailure: (err) => {
				this.mqttConnected = false;
				console.error("❌ HiveMQ 연결 실패:", err.errorMessage);

				if (this.mqttInfo.isReconnect) {
					setTimeout(() => {
						this.mqttConnect(projectCode, topic_type);
					}, 3000);
				}
			}
		});
	},

	subscribe(topic) {
		if (!this.mqttClient || !this.mqttConnected) {
			console.error("⚠️ MQTT 클라이언트가 연결되지 않았습니다.");
			return;
		}
		this.mqttClient.subscribe(topic, { qos: 0 });
	},

	publish(topic, message, qos = 0) {
		if (!this.mqttClient || !this.mqttConnected) {
			console.error("⚠️ MQTT 클라이언트가 연결되지 않았습니다.");
			return;
		}
		this.mqttClient.send(topic, message, qos);
	},

	sendMessage(message) {
		const topic = (this.mqttInfo.topicType === TOPIC_TYPE.DISPLAY)
			? this.projectCode + TOPIC_TYPE.CONTROL
			: this.projectCode + TOPIC_TYPE.DISPLAY;
		this.publish(topic, message);
	},

	recvMessage(topic, message) {
		if (!this.mqttConnected) {
			console.error("수신 중 연결 안됨");
			return;
		}
		this.onMessage(message);
	},

	onConnected: function () {},
	onMessage: function () {},
};
