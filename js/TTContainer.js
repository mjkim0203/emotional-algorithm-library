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

    this.client.onConnectionLost = function (response) {
      console.warn("⚠️ MQTT 연결 끊김:", response.errorMessage);

      // 자동 재연결 활성화 옵션 사용 중이지만 예외적으로 재시도하고 싶다면 여기에 넣을 수 있음
    };

    this.client.onMessageArrived = function (message) {
      console.log("📩 수신 메시지:", message.payloadString);
      if (typeof ttContainer.onMessage === "function") {
        ttContainer.onMessage(message.payloadString);
      } else {
        console.warn("⚠️ ttContainer.onMessage 핸들러가 정의되어 있지 않습니다.");
      }
    };

    this.client.connect({
      onSuccess: () => {
        console.log("✅ MQTT 연결 성공:", this.topic);

        // Mosquitto 브로커 대응 - 약간 지연 후 subscribe
        setTimeout(() => {
          this.client.subscribe(this.topic);
          console.log("📥 토픽 구독 완료:", this.topic);
        }, 300);

        if (typeof onConnect === "function") onConnect();
      },
      onFailure: err => {
        console.error("❌ MQTT 연결 실패:", err.errorMessage || err);
      },
      useSSL: true,
      keepAliveInterval: 45,   // ⏱️ 브로커와의 연결을 유지하기 위한 Ping 간격 (초 단위)
      reconnect: true,         // 🔄 연결 끊겼을 때 자동 재연결 시도
      cleanSession: false      // 🧠 세션 상태 유지 (retain 메시지 수신 포함)
    });
  },

  sendMessage: function (payload) {
    if (!this.client || !this.topic) {
      console.error("❌ MQTT 클라이언트가 아직 연결되지 않았습니다.");
      return;
    }

    const message = new Paho.MQTT.Message(payload);
    message.destinationName = this.topic;
    message.retained = true;  // 🔁 retain 메시지로 설정하여 이후 접속한 subscriber도 수신 가능
    console.log("📤 메시지 전송됨:", payload, "→", this.topic);
    this.client.send(message);
  }
};
