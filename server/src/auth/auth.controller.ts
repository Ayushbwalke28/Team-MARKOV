import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    // req.user is set by the LocalStrategy
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    return this.authService.me(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Request() req, @Body() body: RefreshDto) {
    return this.authService.refresh(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, body);
  }
}
