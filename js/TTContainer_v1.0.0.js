'use strict';

const TOPIC_TYPE = {
	DISPLAY: "/goldstar/display",
	CONTROL: "/goldstar/control",
};

const ttContainer = {
	projectCode: null,
	mqttInfo: {
		clientId: "Web_Client_" + parseInt(Math.random() * 10000, 10),
		host: "broker.hivemq.com",
		port: 8884,
		useSSL: true,
		userName: null,
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
			"/mqtt",
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
		console.log("📡 구독 시작:", topic);
	},

	publish(topic, message, qos = 0) {
		if (!this.mqttClient || !this.mqttConnected) {
			console.error("⚠️ MQTT 클라이언트가 연결되지 않았습니다.");
			return;
		}
		this.mqttClient.send(topic, message, qos);
		console.log("📤 publish 실행:", topic, message);
	},

	sendMessage(message) {
		const topic = (this.mqttInfo.topicType === TOPIC_TYPE.DISPLAY)
			? this.projectCode + TOPIC_TYPE.CONTROL
			: this.projectCode + TOPIC_TYPE.DISPLAY;

		console.log("📨 sendMessage 호출됨 → publish 시작"); // ✅ 추가된 로그
		console.log("📨 메시지 전송 대상:", topic);
		console.log("📨 전송할 메시지:", message);

		this.publish(topic, message);
	},

	recvMessage(topic, message) {
		if (!this.mqttConnected) {
			console.error("❗ 수신 중 연결 안됨");
			return;
		}
		console.log("📥 수신된 메시지:", topic, message);
		this.onMessage(message);
	},

	onConnected: function () {},
	onMessage: function () {},
};
