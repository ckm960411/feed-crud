import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { GenerateUploadUrlResDto } from './dto/response/generate-upload-url.res.dto';

@Injectable()
export class AwsService {
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly s3Client: S3Client,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  // 파일 업로드 URL 생성 메서드
  async generateUploadURL(
    extension: string = 'jpg',
  ): Promise<GenerateUploadUrlResDto> {
    // 파일 확장자로부터 contentType 추론
    const contentType = this.getContentTypeFromExtension(extension);
    const fileName = `${uuidv4()}.${extension}`;
    const key = `uploads/${fileName}`;

    const presignedUrl = await this.createPresignedUrl(key, contentType);

    return {
      presignedUrl,
      key,
      url: `https://${this.configService.get('AWS_S3_BUCKET')}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`,
    };
  }

  private getContentTypeFromExtension(extension: string): string {
    const mimeTypeMap = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };

    const contentType = mimeTypeMap[extension.toLowerCase()];
    if (!contentType) {
      throw new Error('지원하지 않는 이미지 파일 형식입니다.');
    }

    return contentType;
  }

  private async createPresignedUrl(
    key: string,
    contentType: string,
  ): Promise<string> {
    if (!this.ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new Error('지원하지 않는 이미지 파일 형식입니다.');
    }

    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });
  }
}
