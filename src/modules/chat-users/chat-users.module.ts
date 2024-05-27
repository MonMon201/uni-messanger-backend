import { Global, Module } from '@nestjs/common';
import { ChatUsersService } from './chat-users.service';
import { ChatUsersRepository } from './chat-users.repository';
import { ChatUsersController } from './chat-users.controller';
import { ChatsService } from '../chats/chats.service';
import { ChatsRepository } from '../chats/chats.repository';
import { ChatMessagesService } from '../chat-messages/chat-messages.service';
import { ChatMessagesRepository } from '../chat-messages/chat-messages.repository';

@Global()
@Module({
    controllers: [ChatUsersController],
    providers: [
        ChatUsersService,
        ChatUsersRepository,
        ChatsService,
        ChatsRepository,
        ChatMessagesService,
        ChatMessagesRepository,
    ],
    exports: [ChatUsersService, ChatUsersRepository],
})
export class ChatUsersModule {}
