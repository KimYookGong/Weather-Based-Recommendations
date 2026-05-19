/**
 * AeroPlace - Core Application Orchestrator
 * 
 * 애플리케이션의 상태(State)를 중앙에서 제어하고, 비동기 흐름 제어,
 * 예외 복구(Exception Handling) 및 독립된 컴포넌트들 간의 유기적 매핑을 담당합니다.
 */

import { ApiService } from './api.js';
import { WeatherDashboard } from './components/WeatherDashboard.js';
import { PlaceRecommender } from './components/PlaceRecommender.js';
import { SettingsModal } from './components/SettingsModal.js';

class App {
  constructor() {
    // 1. 보안 안전성: 웹 입력단 제거에 맞추어 기존 브라우저 LocalStorage에 남아있던 레거시 키 찌꺼기 자동 삭제(Purge)
    localStorage.removeItem('aeroplace_api_key');
    localStorage.removeItem('aeroplace_kakao_key');

    // 2. 글로벌 상태 (State) 초기화 (기밀 키는 오직 환경 변수 빌드 주입만 의존합니다)
    this.state = {
      apiKey: ApiService.getOwmApiKey(),
      kakaoKey: ApiService.getKakaoApiKey(),
      weatherData: null,
      places: [],
      currentFilter: 'all',
      searchCity: '',         // 수동 검색한 도시 이름
      isCoordsDetected: false,
      lastCoords: null        // 감지된 마지막 위/경도 {lat, lon}
    };

    // 2. 컴포넌트 인스턴스 마운트
    this.weatherDashboard = new WeatherDashboard('weather-dashboard-section');
    
    // 장소 필터 탭 클릭 시 상태 갱신을 위한 콜백 바인딩
    this.placeRecommender = new PlaceRecommender('place-recommender-section', (newFilter) => {
      this.handleFilterChange(newFilter);
    });

    // 설정 변경 및 시뮬레이터 트리거 시 상태 갱신을 위한 콜백 바인딩
    this.settingsModal = new SettingsModal('settings-modal-container', (newSettings) => {
      this.handleSaveSettings(newSettings);
    });

    // 3. 글로벌 DOM 캐시 및 기본 바인딩
    this.dom = {
      btnSettings: document.getElementById('btn-settings'),
      currentLocationText: document.getElementById('current-location-text'),
      locationBadge: document.getElementById('location-indicator'),
      errorContainer: document.getElementById('error-container'),
      appMain: document.querySelector('.app-main')
    };

    this.init();
  }

  /**
   * 앱 초기화 단계
   */
  async init() {
    // A. 글로벌 버튼 핸들러 설정
    this.dom.btnSettings.addEventListener('click', () => {
      this.settingsModal.show();
    });

    // B. Geolocation 비동기 감지 실행 (초기 1회 시도)
    this.detectLocationAndLoad();
  }

  /**
   * 위치 정보를 비동기로 감지하고 기상 데이터 로드 플로우 개시
   */
  async detectLocationAndLoad() {
    this.dom.currentLocationText.textContent = '위치 확인 중...';
    
    try {
      const coords = await ApiService.getCurrentCoords();
      this.state.lastCoords = coords;
      this.state.isCoordsDetected = true;
      this.dom.currentLocationText.textContent = '위치 감지 완료';
      this.dom.locationBadge.classList.add('glass');
    } catch (error) {
      console.warn('Geolocation failed or permission denied:', error.message);
      this.state.isCoordsDetected = false;
      this.state.lastCoords = null;
      this.dom.currentLocationText.textContent = '기본 위치 (데모)';
    }

    // 초기 데이터 로딩 수행
    this.updateAppFlow();
  }

