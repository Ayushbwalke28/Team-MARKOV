import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostService } from './post.service';
import { MediaService } from '../media/media.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly mediaService: MediaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.postService.create(req.user.userId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postService.update(id, req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.postService.remove(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  @HttpCode(HttpStatus.CREATED)
  like(@Param('id') id: string, @Req() req: any) {
    return this.postService.like(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  unlike(@Param('id') id: string, @Req() req: any) {
    return this.postService.unlike(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  addComment(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postService.addComment(id, req.user.userId, dto);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.postService.getComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  removeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Req() req: any,
  ) {
    return this.postService.removeComment(id, commentId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/media')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @Param('id') id: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.mediaService.uploadImage(file);
    return this.postService.setMediaUrl(id, req.user.userId, result.secure_url);
  }
}
