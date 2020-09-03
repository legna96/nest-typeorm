import { IsEmail, IsNotEmpty } from "class-validator";

export class EmailUpdateJson {

    @IsNotEmpty()
    @IsEmail()
    email: string;
}