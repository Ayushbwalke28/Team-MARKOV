import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/profile.dto';
import { MediaService } from '../media/media.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private profileService: ProfileService,
    private mediaService: MediaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return this.profileService.getMe(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() body: UpdateProfileDto) {
    return this.profileService.updateMe(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    const result = await this.mediaService.uploadImage(file);
    return this.profileService.updateAvatar(req.user.userId, result.secure_url);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/toggle-role')
  async toggleRole(@Req() req: any, @Body('role') role: 'candidate' | 'company_owner') {
    if (!['candidate', 'company_owner'].includes(role)) {
      throw new BadRequestException('Invalid role specified');
    }
    return this.profileService.toggleRole(req.user.userId, role);
  }
}

