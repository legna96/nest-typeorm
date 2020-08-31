import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entitys/user.entity';
import { UserDetails } from './entitys/user.details.entity';
import { RoleRepository } from '../role/role.repository';
import { genSalt, hash } from 'bcryptjs';
import { UserCreateJson } from './jsons/user.createJson';
import { Configuration } from 'src/config/config.keys';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly _userRepository: UserRepository,
    @InjectRepository(RoleRepository)
    private readonly _roleRepository: RoleRepository,
  ) {}

  async get(username: string, status: string): Promise<User> {
    
    if (!username || !status) {
      throw new BadRequestException('all params must be sent');
    }

    if (status !== Configuration.ACTIVE && status !== Configuration.INACTIVE) {
      throw new BadRequestException('status must be status valid');
    }

    const user: User = await this._userRepository.findOne(username, {
      where: { status }
    });

    if (!user) {
      throw new NotFoundException(`not found ${username} ${status}`);
    }

    return user;
  }

  async getAll(status: string): Promise<User[]> {

    if (!status) {
      throw new BadRequestException('all params must be sent');
    }

    if (status !== Configuration.ACTIVE && status !== Configuration.INACTIVE) {
      throw new BadRequestException('status must be status valid');
    }

    const users: User[] = await this._userRepository.find({
      where: { status }
    });

    return users;
  }

  async create(userjson: UserCreateJson): Promise<User> {
    
    const { email, password, username } = userjson;
    const userExists = await this._userRepository.findOne({
      where: [{ username }, { email }],
    });
    
    if (userExists) {
      throw new ConflictException('username or email already exists');
    }
    
    const user = new User();
    const salt = await genSalt(10);
    const details = new UserDetails();
    const defaultRole = await this._roleRepository.findOne({ where: { name: 'GENERAL' } });

    user.email = email;
    user.username = username;
    user.password = await hash(password, salt);
    user.details = details;
    user.roles = [defaultRole];
    return await user.save();
  }


  async setRoleToUser(userId: number, roleId: number) {
    const userExist = await this._userRepository.findOne(userId, {
      where: { status: Configuration.ACTIVE },
    });

    if (!userExist) {
      throw new NotFoundException();
    }

    const roleExist = await this._roleRepository.findOne(roleId, {
      where: { status: Configuration.ACTIVE },
    });

    if (!roleExist) {
      throw new NotFoundException('Role does not exist');
    }

    userExist.roles.push(roleExist);
    await this._userRepository.save(userExist);

    return true;
  }
}
