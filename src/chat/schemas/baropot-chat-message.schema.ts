import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BaropotChatMessage extends Document {
  @Prop({ required: true, unique: true })
  messageId: string;

  @Prop({ required: true })
  baropotChatRoomId: number; // PostgreSQL BaropotChatRoom의 id (PK)

  @Prop({ required: true })
  senderId: number; // PostgreSQL User의 id (PK)

  @Prop({ required: true })
  senderName: string; // PostgreSQL User의 name

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ type: Array, default: [] })
  readBy: Array<{
    userId: string;
    readAt: Date;
  }>;
}

export const BaropotChatMessageSchema =
  SchemaFactory.createForClass(BaropotChatMessage);

// 인덱스 설정
BaropotChatMessageSchema.index({ baropotChatRoomId: 1, timestamp: -1 }); // 채팅방별 메시지 시간순 조회
BaropotChatMessageSchema.index({ senderId: 1, timestamp: -1 }); // 사용자별 메시지 조회
BaropotChatMessageSchema.index({ messageId: 1 }); // 메시지 ID 조회
BaropotChatMessageSchema.index({ 'readBy.userId': 1 }); // 읽음 처리 조회
