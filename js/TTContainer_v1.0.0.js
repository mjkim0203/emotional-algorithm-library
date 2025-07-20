'use strict';

const TOPIC_TYPE = {
	DISPLAY : "/goldstar/display",
	CONTROL : "/goldstar/control",
};

const ttContainer = {
	projectCode : null,
    mqttInfo : {
        clientId : "Web_Client_" + parseInt(Math.random() * 100 * 100, 10),
        host : "broker.hivemq.com",            // ✅ HiveMQ broker
        port : 8884,                            // ✅ HiveMQ WSS port
        useSSL: true,                           // ✅ always WSS
        userName : null,                        // ❌ HiveMQ public broker: no auth
		password: null,
        keepAliveInterval: 30,
		isReconnect: true,
		topicType: null,
    },
    mqttClient : null,
    mqttConnected : false,

    mqttConnect(projectCode, topic_type, onConnected = function() {}) {
		if (!topic_type) {
			console.error("topic_type is required for mqttConnect");
			return;
		}

		this.onConnected = onConnected;
		this.projectCode = projectCode;
		this.mqttInfo.topicType = topic_type;

        // ✅ HiveMQ requires "/mqtt" path
        this.mqttClient = new Paho.MQTT.Client(
			this.mqttInfo.host,
			this.mqttInfo.port,
			"/mqtt",                            // ✅ HiveMQ path
			this.mqttInfo.clientId
		);

        this.mqttClient.onConnectionLost = function (responseObject) {
            console.warn("onConnectionLost", responseObject?.errorMessage);
            ttContainer.mqttConnected = false;

			if (ttContainer.mqttInfo.isReconnect) {
				setTimeout(() => {
					ttContainer.mqttConnect(projectCode, topic_type);
				}, 5000);
			}
        };

        this.mqttClient.onMessageArrived = function (message) {
            setTimeout(() => {
                ttContainer.recvMessage(message.destinationName, message.payloadString);
            });
        };

        this.mqttClient.connect({
            useSSL: this.mqttInfo.useSSL,
            keepAliveInterval: this.mqttInfo.keepAliveInterval,
            onSuccess: () => {
				ttContainer.mqttConnected = true;
				console.log("✅ MQTT Connected to HiveMQ");

				const topic = ttContainer.projectCode + ttContainer.mqttInfo.topicType;
				ttContainer.subscribe(topic);

				ttContainer.onConnected();
            },
            onFailure: (err) => {
                ttContainer.mqttConnected = false;
                console.error("❌ MQTT Connect Failed:", err.errorMessage);

				if (ttContainer.mqttInfo.isReconnect) {
					setTimeout(() => {
						ttContainer.mqttConnect(projectCode, topic_type);
					}, 5000);
				}
            }
        });
    },

	subscribe(topic) {
		if (!this.mqttClient || !this.mqttConnected) {
			return console.error("MQTT Client is not connected.");
		}
		this.mqttClient.subscribe(topic, { qos: 0 });
	},

	publish(topic, message, qos = 0) {
		if (!this.mqttClient || !this.mqttConnected) {
			return console.error("MQTT Client is not connected.");
		}
		this.mqttClient.send(topic, message, qos);
	},

	recvMessage(topic, message) {
		if (!this.mqttClient || !this.mqttConnected) {
			return console.error("MQTT Client is not connected.");
		}
		this.onMessage(message);
	},

	sendMessage(message) {
		const topic = (this.mqttInfo.topicType === TOPIC_TYPE.DISPLAY)
			? this.projectCode + TOPIC_TYPE.CONTROL
			: this.projectCode + TOPIC_TYPE.DISPLAY;
		this.publish(topic, message);
	},

	onConnected: function () {},
	onMessage: function () {}
};
