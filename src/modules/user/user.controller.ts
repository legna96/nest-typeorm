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
import { UserCreateJson, UserUpdateJson, EmailUpdateJson, RestartPasswordJson, ProfileUpdateJson } from './jsons';
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
  @Get(':id')
  async getUserById (
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
    ) {
    const user = await this._userService.get(id, Configuration.ACTIVE);
    return res.status(HttpStatus.OK).json({
      user
    });
  }
   
   /**
    * obtiene usuario por id y status
    * @param id 
    * @param status 
    * @param res 
    */
   @Get('/:id/status/:status')
   async getUserByIdAndStatus(
     @Param('id', ParseIntPipe) id: number, 
     @Param('status') status: string,
     @Res() res: Response ) {
       const user = await this._userService.get(id, status);
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

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() userUpdateJson: UserUpdateJson,
    @Res() res: Response
  ) {
    const updateUser = await this._userService.update(userUpdateJson, id);
    return res.status(HttpStatus.OK).json({
      updateUser
    })
  }

  @Put('/email/:id')
  @UsePipes(ValidationPipe)
  async updateUserEmail(
    @Param('id', ParseIntPipe) id: number,
    @Body() emailUpdateJson: EmailUpdateJson,
    @Res() res: Response
  ) {
    const updateUser = await this._userService.updateEmail(emailUpdateJson, id);
    return res.status(HttpStatus.OK).json({
      updateUser
    })
  }

  @Put('/restart/password')
  @UsePipes(ValidationPipe)
  async restarPassword (
    @Body() restartPasswordJson: RestartPasswordJson,
    @Res() res: Response
  ) {
    const updateUser = await this._userService.restartPassword(restartPasswordJson);
    return res.status(HttpStatus.OK).json({
      updateUser
    });
  }
  
  @Put('/profile/:id')
  async updateProfile (
    @Param('id', ParseIntPipe) id: number,
    @Body() profileUpdateJson: ProfileUpdateJson,
    @Res() res: Response
  ) {
    const updateUser = await this._userService.updateProfile(profileUpdateJson, id);
    return res.status(HttpStatus.OK).json({
      updateUser
    });
  }

   /**
   * Cambia el estado del usuario a INACTIVO
   * @param id 
   */
  @Delete(':id')
  async deleteRole(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response ) {
      const usuarioJson = {status: Configuration.INACTIVE, username: null};
      const updateUser = await this._userService.update(usuarioJson, id);
      return res.status(HttpStatus.OK).json({
        updateUser
      })
  }
  
  /**
   * Elimina en memoria el usuario pasado por id
   * @param id 
   */
  @Delete('/drop/:id')
  async dropRole(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response) {
    await this._userService.delete(id);
    return res.status(HttpStatus.OK).json({
      deleted: true
    });
  }

  @Post('setRole/:userId/:roleId')
  async setRoleToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
    @Res () res: Response
  ) {
    const updateUser = await this._userService.setRoleToUser(userId, roleId);
    return res.status(HttpStatus.OK).json({
      updateUser
    })
  }

  @Post('unsetRole/:userId/:roleId')
  async unsetRoleToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
    @Res () res: Response
  ) {
    const updateUser = await this._userService.unsetRoleToUser(userId, roleId);
    return res.status(HttpStatus.OK).json({
      updateUser
    })
  }
}
