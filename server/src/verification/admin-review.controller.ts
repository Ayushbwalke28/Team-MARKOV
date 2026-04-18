import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminReviewService } from './admin-review.service';
import { ReviewDecisionDto } from './dto/review-decision.dto';

@Controller('verify/admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminReviewController {
  constructor(private readonly adminReviewService: AdminReviewService) {}

  /**
   * GET /api/verify/admin/queue — List pending manual reviews.
   */
  @Get('queue')
  async getQueue(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminReviewService.getQueue({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * GET /api/verify/admin/queue/:reviewId — Get review detail.
   */
  @Get('queue/:reviewId')
  async getReviewDetail(@Param('reviewId') reviewId: string) {
    return this.adminReviewService.getReviewDetail(reviewId);
  }

  /**
   * PATCH /api/verify/admin/queue/:reviewId — Submit decision.
   */
  @Patch('queue/:reviewId')
  async submitDecision(
    @Req() req: any,
    @Param('reviewId') reviewId: string,
    @Body() body: ReviewDecisionDto,
  ) {
    return this.adminReviewService.submitDecision(
      reviewId,
      req.user.userId,
      body.decision as 'approved' | 'rejected',
      body.notes,
    );
  }

  /**
   * GET /api/verify/admin/audit-log — View audit log.
   */
  @Get('audit-log')
  async getAuditLog(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminReviewService.getAuditLog({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
