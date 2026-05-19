/**
 * WeatherDashboard Component
 * 
 * 실시간 기상 상태를 직관적이고 미려하게 렌더링하는 대시보드 컴포넌트입니다.
 */

export class WeatherDashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  /**
   * 날씨 데이터를 기반으로 대시보드를 시각적으로 렌더링
   * @param {Object} weatherData - 날씨 데이터 모델
   */
  render(weatherData) {
    if (!this.container) return;

    // 현재 한국 시간 일시 생성
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('ko-KR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);

    // 날씨 속성에 어울리는 한글 상태 레이블 획득
    const isNight = weatherData.id === 'night';
    
    // HTML 구조 주입 (Glassmorphism 레이아웃)
    this.container.innerHTML = `
      <div class="weather-dashboard glass">
        <!-- 좌측: 핵심 기상 정보 영역 -->
        <div class="weather-info-main animate-fade-in">
          <div class="weather-location-container">
            <h2 class="weather-city-name">${weatherData.cityName}</h2>
            <p class="weather-date">${formattedDate}</p>
          </div>
          
          <div class="weather-status-wrapper">
            <span class="weather-temp">${weatherData.temp}°C</span>
            <i data-lucide="${weatherData.icon}" class="weather-icon-large"></i>
            <div class="weather-desc-container">
              <p class="weather-desc-text">${weatherData.rawName}</p>
            </div>
          </div>
          
          <p class="weather-phrase">${weatherData.phrase}</p>
        </div>

        <!-- 우측: 미세 기상 지표 패널 -->
        <div class="weather-stats animate-fade-in" style="animation-delay: 0.1s;">
          <!-- 1. 습도 스태츠 -->
          <div class="stat-card">
            <div class="stat-icon-wrapper">
              <i data-lucide="droplets" class="stat-icon" style="color: #60a5fa;"></i>
            </div>
            <div class="stat-details">
              <span class="stat-label">습도</span>
              <span class="stat-value">${weatherData.humidity}%</span>
            </div>
          </div>

          <!-- 2. 강수확률 스태츠 -->
          <div class="stat-card">
            <div class="stat-icon-wrapper">
              <i data-lucide="cloud-lightning" class="stat-icon" style="color: #fb7185;"></i>
            </div>
            <div class="stat-details">
              <span class="stat-label">강수 확률</span>
              <span class="stat-value">${weatherData.pop}%</span>
            </div>
          </div>

          <!-- 3. 풍속 스태츠 -->
          <div class="stat-card">
            <div class="stat-icon-wrapper">
              <i data-lucide="wind" class="stat-icon" style="color: #34d399;"></i>
            </div>
            <div class="stat-details">
              <span class="stat-label">풍속</span>
              <span class="stat-value">${weatherData.windSpeed} m/s</span>
            </div>
          </div>

          <!-- 4. 불쾌/활동 지수 스태츠 -->
          <div class="stat-card">
            <div class="stat-icon-wrapper">
              <i data-lucide="sparkles" class="stat-icon" style="color: #fbbf24;"></i>
            </div>
            <div class="stat-details">
              <span class="stat-label">추천 적합성</span>
              <span class="stat-value">${this.calculateComfortIndex(weatherData.temp, weatherData.humidity)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Lucide 아이콘 활성화
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * 온도와 습도를 활용하여 추천 적합성 및 쾌적 지수 한글 가이드 연출
   */
  calculateComfortIndex(temp, humidity) {
    if (temp >= 33) return '폭염 (경보)';
    if (temp <= 2) return '매우 한랭';
    
    // 간이 불쾌지수 공식
    const dis = 0.81 * temp + 0.01 * humidity * (0.99 * temp - 14.3) + 46.3;
    if (dis >= 80) return '후덥지근함';
    if (dis >= 75) return '약간 끈적임';
    if (dis < 68) return '매우 쾌적';
    return '보통';
  }

  /**
   * 데이터를 불러오는 중일 때의 스켈레톤 로딩 UI를 렌더링
   */
  renderSkeleton() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="skeleton-dashboard glass">
        <div class="skeleton-line title"></div>
        <div class="skeleton-grid">
          <div class="skeleton-circle"></div>
          <div class="skeleton-block"></div>
        </div>
      </div>
    `;
  }
}
