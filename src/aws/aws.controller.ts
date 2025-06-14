import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AwsService } from './aws.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GenerateUploadUrlReqDto } from './dto/request/generate-upload-url.req.dto';
import { GenerateUploadUrlResDto } from './dto/response/generate-upload-url.res.dto';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';

@ApiTags('AWS')
@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post('presigned-url')
  @ApiOperation({
    summary: '이미지 업로드용 presigned URL 발급',
    description:
      '프론트엔드에서 직접 AWS S3에 이미지를 업로드하기 위해서 사전인증된 URL을 요청하는 API입니다. 요청 body는 GenerateUploadUrlReqDto를 참고하세요.',
  })
  @ApiResponse({
    status: 200,
    description: '이미지 업로드용 presigned URL 발급 성공',
    type: GenerateUploadUrlResDto,
  })
  @UseGuards(JwtAuthGuard)
  async getPresignedUrl(
    @Body() dto: GenerateUploadUrlReqDto,
  ): Promise<GenerateUploadUrlResDto> {
    return await this.awsService.generateUploadURL(dto?.extension ?? 'webp');
  }
}
