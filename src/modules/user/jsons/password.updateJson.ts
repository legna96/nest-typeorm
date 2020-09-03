import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RestartPasswordJson {

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    newPassword: string;
}