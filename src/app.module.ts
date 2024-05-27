import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScyllaDbModule } from './modules/db/scylla-db.module';
import { GlobalJwtModule } from './modules/global-jwt/global-jwt.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatsModule } from './modules/chats/chats.module';
import { ChatUsersModule } from './modules/chat-users/chat-users.module';
import { ChatMessagesModule } from './modules/chat-messages/chat-messages.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestGlobalProvider } from './common/test/test.provider';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ScyllaDbModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                contactPoints: configService.get<string>('DB_CONTACT_POINTS').split(','),
                localDataCenter: configService.get<string>('DB_LOCAL_DC'),
                keyspace: configService.get<string>('DB_KEYSPACE'),
                credentials: {
                    username: configService.get<string>('DB_USERNAME'),
                    password: configService.get<string>('DB_PASSWORD'),
                },
            }),
        }),
        GlobalJwtModule,
        UsersModule,
        AuthModule,
        ChatsModule,
        ChatUsersModule,
        ChatMessagesModule,
    ],
    controllers: [AppController],
    providers: [AppService, TestGlobalProvider],
})
export class AppModule {}
