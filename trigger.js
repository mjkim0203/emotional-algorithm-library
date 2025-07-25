window.addEventListener('load', () => {
  const progress = document.getElementById('progressBar');
  const circle1 = document.querySelector('.circle1');
  const circle2 = document.querySelector('.circle2');
  const circle3 = document.querySelector('.circle3');
  const title = document.getElementById('title');
  const subtitle = document.getElementById('subtitle');
  const emotionValue = document.querySelector('.emotion-value');
  const emotionEngWrapper = document.getElementById('emotionEngWrapper');
  const emotionEng = document.getElementById('emotionEng');
  const bgImage = document.querySelector('.background-image');
  const gradient = document.querySelector('.gradient-overlay');

  const emotionText = emotionValue ? emotionValue.textContent.trim() : '중립';

  const emotionMap = {
    '중립': 'Neutral',
    '기쁨': 'Joy',
    '슬픔': 'Sadness',
    '화남': 'Anger',
    '무서움': 'Fear',
    '역겨움': 'Disgust',
    '놀람': 'Surprise'
  };

  setTimeout(() => {
    if (progress) progress.style.width = '100%';
    if (circle1) circle1.classList.add('move-circle1');
    if (circle2) circle2.classList.add('move-circle2');
    if (circle3) circle3.classList.add('move-circle3');
  }, 1000);

  setTimeout(() => {
    if (circle1) circle1.style.animationPlayState = 'paused';
    if (circle2) circle2.style.animationPlayState = 'paused';
    if (circle3) circle3.style.animationPlayState = 'paused';

    if (title) title.textContent = '감정 분석을 완료했어요';
    if (subtitle) subtitle.textContent = `현재 당신의 감정은 “${emotionText}” 입니다.`;

    if (emotionEng) {
      emotionEng.textContent = emotionMap[emotionText] || 'Neutral';
    }

    if (emotionEngWrapper) {
      emotionEngWrapper.classList.add('show');
    }
  }, 6000);

  setTimeout(() => {
    const screen1 = document.querySelector('.screen1');
    const screen2 = document.querySelector('.screen2');
    const progressWrapper = document.querySelector('.progress-wrapper');

    if (screen1 && screen2) {
      screen1.classList.remove('show');
      screen2.classList.add('show');
    }

    if (progressWrapper) progressWrapper.style.display = 'none';
    if (bgImage) bgImage.style.display = 'block';
    if (gradient) gradient.style.display = 'block';

    const userName = localStorage.getItem("userName") || "Guest";
    const userNameEl = document.getElementById("user-name");
    if (userNameEl) userNameEl.textContent = userName;
  }, 9000);
});

// ✅ 1분 후 자동 리다이렉트
let idleTimer;
function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    window.location.href = 'index.html';
  }, 60000);
}

window.addEventListener('load', () => {
  resetIdleTimer();
  ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    .forEach(evt => {
      document.addEventListener(evt, resetIdleTimer, { passive: true });
    });
});
