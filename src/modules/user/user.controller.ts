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
  Res,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreateJson } from './jsons/user.createJson';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../role/decorators/role.decorator';
import { RoleGuard } from '../role/guards/role.guard';
import { Configuration } from 'src/config/config.keys';
import { Response } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  /**
    * obtiene usuario por id con estado activo
    * @param id 
    * @param res 
    */
  @Get(':username')
  async getUserById (
    @Param('username', ParseIntPipe) username: string,
    @Res() res: Response
    ) {
    const user = await this._userService.get(username, Configuration.ACTIVE);
    return res.status(HttpStatus.OK).json({
      user
    });
  }
   
   /**
    * obtiene usuario por username y status
    * @param username 
    * @param status 
    * @param res 
    */
   @Get('/:username/status/:status')
   async getUserByIdAndStatus(
     @Param('username') username: string, 
     @Param('status') status: string,
     @Res() res: Response ) {
       const user = await this._userService.get(username, status);
       return res.status(HttpStatus.OK).json({
         user
       });
   }

   /**
    * obtiene todos los usuarios con estado activo 
    * @param res 
    */
  @Get()
  async getUsers(@Res() res: Response) {
    const users = await this._userService.getAll(Configuration.ACTIVE);
    return res.status(HttpStatus.OK).json({
      users,
      total: users.length
    });
  }

  
  /**
   * obtiene todos los usuarios por status
   * @param status 
   * @param res 
   */
  @Get('/status/:status')
  @UseGuards(AuthGuard(), RoleGuard)
  async getUsersByStatus(
    @Param('status') status: string,
    @Res() res: Response ) {
      const users = await this._userService.getAll(status);
      return res.status(HttpStatus.OK).json({
        users,
        total: users.length
      }) 
  }
  
  /**
   * Crea un nuevo Usuario
   * @param user 
   * @param res 
   */
  @Post()
  @UsePipes(ValidationPipe)
  async createUser(
    @Body() user: UserCreateJson,
    @Res() res: Response ) {
    const newUser = await this._userService.create(user);
    return res.status(HttpStatus.CREATED).json({
      newUser
    }) 
  }

  // @Delete(':id')
  // async deleteUser(@Param('id', ParseIntPipe) id: number) {
  //   await this._userService.delete(id);
  //   return true;
  // }

  @Post('setRole/:userId/:roleId')
  async setRoleToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this._userService.setRoleToUser(userId, roleId);
  }
}
