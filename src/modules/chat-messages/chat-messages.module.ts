import { Module } from '@nestjs/common';
import { ChatMessagesService } from './chat-messages.service';
import { ChatMessagesRepository } from './chat-messages.repository';
import { ChatMessagesGateway } from './chat-messages.gateway';

@Module({
    providers: [ChatMessagesService, ChatMessagesRepository, ChatMessagesGateway],
    exports: [ChatMessagesService],
})
export class ChatMessagesModule {}
