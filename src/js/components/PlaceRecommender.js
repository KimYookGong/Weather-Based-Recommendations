/**
 * PlaceRecommender Component
 * 
 * 날씨에 딱 어울리게 매칭된 장소 추천 카드 리스트 및 탭 필터링 인터페이스입니다.
 */

export class PlaceRecommender {
  /**
   * @param {string} containerId - 컴포넌트가 마운트될 부모 컨테이너 ID
   * @param {Function} onFilterChange - 필터 탭 클릭 시 실행될 부모 상태 갱신 콜백
   */
  constructor(containerId, onFilterChange) {
    this.container = document.getElementById(containerId);
    this.onFilterChange = onFilterChange;
    this.currentFilter = 'all'; // 'all', 'indoor', 'outdoor'
  }

  /**
   * 장소 추천 카드 목록 및 필터 헤더 렌더링
   * @param {Array} places - 매칭 가공된 장소 배열
   * @param {string} filterType - 현재 선택된 필터 ('all', 'indoor', 'outdoor')
   */
  render(places, filterType = 'all') {
    if (!this.container) return;
    this.currentFilter = filterType;

    // 전체 레이아웃 구성
    this.container.innerHTML = `
      <!-- 필터 바 및 타이틀 영역 -->
      <div class="section-title-bar">
        <h3 class="section-title">
          <i data-lucide="sparkles" style="color: #fbbf24;"></i>
          실시간 추천 플레이스
        </h3>
        
        <div class="filter-tabs">
          <button class="tab-button ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
            <i data-lucide="grid"></i> 전체
          </button>
          <button class="tab-button ${this.currentFilter === 'indoor' ? 'active' : ''}" data-filter="indoor">
            <i data-lucide="home"></i> 실내형
          </button>
          <button class="tab-button ${this.currentFilter === 'outdoor' ? 'active' : ''}" data-filter="outdoor">
            <i data-lucide="trees"></i> 실외형
          </button>
        </div>
      </div>

      <!-- 카드 그리드 컨테이너 -->
      <div id="places-card-grid" class="places-grid">
        ${this.buildPlaceCardsMarkup(places)}
      </div>
    `;

    // 이벤트 리스너 바인딩 (필터 탭 클릭 처리)
    this.bindEvents();

    // 아이콘 활성화
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * 각 장소 데이터를 카드 마크업 문자열로 변환
   */
  buildPlaceCardsMarkup(places) {
    if (!places || places.length === 0) {
      return `
        <div class="empty-places glass col-span-full">
          <i data-lucide="frown" class="empty-icon"></i>
          <p class="font-semibold text-lg">추천할 수 있는 장소가 없습니다.</p>
          <p class="text-sm text-secondary">날씨 조건을 변경해보거나 다른 카테고리를 선택해주세요.</p>
        </div>
      `;
    }

    return places.map((place, idx) => {
      // 카테고리 한글 가이드
      const categoryMap = {
        STUDY: '지식/스터디',
        CULTURE: '예술/문화',
        ACTIVITY: '역동적 액티비티',
        HEALING: '힐링/휴식',
        FOOD: '미식/카페'
      };

      const isIndoor = place.type === 'indoor';
      const badgeClass = isIndoor ? 'indoor' : 'outdoor';
      const badgeText = isIndoor ? '실내 공간' : '야외 공간';
      const categoryText = categoryMap[place.category] || '테마 플레이스';

      // 2중 방어선: 카카오 로드 실패 시 대체할 카테고리별 고화질 백업 이미지 정의
      const fallbackImages = {
        CULTURE: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=600&q=80',
        FOOD: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
        HEALING: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80',
        ACTIVITY: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80'
      };
      const fallbackUrl = fallbackImages[place.category] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';

      return `
        <article class="place-card glass glass-hover animate-fade-in" style="animation-delay: ${idx * 0.08}s;">
          <!-- 장소 대표 이미지 -->
          <div class="place-image-wrapper">
            <img src="${place.imageUrl}" alt="${place.name}" class="place-image" loading="lazy" onerror="this.onerror=null; this.src='${fallbackUrl}';">
            <div class="place-badges">
              <span class="type-badge ${badgeClass}">${badgeText}</span>
              <span class="theme-badge">${categoryText}</span>
            </div>
          </div>

          <!-- 장소 디테일 내용 -->
          <div class="place-details">
            <div class="place-header">
              <h4 class="place-title">${place.name}</h4>
            </div>
            
            <div class="place-address">
              <i data-lucide="map-pin" style="width: 12px; height: 12px;"></i>
              <span>${place.address}</span>
            </div>

            <p class="place-desc">${place.description}</p>
            
            <!-- 핵심: 날씨 맞춤형 추천 사유 -->
            <div class="place-recommend-reason">
              <strong>💡 날씨 추천 가이드:</strong><br>
              ${place.reason}
            </div>

            <!-- 지도 바로가기 버튼 -->
            <div class="place-footer">
              <a href="${place.mapUrl}" target="_blank" rel="noopener noreferrer" class="map-link">
                위치 지도보기 <i data-lucide="external-link" style="width: 14px; height: 14px;"></i>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  /**
   * 필터 탭 클릭 이벤트 감지 및 콜백 전달
   */
  bindEvents() {
    const tabs = this.container.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const filter = e.currentTarget.getAttribute('data-filter');
        if (filter && this.onFilterChange) {
          this.onFilterChange(filter);
        }
      });
    });
  }

  /**
   * 로딩 스켈레톤 UI를 주입하여 쾌적한 비동기 지연 감각 선사
   */
  renderSkeleton() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="section-title-bar">
        <div class="skeleton-line" style="width: 200px; height: 24px;"></div>
        <div class="skeleton-tabs">
          <div class="skeleton-tab"></div>
          <div class="skeleton-tab"></div>
          <div class="skeleton-tab"></div>
        </div>
      </div>
      
      <div class="places-grid-skeleton">
        <div class="skeleton-card glass">
          <div class="skeleton-img"></div>
          <div class="skeleton-line card-title"></div>
          <div class="skeleton-line card-text"></div>
        </div>
        <div class="skeleton-card glass">
          <div class="skeleton-img"></div>
          <div class="skeleton-line card-title"></div>
          <div class="skeleton-line card-text"></div>
        </div>
        <div class="skeleton-card glass">
          <div class="skeleton-img"></div>
          <div class="skeleton-line card-title"></div>
          <div class="skeleton-line card-text"></div>
        </div>
      </div>
    `;
  }
}
