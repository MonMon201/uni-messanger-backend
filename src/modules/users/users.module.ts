import { Global, Module } from '@nestjs/common';

import { ChatUsersModule } from 'src/modules/chat-users/chat-users.module';

import { UsersController } from './users.controller';
import { MeController } from './me.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Global()
@Module({
    imports: [ChatUsersModule],
    controllers: [UsersController, MeController],
    providers: [UsersService, UsersRepository],
    exports: [UsersService],
})
export class UsersModule {}
