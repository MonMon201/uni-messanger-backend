import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatMessagesService } from './chat-messages.service';
import { CreateChatMessageDto } from './dtos';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ChatUsersService } from '../chat-users/chat-users.service';
import { isArray } from 'class-validator';
import { UsersService } from '../users/users.service';
import { UserInChatGuard } from './guards/user-in-chat.guard';

@WebSocketGateway({
    namespace: 'chat',
    cors: {
        origin: 'http://localhost:5173', // Replace with your client application's URL
        methods: ['GET', 'POST'],
        credentials: true,
    },
})
export class ChatMessagesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('ChatMessagesGateway');

    constructor(
        private readonly chatMessagesService: ChatMessagesService,
        private readonly chatUsersService: ChatUsersService,
        private readonly usersService: UsersService,
    ) {}

    afterInit() {}

    @UseGuards(AuthGuard)
    @UseGuards(UserInChatGuard)
    async handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    @UseGuards(AuthGuard)
    @UseGuards(UserInChatGuard)
    async handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @UseGuards(AuthGuard)
    @UseGuards(UserInChatGuard)
    @SubscribeMessage('createMessage')
    async handleMessageCreate(client: Socket, payload: { chatId: string; message: CreateChatMessageDto }) {
        const user = client['user'];
        const message = await this.chatMessagesService.create(payload.chatId, user.sub, payload.message);
        this.server.to(payload.chatId).emit('messageCreated', message);
    }

    @UseGuards(AuthGuard)
    @UseGuards(UserInChatGuard)
    @SubscribeMessage('joinChat')
    handleJoinChat(client: Socket, chatId: string) {
        client.join(chatId);
        client.emit('joinedChat', chatId);
        this.logger.log(`Client ${client.id} joined chat ${chatId}`);
    }

    @UseGuards(AuthGuard)
    @UseGuards(UserInChatGuard)
    @SubscribeMessage('leaveChat')
    handleLeaveChat(client: Socket, chatId: string) {
        client.leave(chatId);
        client.emit('leftChat', chatId);
        this.logger.log(`Client ${client.id} left chat ${chatId}`);
    }

    @UseGuards(AuthGuard)
    @UseGuards(UserInChatGuard)
    @SubscribeMessage('fetchMessages')
    async handleFetchMessages(client: Socket, chatId: string) {
        const messages = await this.chatMessagesService.findAllChatMessagesForDate(chatId);
        client.emit('messagesFetched', messages);
    }
}
