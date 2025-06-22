import { ApiProperty } from '@nestjs/swagger';
import { map, sumBy, values } from 'lodash';
import { Baropot } from 'src/entities/baropot/baropot.entity';
import { BaropotJoinedStatus } from 'src/types/enum/baropot-joined-status.enum';
import { BaropotStatus } from 'src/types/enum/baropot-status.enum';
import { ContactMethod } from 'src/types/enum/contact-method.enum';
import { ParticipantAgeGroup } from 'src/types/enum/participant-age-group.enum';
import { ParticipantGender } from 'src/types/enum/participant-gender.enum';
import { PaymentMethod } from 'src/types/enum/payment-method.enum';

export class FindBaropotResDto {
  @ApiProperty({
    description: '바로팟 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '바로팟 생성일',
    example: '2025-06-22T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '바로팟 수정일',
    example: '2025-06-22T12:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '바로팟 모임 타이틀',
    example: '킹경문에서 진또배기 순대곱창전골 먹어보자',
  })
  title: string;

  @ApiProperty({
    description: '바로팟 상태',
    example: 'OPEN',
    enum: [...values(BaropotStatus)],
  })
  status: BaropotStatus;

  @ApiProperty({
    description: '바로팟 모임 장소',
    example: '종로3가 6번출구',
  })
  location: string;

  @ApiProperty({
    description: '바로팟 최대 참가자수',
    example: 4,
  })
  maxParticipants: number;

  @ApiProperty({
    description: '바로팟 모임 날짜',
    example: '2025-06-22',
  })
  date: string;

  @ApiProperty({
    description: '바로팟 모임 시간',
    example: '12:00',
  })
  time: string;

  @ApiProperty({
    description: '바로팟 참가자 성별',
    example: 'MALE',
    enum: [...values(ParticipantGender)],
  })
  participantGender: ParticipantGender;

  @ApiProperty({
    description: '바로팟 참가자 나이대',
    example: 'THIRTIES',
    enum: [...values(ParticipantAgeGroup)],
  })
  participantAgeGroup: ParticipantAgeGroup;

  @ApiProperty({
    description: '바로팟 참가자 연락 방법',
    example: 'KAKAO',
    enum: [...values(ContactMethod)],
    nullable: true,
  })
  contactMethod: ContactMethod | null;

  @ApiProperty({
    description: '바로팟 참가자 인당 예상 비용',
    example: 30000,
    nullable: true,
  })
  estimatedCostPerPerson: number | null;

  @ApiProperty({
    description: '바로팟 결제 방법',
    example: 'DUTCH_PAY',
    enum: [...values(PaymentMethod)],
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: '바로팟 모임 설명',
    example: '킹경문 안 먹으면 그때까지 인생 손해보는 거임',
  })
  description: string;

  @ApiProperty({
    description: '바로팟 모임 규칙',
    example: '여미새 남미새는 오지마세요~',
  })
  rule: string;

  @ApiProperty({
    description: '바로팟 태그',
    example: ['순대곱창', '순대', '곱창'],
  })
  tags: string[];

  @ApiProperty({
    description: '호스트',
    example: {
      id: 1,
      name: '장혜리',
    },
  })
  host: { userId: number; name: string };

  @ApiProperty({
    description: '현재 참가자 수',
    example: 3,
  })
  participantCount: number;

  @ApiProperty({
    description: '대기 상태 참가자 수',
    example: 5,
  })
  pendingParticipantCount: number;

  @ApiProperty({
    description: '참가자 목록',
    example: [
      {
        userId: 1,
        name: '장혜리',
        isHost: true,
        joinedStatus: 'APPROVED',
        hostMemo: '내가 대장',
      },
    ],
  })
  participants: {
    userId: number;
    name: string;
    isHost: boolean;
    joinedStatus: BaropotJoinedStatus;
    joinMessage: string | null;
    hostMemo: string | null;
  }[];

  constructor(baropot: Baropot) {
    this.id = baropot.id;
    this.createdAt = baropot.createdAt;
    this.updatedAt = baropot.updatedAt;
    this.title = baropot.title;
    this.status = baropot.status;
    this.location = baropot.location;
    this.maxParticipants = baropot.maxParticipants;
    this.date = baropot.date;
    this.time = baropot.time;
    this.participantGender = baropot.participantGender;
    this.participantAgeGroup = baropot.participantAgeGroup;
    this.contactMethod = baropot.contactMethod;
    this.estimatedCostPerPerson = baropot.estimatedCostPerPerson;
    this.paymentMethod = baropot.paymentMethod;
    this.description = baropot.description;
    this.rule = baropot.rule;
    this.tags = map(baropot.baropotToBaropotTags, 'baropotTag.name');
    this.host = {
      userId: baropot.baropotParticipants.find(
        (participant) => participant.isHost,
      )?.user.id,
      name: baropot.baropotParticipants.find(
        (participant) => participant.isHost,
      )?.user.name,
    };
    this.participantCount = sumBy(
      baropot.baropotParticipants,
      ({ joinedStatus }) =>
        Number(joinedStatus === BaropotJoinedStatus.APPROVED),
    );
    this.pendingParticipantCount = sumBy(
      baropot.baropotParticipants,
      ({ joinedStatus }) =>
        Number(joinedStatus === BaropotJoinedStatus.PENDING),
    );
    this.participants = map(baropot.baropotParticipants, (participant) => ({
      userId: participant.user.id,
      name: participant.user.name,
      isHost: participant.isHost,
      joinedStatus: participant.joinedStatus,
      joinMessage: participant.joinMessage,
      hostMemo: participant.hostMemo,
    }));
  }
}
