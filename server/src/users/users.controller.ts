import { Body, Controller, HttpCode, HttpStatus, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { MediaService } from '../media/media.service';
import { SetOwnsCompanyDto } from './dto/set-owns-company.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mediaService: MediaService,
  ) {}

  /**
   * PATCH /users/me/owns-company
   *
   * Grants or revokes the `company_owner` role on the authenticated user.
   * The user must be verified to become a company owner.
   */
  @UseGuards(JwtAuthGuard)
  @Patch('me/owns-company')
  @HttpCode(HttpStatus.OK)
  async setOwnsCompany(@Req() req: any, @Body() body: SetOwnsCompanyDto) {
    await this.usersService.setOwnsCompany(req.user.userId, body.ownsCompany);
    const updated = await this.usersService.findByIdWithRoles(req.user.userId);
    return { user: this.usersService.toPublicUser(updated!) };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const result = await this.mediaService.uploadImage(file);
    await this.usersService.setAvatar(req.user.userId, result.secure_url);
    const updated = await this.usersService.findByIdWithRoles(req.user.userId);
    return { user: this.usersService.toPublicUser(updated!), avatarUrl: result.secure_url };
  }
}
