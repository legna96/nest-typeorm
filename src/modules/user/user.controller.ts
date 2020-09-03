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
import { RoleType } from '../role/roletype.enum';

@Controller('users')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  /**
    * obtiene usuario por id con estado activo
    * @param id 
    * @param res 
    */
  @Get(':id')
  @Roles(RoleType.GENERAL)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
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
   @Roles(RoleType.GENERAL)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
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
  @Roles(RoleType.GENERAL)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
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
  @Roles(RoleType.GENERAL)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
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
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @UsePipes(ValidationPipe)
  async createUser(
    @Body() user: UserCreateJson,
    @Res() res: Response ) {
    const newUser = await this._userService.create(user);
    return res.status(HttpStatus.CREATED).json({
      newUser
    }) 
  }

  /**
   * actualiza usuario
   * @param id 
   * @param userUpdateJson 
   * @param res 
   */
  @Put(':id')
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
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

  /**
   * actualiza el email del usuario
   * @param id 
   * @param emailUpdateJson 
   * @param res 
   */
  @Put('/email/:id')
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
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

  /**
   * actualiza el password del usuario
   * dado un email
   * @param restartPasswordJson 
   * @param res 
   */
  @Put('/restart/password')
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
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
  
  /**
   * actualiza campo ó cuerpo completo
   * en los detalles del usuario
   * @param id 
   * @param profileUpdateJson 
   * @param res 
   */
  @Put('/profile/:id')
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
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
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
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
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async dropRole(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response) {
    await this._userService.delete(id);
    return res.status(HttpStatus.OK).json({
      deleted: true
    });
  }

  /**
   * agrega el rol por parametro 
   * a los roles que dispone el usuario  
   * @param userId 
   * @param roleId 
   * @param res 
   */
  @Post('setRole/:userId/:roleId')
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
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

  /**
   * quita el rol por parametro 
   * de los roles que dispone el usuario 
   * @param userId 
   * @param roleId 
   * @param res 
   */
  @Post('unsetRole/:userId/:roleId')
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
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
