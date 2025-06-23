export enum BaropotStatus {
  /** 모집중 (참가 신청 가능) */
  OPEN = 'OPEN',
  /** 정원 마감 (더 이상 신청 불가) */
  FULL = 'FULL',
  /** 모임 진행중 (모임 시작 시간 이후) */
  IN_PROGRESS = 'IN_PROGRESS',
  /** 모임 완료 (모임 종료) */
  COMPLETED = 'COMPLETED',
  /** 모임 취소 (주최자/관리자에 의해 취소) */
  CANCELLED = 'CANCELLED',
}

export const baropotStatusKorean = {
  [BaropotStatus.OPEN]: '모집중',
  [BaropotStatus.FULL]: '정원 마감',
  [BaropotStatus.IN_PROGRESS]: '모임 진행중',
  [BaropotStatus.COMPLETED]: '모임 완료',
  [BaropotStatus.CANCELLED]: '모임 취소',
};
