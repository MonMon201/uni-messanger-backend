import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsRepository } from './chats.repository';
import { ChatUsersModule } from '../chat-users/chat-users.module';
import { ChatMessagesModule } from '../chat-messages/chat-messages.module';
import { ChatsController } from './chats.controller';

@Module({
    imports: [ChatUsersModule, ChatMessagesModule],
    providers: [ChatsService, ChatsRepository],
    exports: [ChatsService, ChatsRepository],
    controllers: [ChatsController],
})
export class ChatsModule {}
