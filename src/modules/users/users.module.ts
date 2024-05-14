import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { MeController } from './me.controller';

@Module({
    imports: [],
    controllers: [UsersController, MeController],
    providers: [UsersService, UsersRepository],
    exports: [UsersService],
})
export class UsersModule {}
