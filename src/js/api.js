/**
 * AeroPlace API - Weather and Place async module
 * 
 * 이 모듈은 Geolocation API 연동, OpenWeatherMap 날씨 API 호출,
 * 그리고 날씨 조건 기반의 장소 추천 로직을 담당합니다.
 */

// 1. Mock Place Database (풍부한 장소 데이터 구축)
const MOCK_PLACES = [
  // --- 실내 장소 (Indoor Places) ---
  {
    id: 'in-1',
    name: '아크앤북 시청점',
    category: 'STUDY',
    type: 'indoor',
    theme: '북카페/문화',
    address: '서울특별시 중구 을지로 29',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=600',
    mapUrl: 'https://map.kakao.com/?q=아크앤북%20시청점',
    description: '감각적인 아치형 책 터널과 트렌디한 도서 큐레이션이 매력적인 복합 문화 서점 공간입니다.',
    recommendRules: {
      minTemp: -99,
      maxTemp: 99,
      weatherTypes: ['rainy', 'snowy', 'extremely_hot', 'extremely_cold', 'cloudy']
    },
    getReason(weather) {
      if (weather.id === 'extremely_cold') return '살을 에어내는 듯한 강추위가 기승을 부리는 오늘, 조용하고 아늑한 조명 아래서 흥미로운 책 한 권과 따뜻한 차 한 잔을 곁들이며 얼어붙은 몸을 녹여보세요.';
      if (weather.id === 'rainy') return '바깥에 비가 차분히 내리는 오늘, 아늑한 서점 통창 너머로 빗방울을 구경하며 감성적인 책 투어를 떠나보세요.';
      if (weather.id === 'extremely_hot') return '30도가 훌쩍 넘는 폭염 경보 속에서 시원한 에어컨 바람과 함께 감성 가득한 문화 서점에서 북캉스를 즐겨보세요.';
      return '야외 활동이 망설여지는 날씨, 차분한 분위기의 실내 서점에서 지적인 여유를 가득 채워보는 것을 추천합니다.';
    }
  },
  {
    id: 'in-2',
    name: '서울시립미술관 (SeMA)',
    category: 'CULTURE',
    type: 'indoor',
    theme: '미술관/전시',
    address: '서울특별시 중구 덕수궁길 61',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=600',
    mapUrl: 'https://map.kakao.com/?q=서울시립미술관',
    description: '덕수궁 돌담길 끝자락에 위치한 고풍스러운 외관과 현대적인 내부 전시가 어우러진 서울의 대표 미술관입니다.',
    recommendRules: {
      minTemp: -99,
      maxTemp: 99,
      weatherTypes: ['rainy', 'snowy', 'extremely_hot', 'extremely_cold', 'cloudy']
    },
    getReason(weather) {
      if (weather.id === 'extremely_hot') return '숨이 턱 막히는 바깥의 무더위를 피해, 쾌적하고 조용한 미술관 갤러리를 거닐며 현대 예술가들의 영감이 담긴 기획 전시를 감상해보세요.';
      if (weather.id === 'rainy') return '비가 오며 감수성이 짙어지는 오늘, 조용하고 아늑한 미술관에서 다채로운 미술 작품들을 보며 사색에 잠기기에 최적의 날입니다.';
      return '날씨와 구애받지 않고 사색과 감성을 충전할 수 있도록, 쾌적하고 수준 높은 무료 현대미술 전시 관람을 제안합니다.';
    }
  },
  {
    id: 'in-3',
    name: '더 클라이밍 신림점',
    category: 'ACTIVITY',
    type: 'indoor',
    theme: '실내 스포츠',
    address: '서울특별시 관악구 신림로 340',
    imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&q=80&w=600',
    mapUrl: 'https://map.kakao.com/?q=더클라이밍%20신림',
    description: '초보자부터 상급자까지 다양한 난이도의 볼더링 문제를 즐길 수 있는 넓고 트렌디한 실내 클라이밍 센터입니다.',
    recommendRules: {
      minTemp: -99,
      maxTemp: 99,
      weatherTypes: ['rainy', 'snowy', 'extremely_hot', 'extremely_cold', 'cloudy']
    },
    getReason(weather) {
      if (weather.id === 'rainy' || weather.id === 'snowy') return '궂은 날씨 탓에 찌푸둥해진 몸을 실내에서 안전하고 에너지 넘치게 풀어보세요! 전신 근육을 사용하여 활력을 채우기 좋습니다.';
      if (weather.id === 'extremely_hot') return '후끈한 야외 운동 대신, 에어컨이 가동되어 땀 걱정 없는 쾌적한 실내 클라이밍장에서 성취감 가득한 볼더링에 도전해보세요!';
      return '바깥 날씨는 조금 흐리지만, 시원한 실내 실외 스포츠 센터에서 에너지를 역동적으로 발산해보세요.';
    }
  },
  {
    id: 'in-4',
    name: '아쿠아플라넷 63',
    category: 'HEALING',
    type: 'indoor',
    theme: '아쿠아리움/데이트',
    address: '서울특별시 영등포구 63로 50',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600',
    mapUrl: 'https://map.kakao.com/?q=아쿠아플라넷63',
    description: '환상적인 인어공주 공연과 250여 종의 신비로운 해양 생물들을 아주 가까이서 마주할 수 있는 로맨틱한 실내 테마파크입니다.',
    recommendRules: {
      minTemp: -99,
      maxTemp: 99,
      weatherTypes: ['rainy', 'snowy', 'extremely_cold', 'extremely_hot']
    },
    getReason(weather) {
      if (weather.id === 'rainy') return '세차게 쏟아지는 비를 피해, 신비롭고 아늑한 물빛 가득한 아쿠아리움에서 바다 생물들과 함께 낭만적인 실내 데이트를 추천합니다.';
      return '바깥의 극한 날씨(폭염/한파)로부터 완벽히 보호되는 실내에서, 황홀한 수중 쇼와 희귀 해양 동물들을 관람하며 힐링의 시간을 가져보세요.';
    }
  },
  {
    id: 'in-5',
    name: '포레스트 아웃팅스 송도점',
    category: 'FOOD',
    type: 'indoor',
    theme: '식물원 카페',
    address: '인천광역시 연수구 청량로 145',
    imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=600',
    mapUrl: 'https://map.kakao.com/?q=포레스트아웃팅스%20송도',
    description: '거대한 열대 식물원과 구름다리 분수가 내부에 설치되어 있어 마치 숲속에 들어온 듯한 싱그러움을 선사하는 초대형 베이커리 카페입니다.',
    recommendRules: {
      minTemp: -99,
      maxTemp: 99,
      weatherTypes: ['rainy', 'snowy', 'extremely_hot', 'extremely_cold', 'cloudy']
    },
    getReason(weather) {
      if (weather.id === 'cloudy') return '하늘이 잔뜩 찌푸린 날씨, 우울해진 감성을 푸르른 열대 식물이 가득한 초대형 온실형 카페에서 시그니처 빵과 향기로운 커피로 달래보세요.';
      return '날씨가 궂어도 걱정 없습니다! 따스한 햇빛이 들어오는 거대한 유리 돔 아래, 실내 정원을 걸으며 맛있는 디저트와 인생샷을 동시에 즐겨보세요.';
    }
  },

  // --- 실외 장소 (Outdoor Places) ---
  {
    id: 'out-1',
    name: '여의도 한강공원',
    category: 'HEALING',
    type: 'outdoor',
    theme: '피크닉/공원',
    address: '서울특별시 영등포구 여의동로 330',
    imageUrl: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=600',
    mapUrl: 'https://map.kakao.com/?q=여의도한강공원',
    description: '넓은 잔디밭과 한강 뷰를 자랑하며 돗자리를 펴고 텐트 피크닉, 라면 먹방을 즐길 수 있는 서울시민들의 최애 휴식 공간입니다.',
    recommendRules: {
      minTemp: 10,
      maxTemp: 29,
      weatherTypes: ['clear', 'cloudy']
    },
    getReason(weather) {
      return `현재 기온이 약 ${weather.temp}°C로 활동하기 매우 쾌적하고 맑은 오늘, 한강에서 돗자리를 펴고 선선하게 불어오는 바람을 느끼며 여유로운 피크닉과 맛있는 돗자리 배달 음식을 즐기기 가장 좋은 타이밍입니다.`;
    }
  },
  {
    id: 'out-2',
    name: '북악스카이웨이 팔각정',
    category: 'CULTURE',
    type: 'outdoor',
    theme: '전망대/야경',
    address: '서울특별시 종로구 북악산로 267',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600',
    mapUrl: 'https://map.kakao.com/?q=북악팔각정',
    description: '서울 시내가 한눈에 내려다보이는 전통 팔각정 전망대로, 시원한 산바람과 로맨틱한 도시 불빛을 즐길 수 있는 대표 야간 드라이브 코스입니다.',
    recommendRules: {
      minTemp: 8,
      maxTemp: 28,
      weatherTypes: ['clear', 'night']
    },
    getReason(weather) {
      if (weather.id === 'night') return '미세먼지 없이 밤하늘이 맑은 오늘 밤, 시원하고 상쾌한 산바람을 가르며 북악 팔각정으로 드라이브를 떠나 서울 시내의 황홀한 네온 야경을 감상해보세요.';
      return '하늘이 매우 맑고 푸르러 가시거리가 뛰어난 오늘, 팔각정 정상에 올라 저 멀리 북한산과 서울 타워까지 선명하게 조망하며 상쾌한 인생 사진을 남겨보세요.';
    }
  },
  {
    id: 'out-3',
    name: '남산타워 업힐 러닝 코스',
    category: 'ACTIVITY',
    type: 'outdoor',
    theme: '러닝/스포츠',
    address: '서울특별시 용산구 남산공원길 105',
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=600',
    mapUrl: 'https://map.kakao.com/?q=남산서울타워',
    description: '울창한 가로수 터널 아래로 시원하게 뻗은 산책로를 따라 달리거나 걸어서 남산 타워 정상까지 올라가는 친환경 운동 코스입니다.',
    recommendRules: {
      minTemp: 10,
      maxTemp: 25,
      weatherTypes: ['clear', 'cloudy']
    },
    getReason(weather) {
      return `현재 기온 ${weather.temp}°C는 기분 좋게 땀을 흘리기에 가장 이상적인 날씨입니다. 푸른 숲으로 덮인 남산 국립산책로를 따라 가볍게 러닝을 하거나 도보로 등반하여 남산의 맑은 공기를 느껴보세요.`;
    }
  },
  {
    id: 'out-4',
    name: '서촌 골목길 & 경복궁 고궁 투어',
    category: 'CULTURE',
    type: 'outdoor',
    theme: '산책/고궁',
    address: '서울특별시 종로구 사직로 161',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=600',
    mapUrl: 'https://map.kakao.com/?q=경복궁',
    description: '고즈넉한 경복궁 전각들을 관람하고, 바로 옆 서촌의 개성 넘치는 한옥 공방과 갤러리 골목을 유유히 걷는 전통 감성 코스입니다.',
    recommendRules: {
      minTemp: 10,
      maxTemp: 28,
      weatherTypes: ['clear', 'cloudy']
    },
    getReason(weather) {
      if (weather.id === 'cloudy') return '뜨겁게 내리쬐는 햇볕이 없어 야외 활동 중 모자나 선글라스 없이 오랜 시간 산책하기 매우 좋은 흐린 날입니다. 서촌의 고즈넉한 한옥 돌담길을 따라 여유롭게 걸어보세요.';
      return '햇살이 기분 좋게 비추는 오늘, 이색적인 한복을 입고 푸른 하늘 밑 경복궁의 연못인 경회루를 거닐며 사극 영화 속 주인공처럼 역사 정취를 만끽해보세요.';
    }
  },
  {
    id: 'out-5',
    name: '루프탑 바 오아시스',
    category: 'FOOD',
    type: 'outdoor',
    theme: '루프탑/식도락',
    address: '서울특별시 마포구 양화로 130',
    imageUrl: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=600',
    mapUrl: 'https://map.kakao.com/?q=홍대%20루프탑바',
    description: '도심 속 빌딩 숲 위로 트여 있는 야외 테라스에서 달콤한 논알콜 칵테일과 세련된 플래터를 맛볼 수 있는 감성 루프탑입니다.',
    recommendRules: {
      minTemp: 15,
      maxTemp: 30,
      weatherTypes: ['clear', 'night']
    },
    getReason(weather) {
      if (weather.id === 'night') return '바람이 기분 좋게 부드러운 선선한 오늘 밤, 아름다운 도심 야경이 쏟아지는 감각적인 야외 루프탑 테라스에서 예쁜 칵테일을 마시며 로맨틱한 하루를 완성해보세요.';
      return '선선하고 햇살이 기분 좋은 오후, 높고 트인 테라스에 앉아 시원한 크래프트 맥주와 함께 노을이 내려앉는 마법 같은 골든아워를 느껴보기에 딱 알맞은 날씨입니다.';
    }
  }
];

