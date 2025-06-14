import { Module } from '@nestjs/common';
import { AwsController } from './aws.controller';
import { AwsService } from './aws.service';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  controllers: [AwsController],
  providers: [AwsService, S3Client],
})
export class AwsModule {}
