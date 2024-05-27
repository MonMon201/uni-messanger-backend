import { Module } from '@nestjs/common';
import { ChatMessagesService } from './chat-messages.service';
import { ChatMessagesRepository } from './chat-messages.repository';
import { ChatMessagesGateway } from './chat-messages.gateway';
import { ChatMessagesController } from './chat-messages.controller';

@Module({
    controllers: [ChatMessagesController],
    providers: [ChatMessagesService, ChatMessagesRepository, ChatMessagesGateway],
    exports: [ChatMessagesService, ChatMessagesRepository],
})
export class ChatMessagesModule {}
