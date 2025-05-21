import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { OptionalJwtAuthGuard } from 'src/auth/strategies/optional-jwt-auth.guard';
import { User } from 'src/entities/user.entity';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createFeed(
    @Body() body: { content: string },
    @UserDecorator('id') userId: number,
  ) {
    return this.feedService.createFeed(userId, body.content);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAllFeeds(@UserDecorator() user: User | null) {
    return this.feedService.getFeeds(user?.id);
  }

  @Get(':id')
  findFeedById(@Param('id') id: number) {
    return this.feedService.getFeedById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateFeed(
    @Param('id') id: number,
    @Body() body: { content: string },
    @UserDecorator('id') userId: number,
  ) {
    return this.feedService.updateFeed(userId, id, body.content);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteFeed(@Param('id') id: number, @UserDecorator('id') userId: number) {
    return this.feedService.deleteFeed(userId, id);
  }

  @Post(':id/comment')
  @UseGuards(JwtAuthGuard)
  createComment(
    @Param('id') id: number,
    @Body() body: { content: string },
    @UserDecorator('id') userId: number,
  ) {
    return this.feedService.createComment(userId, id, body.content);
  }

  @Patch('comment/:commentId')
  @UseGuards(JwtAuthGuard)
  updateComment(
    @Param('commentId') commentId: number,
    @Body() body: { content: string },
    @UserDecorator('id') userId: number,
  ) {
    return this.feedService.updateComment(userId, commentId, body.content);
  }

  @Delete('comment/:commentId')
  @UseGuards(JwtAuthGuard)
  deleteComment(
    @Param('commentId') commentId: number,
    @UserDecorator('id') userId: number,
  ) {
    return this.feedService.deleteComment(userId, commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':feedId/like')
  async likeFeed(
    @UserDecorator('id') userId: number,
    @Param('feedId') feedId: number,
  ) {
    return this.feedService.likeFeed(userId, feedId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':feedId/like')
  async unlikeFeed(
    @UserDecorator('id') userId: number,
    @Param('feedId') feedId: number,
  ) {
    return this.feedService.unlikeFeed(userId, feedId);
  }
}
