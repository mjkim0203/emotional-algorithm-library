const TOPIC_TYPE = {
  CONTROL: "control",
  DISPLAY: "display"
};

const ttContainer = {
  client: null,
  topic: null,

  mqttConnect: function (prefix, type, onConnect, options = {}) {
    console.log("📡 mqttConnect() 호출됨");
    
    const brokerUrl = options.brokerUrl || "wss://test.mosquitto.org:8081/mqtt";
    this.topic = `${prefix}/goldstar/${type}`;

    console.log("🔗 브로커 URL:", brokerUrl);
    console.log("📨 구독할 토픽:", this.topic);

    // MQTT 라이브러리 로딩 여부 확인
    if (typeof Paho === "undefined" || typeof Paho.MQTT === "undefined") {
      console.error("❌ Paho.MQTT가 정의되지 않았습니다. paho-mqtt.min.js가 먼저 로드되어야 합니다.");
      return;
    }

    try {
      this.client = new Paho.MQTT.Client(brokerUrl, "client-" + Math.floor(Math.random() * 10000));
      console.log("🧩 MQTT Client 객체 생성됨:", this.client);
    } catch (err) {
      console.error("❌ MQTT Client 생성 중 오류:", err);
      return;
    }

    // 연결 끊김 처리
    this.client.onConnectionLost = function (response) {
      console.warn("⚠️ MQTT 연결 끊김:", response.errorMessage);
    };

    // 메시지 수신 처리
    this.client.onMessageArrived = function (message) {
      console.log("📩 수신 메시지:", message.payloadString);
      if (typeof ttContainer.onMessage === "function") {
        ttContainer.onMessage(message.payloadString);
      } else {
        console.warn("⚠️ ttContainer.onMessage 핸들러가 정의되어 있지 않습니다.");
      }
    };

    // 연결 시작
    this.client.connect({
      onSuccess: () => {
        console.log("✅ MQTT 연결 성공:", this.topic);

        // ✅ 명시적으로 토픽 구독
        this.client.subscribe(this.topic);
        console.log("📥 토픽 구독 완료:", this.topic);

        if (typeof onConnect === "function") onConnect();
      },
      onFailure: err => {
        console.error("❌ MQTT 연결 실패:", err.errorMessage || err);
      },
      useSSL: true
    });
  },

  sendMessage: function (payload) {
    if (!this.client || !this.topic) {
      console.error("❌ MQTT 클라이언트가 아직 연결되지 않았습니다.");
      return;
    }

    const message = new Paho.MQTT.Message(payload);
    message.destinationName = this.topic;
    message.retained = true;  // ✅ subscriber가 나중에 붙어도 받을 수 있게 설정
    console.log("📤 메시지 전송됨:", payload, "→", this.topic);
    this.client.send(message);
  }
};
