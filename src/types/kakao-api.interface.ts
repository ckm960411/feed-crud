// 카카오 로컬 API 응답 타입 정의
// 참고: https://developers.kakao.com/docs/latest/ko/local/dev-guide

export interface KakaoPlace {
  /** 장소 ID */
  id: string;
  /** 장소명, 업체명 */
  place_name: string;
  /** 카테고리 이름 */
  category_name: string;
  /** 중요 카테고리만 그룹핑한 카테고리 그룹 코드 */
  category_group_code: string;
  /** 중요 카테고리만 그룹핑한 카테고리 그룹명 */
  category_group_name: string;
  /** 전화번호 */
  phone: string;
  /** 전체 지번 주소 */
  address_name: string;
  /** 전체 도로명 주소 */
  road_address_name: string;
  /** X 좌표값, 경위도인 경우 longitude (경도) */
  x: string;
  /** Y 좌표값, 경위도인 경우 latitude(위도) */
  y: string;
  /** 장소 상세페이지 URL */
  place_url: string;
  /** 중심좌표까지의 거리 (단, x,y 파라미터를 준 경우에만 존재) 단위 meter */
  distance: string;
}

export interface KakaoSearchResponse {
  documents: KakaoPlace[];
  meta: {
    /** 검색어에 검색된 문서 수 */
    total_count: number;
    /** otal_count 중 노출 가능 문서 수 (최대: 45) */
    pageable_count: number;
    /**
     * 현재 페이지가 마지막 페이지인지 여부
     * 값이 false면 다음 요청 시 page 값을 증가시켜 다음 페이지 요청 가능
     */
    is_end: boolean;
    /** 질의어의 지역 및 키워드 분석 정보 */
    same_name: {
      /** 질의어에서 인식된 지역의 리스트 예: '중앙로 맛집' 에서 중앙로에 해당하는 지역 리스트 */
      region: string[];
      /** 질의어에서 지역 정보를 제외한 키워드 예: '중앙로 맛집' 에서 '맛집' */
      keyword: string;
      /** 인식된 지역 리스트 중, 현재 검색에 사용된 지역 정보 */
      selected_region: string;
    };
  };
}

// 카카오 API 검색 파라미터
export interface KakaoSearchParams {
  /** 검색을 원하는 질의어 */
  query: string;
  /** 카테고리 그룹 코드, 카테고리로 결과 필터링을 원하는 경우 사용 */
  category_group_code?: string;
  /** 중심 좌표의 X 혹은 경도(longitude) 값 특정 지역을 중심으로 검색할 경우 radius와 함께 사용 가능 */
  x?: number;
  /** 중심 좌표의 Y 혹은 위도(latitude) 값 특정 지역을 중심으로 검색할 경우 radius와 함께 사용 가능 */
  y?: number;
  /** 중심 좌표부터의 반경거리. 특정 지역을 중심으로 검색하려고 할 경우 중심좌표로 쓰일 x,y와 함께 사용 (단위: 미터(m), 최소: 0, 최대: 20000) */
  radius?: number;
  /**
   * 사각형의 지정 범위 내 제한 검색을 위한 좌표
   * 지도 화면 내 검색 등 제한 검색에서 사용 가능
   * 좌측 X 좌표, 좌측 Y 좌표, 우측 X 좌표, 우측 Y 좌표 형식
   */
  rect?: string;
  /** 페이지 번호 (1~45) */
  page?: number;
  /** 한 페이지에 보여질 문서 개수 (1~15) */
  size?: number;
  /** 정렬 방식 */
  sort?: 'distance' | 'accuracy';
}

// 음식점 카테고리 코드
export const KAKAO_FOOD_CATEGORIES = {
  KOREAN: 'FD6', // 음식점 > 한식
  CHINESE: 'FD6', // 음식점 > 중식
  JAPANESE: 'FD6', // 음식점 > 일식
  WESTERN: 'FD6', // 음식점 > 양식
  CAFE: 'CE7', // 카페
} as const;
