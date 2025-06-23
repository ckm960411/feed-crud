export enum BaropotJoinedStatus {
  /** 신청 대기 (승인 전) */
  PENDING = 'PENDING',
  /** 참가 승인 (정식 참가자) */
  APPROVED = 'APPROVED',
  /** 참가 거절 */
  REJECTED = 'REJECTED',
  /** 참가자가 직접 신청 취소 */
  CANCELLED = 'CANCELLED',
  /** 주최자/관리자가 강제 퇴장시킴 */
  REMOVED = 'REMOVED',
}
