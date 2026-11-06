import {IsIn, IsInt, Min} from 'class-validator'; 

export class LedCommandDto
{
    @IsInt()
    @Min(0)
    gardenId!:number;

    @IsIn(['red', 'yellow', 'green'])
    led!: 'red' | 'yellow' | 'green';

    @IsIn(['ON', 'OFF'])
    state!: 'ON'|'OFF';
}