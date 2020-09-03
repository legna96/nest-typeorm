import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class UserCreateJson {

  @IsNotEmpty()
  @IsString()
  username: string;
  
  @IsNotEmpty()
  @IsEmail()
  email: string;
  
  @IsNotEmpty()
  @IsString()
  password: string;
}
