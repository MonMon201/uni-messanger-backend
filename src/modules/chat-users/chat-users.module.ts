import { Global, Module } from '@nestjs/common';
import { ChatUsersService } from './chat-users.service';
import { ChatUsersRepository } from './chat-users.repository';

@Global()
@Module({
    providers: [ChatUsersService, ChatUsersRepository],
    exports: [ChatUsersService, ChatUsersRepository],
})
export class ChatUsersModule {}
