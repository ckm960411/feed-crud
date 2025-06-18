/**
 * 위치 관련 유틸리티 함수들
 */

/**
 * 주어진 위치와 반경으로 경계 박스 계산
 * @param lat 위도
 * @param lng 경도
 * @param radiusKm 반경 (km)
 * @returns 경계 박스 좌표
 */
export function calculateBoundingBox(
  lat: number,
  lng: number,
  radiusKm: number,
) {
  // 1도 ≈ 111km (위도)
  const latDelta = radiusKm / 111;

  // 경도는 위도에 따라 달라짐 (적도에서 1도 ≈ 111km, 극지방에서는 더 작음)
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

/**
 * 두 지점 간의 거리 계산 (Haversine 공식)
 * @param lat1 첫 번째 지점 위도
 * @param lng1 첫 번째 지점 경도
 * @param lat2 두 번째 지점 위도
 * @param lng2 두 번째 지점 경도
 * @returns 거리 (km)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // 소수점 2자리까지
}

/**
 * 도를 라디안으로 변환
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