  /**
   * 핵심 비동기 통합 처리 및 예외 바운더리 흐름 (Core Orchestrator)
   */
  async updateAppFlow() {
    this.hideError();
    
    // A. 로딩 스켈레톤 활성화 (레이아웃 흔들림 방지 및 UX 향상)
    this.weatherDashboard.renderSkeleton();
    this.placeRecommender.renderSkeleton();

    try {
      let weather = null;

      // 1. 날씨 데이터 비동기 조회 (실시간 하이브리드 분기)
      
      // 분기 [A]: 사용자가 직접 검색창에 특정 지역을 입력한 경우 (우선순위 최고)
      if (this.state.searchCity) {
        const owmKey = this.state.apiKey || ApiService.getOwmApiKey();
        if (!owmKey) {
          throw new Error('API_KEY_REQUIRED_FOR_SEARCH');
        }
        weather = await ApiService.fetchWeatherBySearchQuery(
          this.state.searchCity,
          owmKey,
          this.state.kakaoKey
        );
      } 
      // 분기 [B]: 사용자의 위도/경도가 감지되었고 실제 OWM API 키가 있는 경우 (GPS 기반 실시간 날씨)
      else if (this.state.isCoordsDetected && this.state.lastCoords && (this.state.apiKey || ApiService.getOwmApiKey())) {
        weather = await ApiService.fetchWeatherByCoords(
          this.state.lastCoords.lat,
          this.state.lastCoords.lon,
          this.state.apiKey || ApiService.getOwmApiKey()
        );
      } 
      // 분기 [C]: 그 외의 경우 (앱 최초 진입 시 기본 서울 실시간 날씨 및 명소 연동)
      else {
        const owmKey = this.state.apiKey || ApiService.getOwmApiKey();
        if (owmKey) {
          // 실제 API 키가 존재하므로 진짜 서울의 실시간 날씨와 명소를 페치해옴!
          weather = await ApiService.fetchWeatherByCity('Seoul', owmKey);
        } else {
          // 만약 API 키가 누락되어 비정상 동작할 위험이 있을 때만 가이드용 기본 맑음 반환
          weather = await ApiService.getMockWeather('clear', '서울 (키 미등록 상태)');
        }
      }

      this.state.weatherData = weather;

      // 2. 동적 앰비언트 테마 반영 (Body Class 및 배지 동적 업데이트)
      this.updateAmbientTheme(weather.id);
      
      // 헤더 위치 텍스트 갱신
      this.dom.currentLocationText.textContent = weather.cityName;

      // 3. 대시보드 컴포넌트 렌더링
      this.weatherDashboard.render(weather);

      // 4. 추천 장소 리스트 비동기 획득 및 렌더링
      const recommendedPlaces = await ApiService.fetchRecommendedPlaces(weather, this.state.currentFilter);
      this.state.places = recommendedPlaces;

      this.placeRecommender.render(recommendedPlaces, this.state.currentFilter);

    } catch (error) {
      console.error('App load error:', error);
      this.handleAppException(error);
    }
  }

  /**
   * 날씨 상태에 맞춰 바디의 앰비언트 분위기 및 테마 클래스 스위칭
   */
  updateAmbientTheme(weatherId) {
    // 기존의 모든 날씨 관련 바디 클래스 정리
    document.body.className = '';
    
    // 신규 클래스 설정
    const classMap = {
      clear: 'weather-clear',
      rainy: 'weather-rainy',
      cloudy: 'weather-cloudy',
      snowy: 'weather-snowy',
      extremely_hot: 'weather-clear', // 폭염은 맑은 톤
      extremely_cold: 'weather-snowy', // 한파는 차가운 톤
      night: 'weather-night'
    };
    
    const bodyClass = classMap[weatherId] || 'weather-clear';
    document.body.classList.add(bodyClass);
  }

  /**
   * 필터 변경 이벤트 핸들러
   */
  async handleFilterChange(newFilter) {
    this.state.currentFilter = newFilter;
    
    // 장소 추천 리스트 영역만 세련되게 로딩 처리 후 리렌더
    this.placeRecommender.renderSkeleton();
    
    try {
      const updatedPlaces = await ApiService.fetchRecommendedPlaces(this.state.weatherData, newFilter);
      this.state.places = updatedPlaces;
      this.placeRecommender.render(updatedPlaces, newFilter);
    } catch (e) {
      this.handleAppException(e);
    }
  }

  /**
   * 설정 변경 및 지역 검색 수신 핸들러
   */
  handleSaveSettings(settings) {
    // 1. 수동 검색어 바인딩
    this.state.searchCity = settings.citySearch;

    // 필터 초기화
    this.state.currentFilter = 'all';

    // 새로운 설정 기반 앱 업데이트 수행
    this.updateAppFlow();
  }

