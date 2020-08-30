import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class RoleUpdateJson {

  @IsString()
  name: string;
  
  @IsString()
  description: string;
  
  @IsString()
  status: string;
}
