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
import { User } from 'src/auth/decorators/user.decorator';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createFeed(@Body() body: { content: string }, @User('id') userId: number) {
    return this.feedService.createFeed(userId, body.content);
  }

  @Get()
  findAllFeeds() {
    return this.feedService.getFeeds();
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
    @User('id') userId: number,
  ) {
    return this.feedService.updateFeed(userId, id, body.content);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteFeed(@Param('id') id: number, @User('id') userId: number) {
    return this.feedService.deleteFeed(userId, id);
  }

  @Post(':id/comment')
  @UseGuards(JwtAuthGuard)
  createComment(
    @Param('id') id: number,
    @Body() body: { content: string },
    @User('id') userId: number,
  ) {
    return this.feedService.createComment(userId, id, body.content);
  }

  @Patch('comment/:commentId')
  @UseGuards(JwtAuthGuard)
  updateComment(
    @Param('commentId') commentId: number,
    @Body() body: { content: string },
    @User('id') userId: number,
  ) {
    return this.feedService.updateComment(userId, commentId, body.content);
  }

  @Delete('comment/:commentId')
  @UseGuards(JwtAuthGuard)
  deleteComment(
    @Param('commentId') commentId: number,
    @User('id') userId: number,
  ) {
    return this.feedService.deleteComment(userId, commentId);
  }
}