  /**
   * 에러 컨테이너 노출 및 오류 유형별 친화적 복구 인터페이스 설계
   */
  handleAppException(error) {
    this.dom.errorContainer.classList.remove('hidden');
    this.dom.appMain.classList.add('hidden'); // 메인 화면 숨김

    let errorTitle = '날씨 정보를 불러오지 못했습니다';
    let errorMsg = '네트워크 연결 상태를 확인하고 잠시 후 다시 시도해주세요.';
    let actionButtons = '';

    // A. API 키가 만료되거나 유효하지 않은 경우
    if (error.message === 'API_KEY_INVALID') {
      errorTitle = '잘못된 OpenWeatherMap Key입니다';
      errorMsg = '입력하신 OpenWeatherMap API Key가 승인되지 않았습니다. 설정을 열어 키를 다시 확인해주세요.';
      actionButtons = `
        <button id="btn-err-settings" class="primary-button">
          설정 열기 <i data-lucide="sliders"></i>
        </button>
        <button id="btn-err-demo" class="secondary-button">
          데모 모드로 전환
        </button>
      `;
    } 
    // A-2. 카카오 API 키가 잘못된 경우
    else if (error.message === 'KAKAO_KEY_INVALID') {
      errorTitle = '잘못된 Kakao REST Key입니다';
      errorMsg = '입력하신 Kakao Local REST API Key가 승인되지 않았습니다. 내 애플리케이션의 REST API 키를 정확히 입력했는지 확인해주세요.';
      actionButtons = `
        <button id="btn-err-settings" class="primary-button">
          설정 열기 <i data-lucide="sliders"></i>
        </button>
        <button id="btn-err-demo" class="secondary-button">
          데모 모드로 전환
        </button>
      `;
    }
    // B. 도시를 검색하려는데 API 키가 아예 없는 경우
    else if (error.message === 'API_KEY_REQUIRED_FOR_SEARCH') {
      errorTitle = '도시 검색을 위해 OWM Key가 필요합니다';
      errorMsg = '실시간 도시 날씨 조회를 사용하려면 설정을 열고 개인 OpenWeatherMap API Key를 등록해주셔야 합니다.';
      actionButtons = `
        <button id="btn-err-settings" class="primary-button">
          설정 열기 <i data-lucide="sliders"></i>
        </button>
        <button id="btn-err-demo" class="secondary-button">
          기본 데모 사용하기
        </button>
      `;
    }
    // B-2. 한국어 검색을 시도하는데 카카오 키가 누락된 경우
    else if (error.message === 'KAKAO_KEY_MISSING') {
      errorTitle = '한글 주소 검색을 위해 Kakao Key가 필요합니다';
      errorMsg = `'${this.state.searchCity}'와 같은 한글 지명, 지하철역, 상세 구/동 검색을 수행하려면 Kakao REST API Key가 필요합니다. 설정을 열어 키를 등록하시거나 영문명(예: Seoul)으로 다이렉트 검색해보세요.`;
      actionButtons = `
        <button id="btn-err-settings" class="primary-button">
          설정 열기 <i data-lucide="sliders"></i>
        </button>
        <button id="btn-err-demo" class="secondary-button">
          영문명 다이렉트 검색
        </button>
      `;
    }
    // C. 검색한 도시를 찾을 수 없는 경우
    else if (error.message === 'CITY_NOT_FOUND') {
      errorTitle = '지역을 찾을 수 없습니다';
      errorMsg = `'${this.state.searchCity}'에 해당하는 행정 구역 또는 검색 결과를 찾을 수 없습니다. 주소 철자를 확인하시거나 보다 널리 알려진 명칭(예: 여의도동, 마포구, Seoul)으로 입력해보세요.`;
      actionButtons = `
        <button id="btn-err-settings" class="primary-button">
          다시 검색 <i data-lucide="search"></i>
        </button>
        <button id="btn-err-retry" class="secondary-button">
          새로고침 <i data-lucide="rotate-cw"></i>
        </button>
      `;
    }
    // D. 그 외 네트워크 에러 또는 일반 실패
    else {
      errorTitle = '네트워크 통신 오류 발생';
      errorMsg = error.message || '날씨 서버와의 통신에 장애가 발생했거나 위치 파싱에 실패했습니다.';
      actionButtons = `
        <button id="btn-err-retry" class="primary-button">
          다시 시도하기 <i data-lucide="rotate-cw"></i>
        </button>
        <button id="btn-err-demo" class="secondary-button">
          데모 모드로 보기
        </button>
      `;
    }

    // 마크업 주입
    this.dom.errorContainer.innerHTML = `
      <div class="error-icon-wrapper animate-bounce">
        <i data-lucide="alert-circle" class="error-icon"></i>
      </div>
      <h3 class="error-title">${errorTitle}</h3>
      <p class="error-msg">${errorMsg}</p>
      <div style="display: flex; gap: 12px; margin-top: 8px; justify-content: center; flex-wrap: wrap;">
        ${actionButtons}
      </div>
    `;

    // 에러 액션 버튼 이벤트 리스너 바인딩
    this.bindErrorActions();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * 에러 화면 내 액션 버튼들의 복구 로직 연결
   */
  bindErrorActions() {
    // 1. 다시 시도
    const btnRetry = document.getElementById('btn-err-retry');
    if (btnRetry) {
      btnRetry.addEventListener('click', () => {
        this.updateAppFlow();
      });
    }

    // 2. 설정 창 열기
    const btnSettings = document.getElementById('btn-err-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        this.settingsModal.show();
      });
    }

    // 3. 서울 실시간 기상으로 안전 복구
    const btnDemo = document.getElementById('btn-err-demo');
    if (btnDemo) {
      btnDemo.innerHTML = `<i data-lucide="sun" style="width: 16px; height: 16px; margin-right: 4px;"></i> 서울 실시간 날씨로 복구`;
      btnDemo.addEventListener('click', () => {
        this.state.searchCity = 'Seoul';
        this.updateAppFlow();
      });
    }
  }

  /**
   * 에러 상태 해제 및 메인 뷰 복구
   */
  hideError() {
    this.dom.errorContainer.classList.add('hidden');
    this.dom.appMain.classList.remove('hidden');
  }
}

// 브라우저 DOM이 모두 로드되면 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
