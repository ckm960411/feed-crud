import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedComment } from 'src/entities/comment.entity';
import { Feed } from 'src/entities/feed.entity';
import { Like } from 'src/entities/like.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    @InjectRepository(FeedComment)
    private readonly commentRepository: Repository<FeedComment>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  async createFeed(userId: number, content: string) {
    if (!content.trim()) {
      throw new BadRequestException('내용을 입력해주세요.');
    }

    return this.feedRepository.save({
      content,
      userId,
    });
  }

  async getFeeds(userId?: number) {
    const feeds = await this.feedRepository.find({
      relations: {
        user: true,
        comments: {
          user: true,
        },
        likes: true,
      },
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        },
        comments: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          user: {
            id: true,
            name: true,
            email: true,
          },
        },
        likes: {
          id: true,
          userId: true,
        },
      },
    });

    return feeds.map((feed) => ({
      ...feed,
      likeCount: feed.likes.length,
      isLiked: feed.likes.some((like) => like.userId === userId),
    }));
  }

  async getFeedById(feedId: number) {
    const feed = await this.feedRepository.findOne({
      where: {
        id: feedId,
      },
      relations: {
        user: true,
      },
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
    });
    if (!feed) {
      throw new NotFoundException('일치하는 피드가 없습니다.');
    }
    return feed;
  }

  async updateFeed(userId: number, feedId: number, content: string) {
    const feed = await this.getFeedById(feedId);
    if (feed.userId !== userId) {
      throw new ForbiddenException('수정할 권한이 없습니다.');
    }

    await this.feedRepository.update(feedId, {
      content,
    });

    return this.getFeedById(feedId);
  }

  async deleteFeed(userId: number, feedId: number) {
    const feed = await this.getFeedById(feedId);

    if (feed.userId !== userId) {
      throw new ForbiddenException('삭제할 권한이 없습니다.');
    }

    await this.feedRepository.delete(feedId);

    return feedId;
  }

  async createComment(userId: number, feedId: number, content: string) {
    const feed = await this.getFeedById(feedId);

    return this.commentRepository.save({
      content,
      userId,
      feedId: feed.id,
    });
  }

  async updateComment(userId: number, commentId: number, content: string) {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (comment.userId !== userId) {
      throw new ForbiddenException('수정할 권한이 없습니다.');
    }

    await this.commentRepository.update(commentId, {
      content,
    });

    return true;
  }

  async deleteComment(userId: number, commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (comment.userId !== userId) {
      throw new ForbiddenException('삭제할 권한이 없습니다.');
    }

    await this.commentRepository.delete(commentId);
  }

  async likeFeed(userId: number, feedId: number) {
    await this.getFeedById(feedId);

    const existingLike = await this.likeRepository.findOne({
      where: {
        userId,
        feedId,
      },
    });

    if (existingLike) {
      throw new BadRequestException('이미 좋아요를 누른 피드입니다.');
    }

    await this.likeRepository.save({
      userId,
      feedId,
    });

    return { message: '좋아요가 완료되었습니다.' };
  }

  async unlikeFeed(userId: number, feedId: number) {
    await this.getFeedById(feedId);

    const existingLike = await this.likeRepository.findOne({
      where: {
        userId,
        feedId,
      },
    });

    if (!existingLike) {
      throw new BadRequestException('좋아요를 누르지 않은 피드입니다.');
    }

    await this.likeRepository.delete(existingLike.id);

    return { message: '좋아요가 취소되었습니다.' };
  }
}
