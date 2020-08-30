import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { RoleUpdateJson, RoleCreateJson } from './jsons';
import { Configuration } from 'src/config/config.keys';
import * as Utils from '../../utils/helpers';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleRepository)
    private readonly _roleRepository: RoleRepository,
  ) {}

  /**
   * regresa si existe el role correspondiente al id y status
   * mandados por parametros
   * @param id 
   * @param status 
   */
  async get(id: number, status: string): Promise<Role> {

    if (!id || !status) {
      throw new BadRequestException('all params must be sent');
    }

    if (status !== Configuration.ACTIVE && status !== Configuration.INACTIVE) {
      throw new BadRequestException('status must be status valid');
    }

    const role: Role = await this._roleRepository.findOne(id, {
      where: { status },
    });

    if (!role) {
      throw new NotFoundException(`not found role ${status} with id = ${id}`);
    }

    return role;
  }

  /**
   * regresa todos los roles segun sea el status
   * mandado como parametro
   * @param status 
   */
  async getAll(status: string): Promise<Role[]> {
    
    if (!status) {
      throw new BadRequestException('all params must be sent');
    }

    if (status !== Configuration.ACTIVE && status !== Configuration.INACTIVE) {
      throw new BadRequestException('status must be status valid');
    }
    
    const roles: Role[] = await this._roleRepository.find({
      where: { status },
    });

    return roles;
  }

  /**
   * Crea un nuevo rol no existente en los registros
   * @param roleJson 
   */
  async create(roleJson: RoleCreateJson): Promise<Role> {

    const {name, description} = roleJson;
    const roleExists = await this._roleRepository.findOne({ where: {name}});

    if (roleExists) {      
      throw new ConflictException("name role already exists");
    }

    const role = new Role();
    role.name = name;
    role.description = description;

    return await role.save();
  }

  /**
   * Actualiza el role correspondiente al id pasado
   * puede actualizar el body completo del objeto y tambien un partial del json
   * mandado en el request 
   * @param id 
   * @param roleJson 
   */
  async update(id: number, roleJson: RoleUpdateJson): Promise<Role> {

    const {name, description, status} = roleJson;

    if (!id || !roleJson ||Object.keys(roleJson).length === 0) {
      throw new BadRequestException('all params must be sent');
    }

    if (status &&
       (status !== Configuration.ACTIVE && status !== Configuration.INACTIVE)
      ) {
      throw new BadRequestException('status must be status valid');
    }

    const roleExists = await this._roleRepository.findOne(id);
    
    if (!roleExists) {      
      throw new NotFoundException(`role with id=${id} not exists`);
    }

    Utils.SetearCamposObjetoJsonUpdate(roleExists, roleJson);
    roleExists.updatedAt = new Date();
    
    await this._roleRepository.update(id, roleExists);
    return roleExists;
  }

  /**
   * Elimina en memoria el role
   * correspondiente al id mandado
   * @param id 
   */
  async delete(id: number): Promise<void> {

    if (!id) {
      throw new BadRequestException('all params must be sent');
    }

    const roleExists = await this._roleRepository.findOne(id);

    if (!roleExists) {
      throw new NotFoundException(`role with id=${id} not exists`);
    }

    await this._roleRepository.delete(id);
  }
}
