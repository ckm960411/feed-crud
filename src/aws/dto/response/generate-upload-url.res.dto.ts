import { ApiProperty } from '@nestjs/swagger';

export class GenerateUploadUrlResDto {
  @ApiProperty({
    description:
      '사전인증된 URL, 이 주소로 S3에 파일업로드 PUT 요청을 보냅니다.',
    example: 'https://s3.amazonaws.com/my-bucket/my-file.jpg',
  })
  presignedUrl: string;

  @ApiProperty({
    description: '파일 키',
    example: 'uploads/my-file.jpg',
  })
  key: string;

  @ApiProperty({
    description: '이미지 업로드가 완료되었을 때 사용가능한 이미지 URL입니다.',
    example: 'https://s3.amazonaws.com/my-bucket/my-file.jpg',
  })
  url: string;
}
