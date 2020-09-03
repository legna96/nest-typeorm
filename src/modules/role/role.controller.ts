import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  Res,
  HttpStatus,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleGuard } from './guards/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './decorators/role.decorator';
import { RoleCreateJson, RoleUpdateJson } from './jsons';
import { Configuration } from 'src/config/config.keys';
import { Response } from 'express';
import { RoleType } from './roletype.enum';

@Controller('roles')
export class RoleController {
  constructor(private readonly _roleService: RoleService) {}

  /**
    * obtiene rol por id con estado activo
    * @param id 
    * @param res 
    */
  @Get(':id')
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard(), RoleGuard)
  async getByIdRole(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
    ) {
      const role = await this._roleService.get(id, Configuration.ACTIVE);
      return res.status(HttpStatus.OK).json({
        role
      })  
  }
  
  /**
   * obtiene rol por id y estado
   * @param id 
   * @param status 
   * @param res 
   */
  @Get('/:id/status/:status')
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard(), RoleGuard)
  async getByIdRoleAndStatus(
    @Param('id', ParseIntPipe) id: number, 
    @Param('status') status: string,
    @Res() res: Response ) {
      const role = await this._roleService.get(id, status);
      return res.status(HttpStatus.OK).json({
        role
      });
  }
  
  /**
   * obtiene todos los roles con estado activo 
   * @param res 
   */
  @Get()
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard(), RoleGuard)
  async getAllRoles(@Res() res: Response) {
    const roles = await this._roleService.getAll(Configuration.ACTIVE);
    return res.status(HttpStatus.OK).json({
      roles,
      total: roles.length
    })
  }
  
  /**
   * obtiene todos los roles por status
   * @param status 
   * @param res 
   */
  @Get('/status/:status')
  // @Roles(RoleType.ADMINISTRADOR)
  // @UseGuards(AuthGuard(), RoleGuard)
  async getAllRolesAndStatus(
    @Param('status') status: string,
    @Res() res: Response ) {
      const roles = await this._roleService.getAll(status);
      return res.status(HttpStatus.OK).json({
        roles,
        total: roles.length
      }) 
  }
  
  /**
   * Crea un nuevo Rol
   * @param roleJson 
   * @param res 
   */
  @Post()
  // @Roles(RoleType.ADMINISTRADOR)
  // @UseGuards(AuthGuard(), RoleGuard)
  @UsePipes(ValidationPipe)
  async createRole(
    @Body() roleJson: RoleCreateJson,
    @Res() res: Response) {
      const newRole = await this._roleService.create(roleJson);
      return res.status(HttpStatus.CREATED).json({
        newRole
      })
  }

  /**
   * actualiza rol dado el id y los campos del body pasado
   * en el request
   * @param id 
   * @param roleJson 
   * @param res 
   */
  @Put(':id')
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard(), RoleGuard)
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() roleJson: RoleUpdateJson,
    @Res() res: Response) {
    const updateRole = await this._roleService.update(id, roleJson);
    return res.status(HttpStatus.OK).json({
      updateRole
    })
  }

  /**
   * Cambia el estado del role a INACTIVO
   * @param id 
   */
  @Delete(':id')
  @Roles(RoleType.ADMINISTRADOR)
  @UseGuards(AuthGuard(), RoleGuard)
  async deleteRole(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response ) {
      const roleJson = {status: Configuration.INACTIVE, description: null, name: null };
      const updateRole = await this._roleService.update(id, roleJson);
      return res.status(HttpStatus.OK).json({
        updateRole
      })
  }
  
  /**
   * Elimina en memoria el rol pasado por id
   * @param id 
   */
  @Delete('/drop/:id')
  // @Roles(RoleType.ADMINISTRADOR)
  // @UseGuards(AuthGuard(), RoleGuard)
  async dropRole(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response) {
    await this._roleService.delete(id);
    return res.status(HttpStatus.OK).json({
      deleted: true
    });
  }
}
