import { Controller } from "@nestjs/common";
import { EventPattern, Payload, Ctx, MqttContext } from "@nestjs/microservices";

import { MqttService } from "./mqtt.service";

@Controller()
export class MqttEventsController 
{
    constructor(private readonly mqttService: MqttService) {}

    @EventPattern('iot/week6/garden1/telemetry')
    handleTelemetry(
        @Payload() payload: unknown,
        @Ctx() context: MqttContext, // giống @Body() trong HTTP
    ): void {
        const topic = context.getTopic(); // hàm có sẵn
        this.mqttService.handleTelemetry(payload, topic);
    }
}