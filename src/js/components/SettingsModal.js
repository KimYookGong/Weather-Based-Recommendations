/**
 * SettingsModal Component
 * 
 * API 키 설정, 수동 도시 검색 및 데모 날씨 시뮬레이터를 제어하는 모달 창 컴포넌트입니다.
 */

export class SettingsModal {
  /**
   * @param {string} containerId - 모달 오버레이 컨테이너 ID
   * @param {Function} onSave - 설정 저장 및 적용 시 실행할 부모 콜백
   */
  constructor(containerId, onSave) {
    this.container = document.getElementById(containerId);
    this.onSave = onSave;
  }

  /**
   * 모달 열기 및 렌더링
   * @param {Object} currentSettings - { apiKey: string, kakaoKey: string, activeSimId: string }
   */
  show(currentSettings = { apiKey: '', kakaoKey: '', activeSimId: '' }) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="modal-content glass">
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <h3 class="modal-title">
            <i data-lucide="settings" style="color: #a78bfa;"></i>
            환경 설정 & 데모 시뮬레이터
          </h3>
          <button id="modal-close" class="close-button" title="닫기">
            <i data-lucide="x" style="width: 24px; height: 24px;"></i>
          </button>
        </div>

        <!-- 모달 바디 설정 섹션 - OWM 키 -->
        <div class="settings-group">
          <label class="settings-label" for="input-api-key">
            <span>OpenWeatherMap API Key</span>
            <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #60a5fa; text-decoration: none;">키 발급 받기 <i data-lucide="arrow-up-right" style="width: 10px; height: 10px;"></i></a>
          </label>
          <div class="settings-input-wrapper">
            <i data-lucide="key" class="settings-input-icon"></i>
            <input type="password" id="input-api-key" class="settings-input" placeholder="OpenWeatherMap API Key를 입력해주세요." value="${currentSettings.apiKey || ''}">
          </div>
        </div>

        <!-- 모달 바디 설정 섹션 - Kakao REST 키 -->
        <div class="settings-group">
          <label class="settings-label" for="input-kakao-key">
            <span>Kakao Local REST API Key</span>
            <a href="https://developers.kakao.com" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #60a5fa; text-decoration: none;">키 발급 받기 <i data-lucide="arrow-up-right" style="width: 10px; height: 10px;"></i></a>
          </label>
          <div class="settings-input-wrapper">
            <i data-lucide="shield" class="settings-input-icon"></i>
            <input type="password" id="input-kakao-key" class="settings-input" placeholder="Kakao REST API Key를 입력해주세요." value="${currentSettings.kakaoKey || ''}">
          </div>
          <span class="settings-help">※ 입력한 API 키들은 브라우저 LocalStorage에 안전하게 저장됩니다. 입력이 없거나 환경변수 비활성 시에는 풍부한 고품질 데모 시뮬레이션 모드로 작동합니다.</span>
        </div>

        <!-- 수동 도시 검색 (Geolocation 장애 대비) -->
        <div class="settings-group">
          <label class="settings-label" for="input-city-search">
            <span>지역 검색 (한글 동/구 검색 또는 영문 도시 검색)</span>
          </label>
          <div class="settings-input-wrapper">
            <i data-lucide="search" class="settings-input-icon"></i>
            <input type="text" id="input-city-search" class="settings-input" placeholder="예: 여의도동, 망원동, 마포구, Seoul, Tokyo 등">
          </div>
          <span class="settings-help">※ GPS 위치 연동이 제한되는 환경이거나 다른 특정 위치의 실시간 기상 상태를 관측하고 싶을 때 유용합니다. (한글 검색은 Kakao API 키 등록 필요)</span>
        </div>

        <div class="settings-divider"></div>

