
import {Body,Controller,HttpCode,Post,UseGuards} from '@nestjs/common';

import { MqttService } from './mqtt.service';
import { LedCommandDto } from './dto/led-cpmmand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('iot')
@UseGuards(JwtAuthGuard)
export class MqttHttpController 
{
    constructor(private readonly mqttService: MqttService) {}

    @Post('led')
    @HttpCode(200)
    setLed(@Body() dto: LedCommandDto)
    {
        return this.mqttService.publishLed(dto);
    }
}