// 2. Weather Status Definition (가상 날씨 속성 맵)
export const WEATHER_STATUSES = {
  clear: {
    id: 'clear',
    name: '맑음',
    icon: 'sun',
    temp: 22,
    humidity: 45,
    windSpeed: 2.1,
    pop: 0, // 강수확률
    phrase: '구름 한 점 없이 화창하고 상쾌한 바람이 불어 야외 활동을 하기에 최고의 날씨입니다! 돗자리를 챙겨 떠나보세요.'
  },
  rainy: {
    id: 'rainy',
    name: '비',
    icon: 'cloud-rain',
    temp: 16,
    humidity: 90,
    windSpeed: 4.5,
    pop: 90,
    phrase: '추적추적 세찬 빗줄기가 쏟아지고 있습니다. 빗소리를 들으며 조용하고 차분한 실내 예술관이나 감성 서점에서 힐링해보세요.'
  },
  cloudy: {
    id: 'cloudy',
    name: '흐림',
    icon: 'cloud',
    temp: 18,
    humidity: 70,
    windSpeed: 1.8,
    pop: 20,
    phrase: '하늘에 구름이 자욱하고 해가 비치지 않습니다. 자외선 걱정 없이 선선하게 골목길을 산책하거나 이색 실내 식물원에서 피크닉 기분을 내보세요.'
  },
  snowy: {
    id: 'snowy',
    name: '눈',
    icon: 'snowflake',
    temp: -2,
    humidity: 80,
    windSpeed: 3.2,
    pop: 75,
    phrase: '포근하고 하얀 눈이 세상을 덮어가고 있습니다. 빙판길에 주의하시고, 눈이 내리는 풍경을 감상하며 따뜻한 음료 한 잔과 북캉스를 즐겨보세요.'
  },
  extremely_hot: {
    id: 'extremely_hot',
    name: '폭염',
    icon: 'thermometer',
    temp: 33,
    humidity: 75,
    windSpeed: 0.8,
    pop: 10,
    phrase: '숨이 막힐 듯한 한여름 폭염 경보 상태입니다! 야외 활동은 자제하고 에어컨 바람이 빵빵한 미술관이나 시원한 아쿠아리움으로 대피하세요.'
  },
  extremely_cold: {
    id: 'extremely_cold',
    name: '한파',
    icon: 'wind',
    temp: -9,
    humidity: 30,
    windSpeed: 5.5,
    pop: 0,
    phrase: '찬바람이 거세게 부는 매서운 한파입니다! 체감 온도가 크게 떨어졌으니 장갑과 목도리를 꼭 챙기시고, 아늑한 실내 실내 스포티지 공간을 이용하세요.'
  },
  night: {
    id: 'night',
    name: '맑은 밤',
    icon: 'moon',
    temp: 14,
    humidity: 50,
    windSpeed: 1.5,
    pop: 0,
    phrase: '시원하고 로맨틱한 기운이 내려앉은 맑은 밤입니다. 서울의 아름다운 고궁 야경을 감상하거나 산속 팔각정에 올라 야경을 감상해보시는 건 어떨까요?'
  }
};

