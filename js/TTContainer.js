mqttConnect: function (prefix, type, onConnect, options = {}) {
  const broker = new URL(options.brokerUrl || "wss://test.mosquitto.org:8081/mqtt");
  const host = broker.hostname; // test.mosquitto.org
  const port = parseInt(broker.port || "8081");
  const path = broker.pathname; // /mqtt
  const clientId = "client-" + Math.floor(Math.random() * 10000);

  this.topic = `${prefix}/goldstar/${type}`;

  console.log("✅ 브로커 연결 정보:", host, port, path);
  console.log("📡 구독 토픽:", this.topic);

  this.client = new Paho.MQTT.Client(host, port, path, clientId);  // ✅ 수정된 부분

  this.client.onConnectionLost = function (response) {
    console.warn("연결 끊김:", response.errorMessage);
  };

  this.client.onMessageArrived = function (message) {
    console.log("📨 수신된 메시지:", message.payloadString);
    if (typeof ttContainer.onMessage === "function") {
      ttContainer.onMessage(message.payloadString);
    }
  };

  this.client.connect({
    onSuccess: onConnect,
    useSSL: true
  });
}
