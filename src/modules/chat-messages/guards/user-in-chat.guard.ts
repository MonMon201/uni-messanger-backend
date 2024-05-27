import { CanActivate, ExecutionContext, Inject, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { ChatUsersService } from '../../chat-users/chat-users.service';

export class UserInChatGuard implements CanActivate {
    constructor(
        @Inject(UsersService) private readonly usersService: UsersService,
        @Inject(ChatUsersService) private readonly chatUsersService: ChatUsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { chatId, email } = this.extractUserInfoFromSocket(context.switchToWs().getClient());

        const user = await this.usersService.findOneByEmail(email);

        if (!user) {
            throw new UnauthorizedException();
        }

        const { user_id } = user;

        const isUserInChat = await this.chatUsersService.findUserInChat(chatId, user_id);

        if (!isUserInChat) {
            throw new UnauthorizedException();
        }

        return true;
    }

    private extractUserInfoFromSocket(client: any): {
        chatId: string;
        email: string;
    } | null {
        const chatId = client.handshake?.query?.chatId;
        const email = client.handshake?.query?.email;
        return chatId && email ? { chatId, email } : null;
    }
}
