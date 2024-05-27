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

@WebSocketGateway({
    namespace: 'chat',
    cors: {
        origin: '*', // Replace with your client application's URL
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
    async handleConnection(client: Socket) {
        const chatId = client.handshake.query.chatId;
        const email = client.handshake.query.email;

        if (!email || isArray(email)) {
            this.logger.log(`Client connection rejected due to missing chatId: ${client.id}`);
            client.disconnect();
            return;
        }

        if (!chatId || isArray(chatId)) {
            this.logger.log(`Client connection rejected due to missing chatId: ${client.id}`);
            client.disconnect();
            return;
        }

        const user = await this.usersService.findOneByUsername(email);

        if (!user) {
            this.logger.log(`Client connection rejected: ${email} is not a user`);
            client.disconnect();
            return;
        }

        const { user_id } = user;

        const isUserInChat = await this.chatUsersService.findUserInChat(chatId, user_id);
        if (!isUserInChat) {
            this.logger.log(`Client connection rejected: ${client.id} is not in chat ${chatId}`);
            client.disconnect();
            return;
        }
        this.logger.log(`Client connected: ${client.id}`);
    }

    @UseGuards(AuthGuard)
    async handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @UseGuards(AuthGuard)
    @SubscribeMessage('createMessage')
    async handleMessageCreate(client: Socket, payload: { chatId: string; message: CreateChatMessageDto }) {
        const user = client['user'];
        const message = await this.chatMessagesService.create(payload.chatId, user.sub, payload.message);
        this.server.to(payload.chatId).emit('messageCreated', message);
    }

    @UseGuards(AuthGuard)
    @SubscribeMessage('joinChat')
    handleJoinChat(client: Socket, chatId: string) {
        client.join(chatId);
        client.emit('joinedChat', chatId);
        this.logger.log(`Client ${client.id} joined chat ${chatId}`);
    }

    @UseGuards(AuthGuard)
    @SubscribeMessage('leaveChat')
    handleLeaveChat(client: Socket, chatId: string) {
        client.leave(chatId);
        client.emit('leftChat', chatId);
        this.logger.log(`Client ${client.id} left chat ${chatId}`);
    }

    @UseGuards(AuthGuard)
    @SubscribeMessage('fetchMessages')
    async handleFetchMessages(client: Socket, chatId: string) {
        const messages = await this.chatMessagesService.findAllChatMessagesForDate(chatId);
        client.emit('messagesFetched', messages);
    }
}
