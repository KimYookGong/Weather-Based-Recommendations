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
   * @param {Object} currentSettings - { activeSimId: string }
   */
  show(currentSettings = { activeSimId: '' }) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="modal-content glass">
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <h3 class="modal-title" style="display: flex; align-items: center; gap: 8px;">
            <i data-lucide="map-pin" style="color: #6366f1;"></i>
            실시간 지역 설정
          </h3>
          <button id="modal-close" class="close-button" title="닫기">
            <i data-lucide="x" style="width: 24px; height: 24px;"></i>
          </button>
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
          <span class="settings-help">※ GPS 위치 연동이 제한되는 환경이거나 특정 위치의 실시간 기상 상태를 직접 검색하여 연동할 수 있습니다.</span>
        </div>

        <!-- 푸터 저장 버튼 -->
        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
          <button id="btn-save-settings" class="primary-button">
            검색 및 적용 <i data-lucide="check" style="width: 16px; height: 16px;"></i>
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
    const inputCitySearch = this.container.querySelector('#input-city-search');

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
      const cityVal = inputCitySearch.value.trim();
      
      if (this.onSave) {
        this.onSave({
          citySearch: cityVal
        });
      }
      this.hide();
    });
  }
}