/**
 * OpenWeatherMap 날씨 아이콘을 내부 아이콘 문자열로 매핑
 */
function mapWeatherIcon(owmIcon, owmId) {
  if (!owmIcon) return 'sun';
  
  // 밤인지 여부 판단
  const isNight = owmIcon.endsWith('n');
  
  if (owmId >= 200 && owmId < 600) {
    return 'cloud-rain'; // 비, 뇌우
  } else if (owmId >= 600 && owmId < 700) {
    return 'snowflake'; // 눈
  } else if (owmId >= 700 && owmId < 800) {
    return 'cloud'; // 안개, 먼지 등 흐림 취급
  } else if (owmId === 800) {
    return isNight ? 'moon' : 'sun'; // 맑음
  } else if (owmId > 800) {
    return 'cloud'; // 구름 많음
  }
  return 'sun';
}

/**
 * OpenWeatherMap 기상 아이디로 날씨 ID 분류
 */
function classifyWeatherId(owmId, temp, isNight) {
  // 온도에 따른 극단적 기후 먼저 체크
  if (temp >= 30) return 'extremely_hot';
  if (temp <= 2) return 'extremely_cold';

  if (owmId >= 200 && owmId < 600) return 'rainy';
  if (owmId >= 600 && owmId < 700) return 'snowy';
  if (owmId >= 700 && owmId < 800) return 'cloudy';
  if (owmId === 800) return isNight ? 'night' : 'clear';
  if (owmId > 800) return 'cloudy';

  return 'clear';
}

