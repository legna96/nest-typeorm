import { RoleType } from '../role/roletype.enum';
import { UserDetails } from '../user/entitys/user.details.entity';

export interface IJwtPayload {
  id: number;
  username: string;
  email: string;
  roles: RoleType[];
  iat?: Date;
  details: {
    id: number,
    name: string,
    lastname: string
  };
}
