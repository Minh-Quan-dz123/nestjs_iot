import {IsOptional, IsString} from 'class-validator'

export class CreateProfileDto{

    @IsOptional()
    @IsString()
    bio?:string;

    @IsOptional()
    @IsString()
    avatar?: string;
}