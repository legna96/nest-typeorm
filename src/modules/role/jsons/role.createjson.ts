import { IsNotEmpty, IsString } from 'class-validator';

export class RoleCreateJson {
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsNotEmpty()
  @IsString()
  description: string;
}
