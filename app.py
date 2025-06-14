from flask import Flask, render_template, request, jsonify
import numpy as np
import cv2
import base64
from keras.models import load_model

app = Flask(__name__)

model = load_model("model/emotion_model.h5")
emotion_dict = {
    0: "Angry", 1: "Disgust", 2: "Fear", 3: "Happy",
    4: "Neutral", 5: "Sad", 6: "Surprise"
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    img_data = base64.b64decode(data['image'].split(",")[1])
    np_arr = np.frombuffer(img_data, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    if len(faces) == 0:
        return jsonify({'emotion': 'No face detected'})

    for (x, y, w, h) in faces:
        roi = gray[y:y+h, x:x+w]
        roi_resized = cv2.resize(roi, (48, 48))
        roi_input = np.expand_dims(np.expand_dims(roi_resized, -1), 0)
        prediction = model.predict(roi_input)
        label = emotion_dict[int(np.argmax(prediction))]
        return jsonify({'emotion': label})

    return jsonify({'emotion': 'Unknown error'})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
