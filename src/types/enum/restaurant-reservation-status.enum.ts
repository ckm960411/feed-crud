export enum RestaurantReservationStatus {
  /**
   * 예약 승인
   */
  APPROVED = 'APPROVED',
  /**
   * 예약 취소
   */
  CANCELLED = 'CANCELLED',
  /**
   * 예약 완료
   * - 승인된 예약이 시간이 지나면 완료된 예약으로 변경
   */
  COMPLETED = 'COMPLETED',
}
