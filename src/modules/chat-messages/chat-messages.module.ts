import { Module } from '@nestjs/common';
import { ChatMessagesService } from './chat-messages.service';
import { ChatMessagesRepository } from './chat-messages.repository';
import { ChatMessagesGateway } from './chat-messages.gateway';
import { ChatMessagesController } from './chat-messages.controller';
import { ChatUsersModule } from '../chat-users/chat-users.module';

@Module({
    controllers: [ChatMessagesController],
    imports: [ChatUsersModule],
    providers: [ChatMessagesService, ChatMessagesRepository, ChatMessagesGateway],
    exports: [ChatMessagesService, ChatMessagesRepository],
})
export class ChatMessagesModule {}
