import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class GenerateUploadUrlReqDto {
  @ApiProperty({
    description: '파일 확장자 (jpg, jpeg, png, gif, webp)',
    default: 'webp',
    example: 'webp',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^(jpg|jpeg|png|gif|webp)$/, {
    message: '지원하지 않는 파일 확장자입니다.',
  })
  extension?: string;
}
