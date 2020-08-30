import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  ParseIntPipe,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { User } from './entitys/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../role/decorators/role.decorator';
import { RoleGuard } from '../role/guards/role.guard';

@Controller('users')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get(':id')
  @UseGuards(AuthGuard())
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this._userService.get(id);
    return user;
  }
  
  @Get()
  @UseGuards(AuthGuard())
  async getUsers(): Promise<User[]> {
    const users = await this._userService.getAll();
    return users;
  }
  
  @Post()
  @Roles('ADMINISTRATOR')
  @UseGuards(AuthGuard(), RoleGuard)
  async createUser(@Body() user: UserDto): Promise<User> {
    const createdUser = await this._userService.create(user);
    return createdUser;
  }

  @Put(':id')
  @Roles('ADMINISTRATOR')
  @UseGuards(AuthGuard(), RoleGuard)
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() user: User) {
    const updatedUser = await this._userService.update(id, user);
    return true;
  }

  @Delete(':id')
  @Roles('ADMINISTRATOR')
  @UseGuards(AuthGuard(), RoleGuard)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this._userService.delete(id);
    return true;
  }

  @Post('setRole/:userId/:roleId')
  @Roles('ADMINISTRATOR')
  @UseGuards(AuthGuard(), RoleGuard)
  async setRoleToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this._userService.setRoleToUser(userId, roleId);
  }
}
