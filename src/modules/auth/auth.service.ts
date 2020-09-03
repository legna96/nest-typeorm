import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { SignupDto, SigninDto } from './dto';
import { User } from '../user/entitys/user.entity';
import { compare } from 'bcryptjs';
import { IJwtPayload } from './jwt-payload.interface';
import { RoleType } from '../role/roletype.enum';
import { Configuration } from 'src/config/config.keys';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthRepository)
    private readonly _authRepository: AuthRepository,
    private readonly _jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<User> {
    const { username, email } = signupDto;
    const userExists = await this._authRepository.findOne({
      where: [{ username }, { email }],
    });

    if (userExists) {
      throw new ConflictException('username or email already exists');
    }
    const newUser = await this._authRepository.signup(signupDto);
    return  newUser;
  }

  async signin(signinDto: SigninDto): Promise<{token: string, payload: object}> {
    const { username, password, email } = signinDto;
    let user: User;

    if (username && email) {
      user = await this._authRepository.findOne({
        where: { email },
      });
    }

    else if (username) {
      user = await this._authRepository.findOne({
        where: { username },
      });
    }

    else if(email) {
      user = await this._authRepository.findOne({
        where: { email },
      });
    }
    
    else {
      throw new BadRequestException('username or email is required');
    }

    if (!user) {
      throw new NotFoundException('user does not exist');
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('invalid credentials');
    }

    // si las credenciales son las correctas y la cuenta esta inactiva, se reactiva la cuenta
    if (user.status === Configuration.INACTIVE) {
      user.status = Configuration.ACTIVE;
      await this._authRepository.save(user);
    }

    const payload: IJwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles.map(r => r.name as RoleType),
      details: {...user.details}
    };

    const token: string = await this._jwtService.sign(payload);

    return { token, payload };
  }
}
