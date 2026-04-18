import { Body, Controller, HttpCode, HttpStatus, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { SetOwnsCompanyDto } from './dto/set-owns-company.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
