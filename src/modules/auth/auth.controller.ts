import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { SignupDto, SigninDto } from './dto';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  /**
   * registrar
   * @param signupDto 
   * @param res 
   */
  @Post('/signup')
  @UsePipes(ValidationPipe)
  async signup(@Body() signupDto: SignupDto, @Res() res: Response) {
    const newUser = await this._authService.signup(signupDto);
    return res.status(HttpStatus.CREATED).json({
      newUser
    });
  }

  /**
   * Login
   * @param signinDto 
   * @param res 
   */
  @Post('/signin')
  async signin(
    @Body() signinDto: SigninDto,
    @Res() res: Response ) {
      const {token,payload} = await this._authService.signin(signinDto);
      return res.status(HttpStatus.OK).json({
        token,
        user: payload
      });
  }
}