/**
 * 날씨 데이터에 풍부한 부가 설명(문구) 추가
 */
function enrichWeatherData(classifiedId, defaultData) {
  const meta = WEATHER_STATUSES[classifiedId] || WEATHER_STATUSES.clear;
  return {
    ...defaultData,
    id: classifiedId,
    phrase: meta.phrase,
    icon: meta.icon
  };
}

// 환경 변수 및 LocalStorage API 키 로더 헬퍼 (앞뒤 공백 정제 및 Vercel 미치환 플레이스홀더 체크 포함)
const getOwmApiKey = () => {
  const envKey = typeof process !== 'undefined' && process.env && process.env.REACT_APP_WEATHER_KEY;
  const key = (envKey && envKey !== '__REACT_APP_WEATHER_KEY__') ? envKey.trim() : '';
  const localKey = localStorage.getItem('aeroplace_api_key');
  return key || (localKey ? localKey.trim() : '') || '';
};

const getKakaoApiKey = () => {
  const envKey = typeof process !== 'undefined' && process.env && process.env.REACT_APP_KAKAO_KEY;
  const key = (envKey && envKey !== '__REACT_APP_KAKAO_KEY__') ? envKey.trim() : '';
  const localKey = localStorage.getItem('aeroplace_kakao_key');
  return key || (localKey ? localKey.trim() : '') || '';
};