        <!-- 핵심: 데모 날씨 시뮬레이터 (Developer & Demo Mode) -->
        <div class="settings-group">
          <h4 class="simulator-title">🌤️ 데모 날씨 시뮬레이터 (개발자용)</h4>
          <span class="settings-help" style="margin-bottom: 8px;">날씨 API 연동 없이 클릭 한 번으로 모든 날씨 추천 정합성을 강제 변경하며 실시간 시뮬레이션할 수 있습니다.</span>
          <div class="simulator-grid">
            <button class="sim-button ${currentSettings.activeSimId === 'clear' ? 'active' : ''}" data-sim="clear">
              <i data-lucide="sun" class="sim-icon" style="color: #fbbf24;"></i>
              <span>맑음 (봄/가을)</span>
            </button>
            <button class="sim-button ${currentSettings.activeSimId === 'rainy' ? 'active' : ''}" data-sim="rainy">
              <i data-lucide="cloud-rain" class="sim-icon" style="color: #60a5fa;"></i>
              <span>비 (우천)</span>
            </button>
            <button class="sim-button ${currentSettings.activeSimId === 'cloudy' ? 'active' : ''}" data-sim="cloudy">
              <i data-lucide="cloud" class="sim-icon" style="color: #94a3b8;"></i>
              <span>흐림</span>
            </button>
            <button class="sim-button ${currentSettings.activeSimId === 'snowy' ? 'active' : ''}" data-sim="snowy">
              <i data-lucide="snowflake" class="sim-icon" style="color: #a5f3fc;"></i>
              <span>눈 (겨울)</span>
            </button>
            <button class="sim-button ${currentSettings.activeSimId === 'extremely_hot' ? 'active' : ''}" data-sim="extremely_hot">
              <i data-lucide="thermometer" class="sim-icon" style="color: #f43f5e;"></i>
              <span>폭염 (33°C↑)</span>
            </button>
            <button class="sim-button ${currentSettings.activeSimId === 'extremely_cold' ? 'active' : ''}" data-sim="extremely_cold">
              <i data-lucide="wind" class="sim-icon" style="color: #38bdf8;"></i>
              <span>한파 (-9°C↓)</span>
            </button>
            <button class="sim-button ${currentSettings.activeSimId === 'night' ? 'active' : ''}" data-sim="night">
              <i data-lucide="moon" class="sim-icon" style="color: #a78bfa;"></i>
              <span>맑은 밤</span>
            </button>
          </div>
        </div>

        <!-- 푸터 저장 버튼 -->
        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px;">
          <button id="btn-save-settings" class="primary-button">
            저장 및 적용 <i data-lucide="check" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
      </div>
    `;

    // 오버레이 노출
    this.container.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // 바디 스크롤 차단

    this.bindEvents();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * 모달 숨기기
   */
  hide() {
    if (!this.container) return;
    this.container.classList.add('hidden');
    document.body.style.overflow = ''; // 바디 스크롤 재개
  }

  /**
   * 모달 내부 이벤트 바인딩
   */
  bindEvents() {
    const btnClose = this.container.querySelector('#modal-close');
    const btnSave = this.container.querySelector('#btn-save-settings');
    const inputApiKey = this.container.querySelector('#input-api-key');
    const inputKakaoKey = this.container.querySelector('#input-kakao-key');
    const inputCitySearch = this.container.querySelector('#input-city-search');
    const simButtons = this.container.querySelectorAll('.sim-button');

    // 1. 닫기 핸들러
    btnClose.addEventListener('click', () => this.hide());
    
    // 오버레이 빈 공간 클릭 시 닫기
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.hide();
      }
    });

    // ESC 키 입력 시 닫기
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.hide();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // 2. 저장 및 적용 핸들러
    btnSave.addEventListener('click', () => {
      const keyVal = inputApiKey.value.trim();
      const kakaoVal = inputKakaoKey.value.trim();
      const cityVal = inputCitySearch.value.trim();
      
      if (this.onSave) {
        this.onSave({
          apiKey: keyVal,
          kakaoKey: kakaoVal,
          citySearch: cityVal,
          simId: null // 시뮬레이터를 끈 실제 날씨 모드
        });
      }
      this.hide();
    });

    // 3. 시뮬레이터 날씨 선택 핸들러
    simButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const simId = e.currentTarget.getAttribute('data-sim');
        
        // 클릭 즉시 활성화 표시 및 다른 버튼 해제
        simButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        if (this.onSave) {
          this.onSave({
            apiKey: inputApiKey.value.trim(),
            kakaoKey: inputKakaoKey.value.trim(),
            citySearch: '', // 시뮬레이터 우선으로 하므로 검색 비움
            simId: simId
          });
        }
        
        // 자연스럽게 닫기 딜레이를 주어 변경 사항을 시각적으로 인지하게 함
        setTimeout(() => this.hide(), 250);
      });
    });
  }
}
