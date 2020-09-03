import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository } from './repositorys/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entitys/user.entity';
import { UserDetails } from './entitys/user.details.entity';
import { RoleRepository } from '../role/role.repository';
import { genSalt, hash } from 'bcryptjs';
import { Configuration } from 'src/config/config.keys';
import { UserCreateJson, UserUpdateJson, EmailUpdateJson, RestartPasswordJson, ProfileUpdateJson } from './jsons';
import * as Utils from '../../utils/helpers';
import { RoleType } from '../role/roletype.enum';
import { UserDetailsRepository } from './repositorys/userdetails.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly _userRepository: UserRepository,
    @InjectRepository(RoleRepository)
    private readonly _roleRepository: RoleRepository,
    @InjectRepository(UserDetails)
    private readonly _userDetailRepository: UserDetailsRepository,
  ) {}

  async get(id: number, status: string): Promise<User> {
    
    if (!id || !status) {
      throw new BadRequestException('all params must be sent');
    }

    if (status !== Configuration.ACTIVE && status !== Configuration.INACTIVE) {
      throw new BadRequestException('status must be status valid');
    }

    const user: User = await this._userRepository.findOne(id, {
      where: { status }
    });

    if (!user) {
      throw new NotFoundException(`not found user ${status}`);
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
    const defaultRole = await this._roleRepository.findOne({ where: { name: RoleType.GENERAL } });
    
    user.email = email;
    user.username = username;
    user.password = await hash(password, salt);
    user.details = details;
    user.roles = [defaultRole];
    return await user.save();
  }

  async update(userUpdateJson: UserUpdateJson, id: number): Promise<User> {

    userUpdateJson = Utils.OnlyRequestFields(userUpdateJson, ["username", "status"]);
    
    if (!id || !userUpdateJson || Object.keys(userUpdateJson).length === 0) {
      throw new BadRequestException('all params must be sent');
    }

    const { status } = userUpdateJson;

    if (status && status !== Configuration.ACTIVE && status !== Configuration.INACTIVE) {
      throw new BadRequestException('status must be status valid');
    }

    const userExists = await this._userRepository.findOne(id);
    
    if (!userExists) {      
      throw new NotFoundException(`user not exists`);
    }

    Utils.SetearCamposObjetoJsonUpdate(userExists, userUpdateJson);
    userExists.updatedAt = new Date();

    await this._userRepository.save(userExists);    
    return userExists
  }


  async updateEmail(emailUpdateJson: EmailUpdateJson, id: number): Promise<User> {
  
    const {email} = emailUpdateJson;

    if (!id || !email) {
      throw new BadRequestException('all params must be sent');
    }

    const userExists = await this._userRepository.findOne(id, {
      where: [{status: Configuration.ACTIVE}]
    });
    
    if (!userExists) {      
      throw new NotFoundException(`user not exists`);
    }
    
    const userEmailExists = await this._userRepository.findOne(
      {where: [{email}, {status: Configuration.ACTIVE}]
    });
    
    if (userEmailExists && userExists.id !== userEmailExists.id) {      
      throw new ConflictException(`user with ${email} already exists`);
    }

    userExists.email = email;
    userExists.updatedAt = new Date();
   
    await this._userRepository.save(userExists);
    
    return userExists
  }

  async restartPassword(restartJson: RestartPasswordJson): Promise<User> {
  
    const {email, newPassword} = restartJson;

    const userEmailExists = await this._userRepository.findOne({
      where: [{email}]
    });
    
    if (!userEmailExists) {      
      throw new NotFoundException(`user with ${email} not exists`);
    }

    const salt = await genSalt(10);
    userEmailExists.password = await hash(newPassword, salt);
    userEmailExists.status = Configuration.ACTIVE;
    userEmailExists.updatedAt = new Date();
   
    await this._userRepository.save(userEmailExists);
    return userEmailExists
  }

  async updateProfile(profileUpdateJson: ProfileUpdateJson, id: number): Promise<User> {
    
    profileUpdateJson = Utils.OnlyRequestFields(profileUpdateJson, ["name", "lastname"]);
    
    if (!id || !profileUpdateJson || Object.keys(profileUpdateJson).length === 0) {
      throw new BadRequestException('all params must be sent correctly');
    }

    const userExists = await this._userRepository.findOne(id);
    
    if (!userExists) {      
      throw new NotFoundException(`user not exists`);
    }

    const userDetailExists = await this._userDetailRepository.findOne(userExists.details.id);
    
    if (!userDetailExists || userExists.details.id !== userDetailExists.id) {      
      throw new NotFoundException(`details not exists`);
    }
    
    Utils.SetearCamposObjetoJsonUpdate(userDetailExists, profileUpdateJson);
    
    userExists.details = userDetailExists;
    userExists.updatedAt = new Date();
    await this._userRepository.save(userExists);

    return userExists
  }

  async setRoleToUser(userId: number, roleId: number): Promise<User> {
    const userExist = await this._userRepository.findOne(userId, {
      where: { status: Configuration.ACTIVE },
    });

    if (!userExist) {
      throw new NotFoundException(`user not exists`);
    }

    const roleExist = await this._roleRepository.findOne(roleId, {
      where: { status: Configuration.ACTIVE },
    });

    if (!roleExist) {
      throw new NotFoundException('Role not exists');
    }

    if (userExist.roles.includes(roleExist)) {
      throw new ConflictException(`user has ${roleExist}`)
    }

    userExist.roles.push(roleExist);
    await this._userRepository.save(userExist);

    return userExist;
  }

  async unsetRoleToUser(userId: number, roleId: number): Promise<User> {
    const userExist = await this._userRepository.findOne(userId, {
      where: { status: Configuration.ACTIVE },
    });

    if (!userExist) {
      throw new NotFoundException(`user not exists`);
    }

    const roleExist = await this._roleRepository.findOne(roleId, {
      where: { status: Configuration.ACTIVE },
    });

    if (!roleExist) {
      throw new NotFoundException('Role not exists');
    }

    if (!userExist.roles.includes(roleExist)) {
      throw new ConflictException(`user not has ${roleExist}`)
    }

    userExist.roles = userExist.roles.filter(role => role !== roleExist);
    await this._userRepository.save(userExist);

    return userExist;
  }
}