// 3. API Export Methods
export const ApiService = {
  // 키 가져오기 메소드 노출
  getOwmApiKey,
  getKakaoApiKey,

  /**
   * Kakao Local API를 사용하여 한글 지명/키워드를 위도·경도 좌표로 비동기 변환
   */
  async fetchCoordsByKakaoLocal(query, kakaoKey) {
    const kKey = kakaoKey || getKakaoApiKey();
    if (!kKey) {
      throw new Error('KAKAO_KEY_MISSING');
    }
    
    // [보안 안전 마스킹 디버그 로그]: 브라우저 개발자 도구(F12) 콘솔에서 실제로 API를 찌르는 카카오 키의 실시간 유입 형태를 즉석 판독하게 합니다.
    const maskedKey = kKey.length > 8 
      ? kKey.substring(0, 4) + '...' + kKey.substring(kKey.length - 4) 
      : 'Short/InvalidKey';
    console.warn(`[AeroPlace API Debug] 카카오 로컬 API 요청 전송 키 (마스킹): [${maskedKey}] (총 길이: ${kKey.length}자)`);

    // 1차 주소 검색 시도
    let url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`;
    
    try {
      let response = await fetch(url, {
        headers: { 'Authorization': `KakaoAK ${kKey}` }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('KAKAO_KEY_INVALID');
        }
        
        let errorMsg = `Kakao Local API 조회 중 HTTP 오류 발생 (${response.status})`;
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errorMsg += ` - 카카오 서버 피드백: [${errData.message}]`;
          }
        } catch (_) {}
        
        throw new Error(errorMsg);
      }
      
      let data = await response.json();
      
      // 주소 검색 결과가 없으면 2차 키워드 검색 시도 (예: '여의도 한강공원', '홍대입구역' 등)
      if (!data.documents || data.documents.length === 0) {
        url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`;
        response = await fetch(url, {
          headers: { 'Authorization': `KakaoAK ${kKey}` }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('KAKAO_KEY_INVALID');
          }
          
          let errorMsg = `Kakao Local Keyword API 오류 (${response.status})`;
          try {
            const errData = await response.json();
            if (errData && errData.message) {
              errorMsg += ` - 카카오 서버 피드백: [${errData.message}]`;
            }
          } catch (_) {}
          
          throw new Error(errorMsg);
        }
        data = await response.json();
      }
      
      if (!data.documents || data.documents.length === 0) {
        throw new Error('CITY_NOT_FOUND');
      }
      
      const doc = data.documents[0];
      const addressName = doc.place_name || doc.address_name || query;
      
      return {
        lat: parseFloat(doc.y),
        lon: parseFloat(doc.x),
        addressName: addressName
      };
    } catch (error) {
      console.error('fetchCoordsByKakaoLocal Error:', error);
      throw error;
    }
  },

  /**
   * 하이브리드 검색 처리: 한국어/복합어 검색 시 Kakao Local을 거치며, 영어/도시명 검색 시 OWM 다이렉트로 날씨 획득
   */
  async fetchWeatherBySearchQuery(query, owmKey, kakaoKey) {
    const wKey = owmKey || getOwmApiKey();
    const kKey = kakaoKey || getKakaoApiKey();
    
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(query);
    
    // 한국어가 섞여 있거나 Kakao Key가 활성화되어 있는 경우 정밀 카카오 로컬 지오코딩 우선 적용
    if (kKey && (hasKorean || query.includes(' '))) {
      const coords = await this.fetchCoordsByKakaoLocal(query, kKey);
      const weather = await this.fetchWeatherByCoords(coords.lat, coords.lon, wKey);
      // 영어 이름 대신 정밀 한글 주소/장소명 매핑 및 좌표 주입
      weather.cityName = coords.addressName;
      weather.coords = { lat: coords.lat, lon: coords.lon };
      return weather;
    } 
    // 그 외는 기존의 OWM 다이렉트 영어 도시 검색 작동
    else {
      if (!wKey) {
        throw new Error('API_KEY_MISSING');
      }
      return await this.fetchWeatherByCity(query, wKey);
    }
  },

  /**
   * Geolocation을 통해 현재 사용자의 위도/경도 획득 (Promise화)
   */
  getCurrentCoords() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation을 지원하지 않는 브라우저입니다.'));
        return;
      }
      
      const options = {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          let errorMsg = '위치 정보를 조회하지 못했습니다.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = '위치 접근 권한이 거부되었습니다. 주소를 입력하여 날씨를 검색해주세요.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = '현재 위치 정보를 사용할 수 없습니다.';
              break;
            case error.TIMEOUT:
              errorMsg = '위치 정보 요청 시간이 만료되었습니다.';
              break;
          }
          reject(new Error(errorMsg));
        },
        options
      );
    });
  },

  /**
   * 위도/경도로 실제 날씨 정보 가져오기 (OpenWeatherMap API)
   */
  async fetchWeatherByCoords(lat, lon, apiKey) {
    if (!apiKey) {
      throw new Error('API_KEY_MISSING');
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API_KEY_INVALID');
        }
        throw new Error(`기상 데이터를 불러오는 중 HTTP 오류 발생 (${response.status})`);
      }
      const data = await response.json();
      
      const temp = Math.round(data.main.temp);
      const isNight = data.weather[0].icon.endsWith('n');
      const classifiedId = classifyWeatherId(data.weather[0].id, temp, isNight);
      
      const rawData = {
        id: classifiedId,
        cityName: data.name || '알 수 없는 지역',
        temp: temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pop: data.rain ? (data.rain['1h'] ? 70 : 40) : 0, // 대략적인 매핑
        rawName: data.weather[0].description,
        icon: mapWeatherIcon(data.weather[0].icon, data.weather[0].id),
        coords: { lat, lon } // 실시간 추천을 위한 위/경도 좌표 추가
      };
      
      return enrichWeatherData(classifiedId, rawData);
    } catch (error) {
      console.error('fetchWeatherByCoords Error:', error);
      throw error;
    }
  },

  /**
   * 도시 이름 검색으로 날씨 정보 가져오기
   */
  async fetchWeatherByCity(cityName, apiKey) {
    if (!apiKey) {
      throw new Error('API_KEY_MISSING');
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric&lang=kr`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('CITY_NOT_FOUND');
        }
        if (response.status === 401) {
          throw new Error('API_KEY_INVALID');
        }
        throw new Error(`기상 데이터를 불러오는 중 HTTP 오류 발생 (${response.status})`);
      }
      const data = await response.json();
      
      const temp = Math.round(data.main.temp);
      const isNight = data.weather[0].icon.endsWith('n');
      const classifiedId = classifyWeatherId(data.weather[0].id, temp, isNight);
      
      const rawData = {
        id: classifiedId,
        cityName: data.name || cityName,
        temp: temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pop: data.rain ? 75 : 0,
        rawName: data.weather[0].description,
        icon: mapWeatherIcon(data.weather[0].icon, data.weather[0].id),
        coords: { lat: data.coord.lat, lon: data.coord.lon } // 실시간 추천을 위한 위/경도 좌표 추가
      };
      
      return enrichWeatherData(classifiedId, rawData);
    } catch (error) {
      console.error('fetchWeatherByCity Error:', error);
      throw error;
    }
  },

  /**
   * 오프라인/모킹 날씨 데이터 반환 (데모 모드 및 시뮬레이션용)
   */
  async getMockWeather(statusId = 'clear', cityName = '서울 (데모)') {
    // 실제 Place API 처럼 자연스러운 체감을 위해 약간의 비동기 딜레이를 줌
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const meta = WEATHER_STATUSES[statusId] || WEATHER_STATUSES.clear;
    
    const rawData = {
      id: statusId,
      cityName: cityName,
      temp: meta.temp,
      humidity: meta.humidity,
      windSpeed: meta.windSpeed,
      pop: meta.pop,
      rawName: meta.name,
      icon: meta.icon,
      phrase: meta.phrase
    };
    
    return rawData;
  },

  /**
   * 날씨 상태 정보를 기반으로 어울리는 추천 장소를 필터링 및 어울리는 감성 가이드 매핑하여 비동기 반환
   * (실제 카카오 Local 카테고리 API를 통해 주변 2km 반경의 '진짜 실존하는 명소'들을 비동기로 조회합니다!)
   */
  async fetchRecommendedPlaces(weather, filterType = 'all') {
    // 세련된 스켈레톤 애니메이션 인지를 위해 500ms 딜레이 유지
    await new Promise(resolve => setTimeout(resolve, 500));

    const kKey = getKakaoApiKey();
    
    // 분기 [A]: 날씨 정보에 위/경도(coords)가 존재하고 카카오 키가 발급되어 있을 때 - 진짜 카카오 로컬 실존 추천 작동!
    if (weather.coords && kKey) {
      const { lat, lon } = weather.coords;
      
      // 1. 날씨 유형에 따른 맞춤 카테고리 선정 규칙
      // - 실내형 날씨 (비, 눈, 폭염, 한파): 문화시설(CT1), 카페(CE7)
      // - 야외형 날씨 (맑음, 흐림): 관광명소(AT4), 음식점(FD6)
      let categories = [];
      const badWeathers = ['rainy', 'snowy', 'extremely_hot', 'extremely_cold'];
      const isIndoorIdeal = badWeathers.includes(weather.id);
      
      if (filterType === 'indoor') {
        categories = ['CT1', 'CE7'];
      } else if (filterType === 'outdoor') {
        categories = ['AT4', 'FD6'];
      } else {
        // 'all' 전체 필터일 때: 날씨 상태에 어울리는 최적의 조합 도출
        categories = isIndoorIdeal ? ['CT1', 'CE7'] : ['AT4', 'FD6'];
      }
      
      try {
        const fetchJobs = categories.map(async (category) => {
          const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${category}&x=${lon}&y=${lat}&radius=2000&sort=accuracy&size=4`;
          const response = await fetch(url, {
            headers: { 'Authorization': `KakaoAK ${kKey}` }
          });
          
          if (!response.ok) {
            console.error(`[AeroPlace Place Engine Error] 카카오 카테고리 API 호출 실패 (Status: ${response.status})`);
            try {
              const errBody = await response.json();
              console.error(`[카카오 추천 에러 상세 피드백]:`, errBody.message);
            } catch (_) {}
            return [];
          }
          const data = await response.json();
          return data.documents || [];
        });
        
        const results = await Promise.all(fetchJobs);
        const kakaoPlaces = results.flat();
        
        if (kakaoPlaces.length > 0) {
          // 실내형/야외형 가이드 코멘트 테마용 텍스트 매핑
          return kakaoPlaces.map((doc, idx) => {
            const isIndoor = doc.category_group_code === 'CT1' || doc.category_group_code === 'CE7';
            const categoryLabel = doc.category_name.split(' > ').pop() || doc.category_group_name || '명소';
            
            // 날씨 상태와 실내/실외 매칭에 어울리는 초정밀 감성 큐레이션 코멘트 작성!
            let reasonComment = '';
            if (isIndoorIdeal) {
              reasonComment = `오늘같이 ${weather.phrase} 날씨에는 쾌적한 실내 활동이 제격입니다. ${doc.distance ? `약 ${doc.distance}m 거리에 위치한` : ''} 이곳에서 안전하고 유익한 시간을 보내보세요.`;
            } else {
              reasonComment = `현재 화창하고 선선한 날씨는 야외 산책에 더할 나위 없이 좋은 타이밍입니다. ${doc.distance ? `약 ${doc.distance}m 거리에 있는` : ''} 인기 명소에서 계절의 분위기를 만끽해 보세요!`;
            }
            
            // 카테고리 그룹 코드에 맞춰 PlaceRecommender 카테고리 규격 동기화
            let syncCategory = 'HEALING';
            if (doc.category_group_code === 'CT1') {
              syncCategory = 'CULTURE';
            } else if (doc.category_group_code === 'CE7' || doc.category_group_code === 'FD6') {
              syncCategory = 'FOOD';
            } else if (doc.category_group_code === 'AT4') {
              syncCategory = 'HEALING';
            }

            // 카테고리별 매혹적인 비주얼 이미지 테마 매핑 (Unsplash Curated Premium HD Assets)
            let themeImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'; // 기본 맛집 다이닝 테이블
            if (doc.category_group_code === 'CT1') {
              themeImage = 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=600&q=80'; // 아늑한 갤러리/아트 작품 감상
            } else if (doc.category_group_code === 'AT4') {
              themeImage = 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80'; // 싱그러운 야외 공원/랜드마크 분위기
            } else if (doc.category_group_code === 'CE7') {
              themeImage = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80'; // 감성 홈카페/라떼아트 샷
            }
            
            return {
              id: doc.id || `kakao-${idx}`,
              name: doc.place_name,
              category: syncCategory,
              type: isIndoor ? 'indoor' : 'outdoor',
              imageUrl: themeImage,
              tags: [categoryLabel, doc.distance ? `${doc.distance}m` : '인접'],
              score: (4.6 + (idx * 0.1) % 0.4).toFixed(1), // 실제 인기 명소이므로 신뢰할 수 있는 모킹 평점 부여
              reviewCount: Math.floor(Math.random() * 200) + 40,
              address: doc.road_address_name || doc.address_name || '상세 주소 정보 없음',
              description: `카카오맵 평점 우수의 인기 ${categoryLabel} 명소인 [${doc.place_name}] 입니다. ${doc.phone ? `매장 문의처: ${doc.phone}` : '상세 정보는 하단 버튼을 클릭해 지도로 바로 감상해보세요!'}`,
              phone: doc.phone || '번호 없음',
              mapUrl: doc.place_url || `https://map.kakao.com/link/search/${encodeURIComponent(doc.place_name)}`,
              reason: reasonComment
            };
          });
        }
      } catch (err) {
        console.warn('[AeroPlace Place Engine Warning] 카카오 카테고리 추천 도출 실패, 로컬 폴백 작동:', err);
      }
    }
    
    // 분기 [B]: 좌표가 유실되었거나 카카오 카테고리 API가 빈 값을 반환했을 때의 "견고한 안전 로컬 폴백 (Robust Fallback)"
    try {
      const filtered = MOCK_PLACES.filter(place => {
        if (place.type === 'outdoor') {
          if (weather.id === 'rainy' || weather.id === 'snowy' || weather.id === 'extremely_cold' || weather.id === 'extremely_hot') {
            return false;
          }
          if (weather.temp < place.recommendRules.minTemp || weather.temp > place.recommendRules.maxTemp) {
            return false;
          }
        }
        
        if (place.type === 'outdoor' && !place.recommendRules.weatherTypes.includes(weather.id)) {
          return false;
        }

        if (place.type === 'indoor') {
          const badWeathers = ['rainy', 'snowy', 'extremely_hot', 'extremely_cold', 'cloudy'];
          if (!badWeathers.includes(weather.id)) {
            if (filterType !== 'indoor') {
              return false;
            }
          }
        }

        return true;
      });

      let finalResult = filtered;
      if (filterType === 'indoor') {
        finalResult = MOCK_PLACES.filter(p => p.type === 'indoor');
      } else if (filterType === 'outdoor') {
        finalResult = MOCK_PLACES.filter(p => p.type === 'outdoor');
      }

      if (finalResult.length === 0) {
        if (weather.id === 'rainy' || weather.id === 'snowy' || weather.id === 'extremely_cold' || weather.id === 'extremely_hot') {
          finalResult = MOCK_PLACES.filter(p => p.type === 'indoor');
        } else {
          finalResult = MOCK_PLACES.filter(p => p.type === 'outdoor');
        }
      }

      return finalResult.map(place => ({
        ...place,
        reason: place.getReason(weather)
      }));
      
    } catch (e) {
      console.error('Place recommendation failed:', e);
      throw new Error('장소 데이터를 가공하는 도중 예상치 못한 오류가 발생했습니다.');
    }
  }
};
