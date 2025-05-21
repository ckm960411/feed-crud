import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feed } from 'src/entities/feed.entity';
import { FeedComment } from 'src/entities/comment.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feed, FeedComment, User])],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
