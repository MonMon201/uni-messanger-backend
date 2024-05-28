import { Injectable, InternalServerErrorException, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { ChatUsersRepository } from './chat-users.repository';
import { AddUserToChatDto } from './dtos';
import { ChatUserEntity } from './chat-user.entity';

@Injectable()
export class ChatUsersService {
    logger = new Logger(ChatUsersService.name);

    constructor(private readonly chatUsersRepository: ChatUsersRepository) {}

    async addUserToChat(chatId: string, addUserDto: AddUserToChatDto): Promise<ChatUserEntity> {
        const { userId } = addUserDto;

        const checkUserInChat = await this.chatUsersRepository.findUserInChat(chatId, userId);
        if (checkUserInChat) {
            this.logger.debug(`User with id:${userId} already in chat with id:${chatId}`);
            throw new ConflictException('User already in this chat');
        }

        try {
            await this.chatUsersRepository.addUserToChat(chatId, addUserDto);
        } catch (e) {
            this.logger.error(`Failed to add user with id:${userId} to chat with id:${chatId}\n${e.message}`, e.stack);
            throw new InternalServerErrorException(`Failed to create user`);
        }

        return this.chatUsersRepository.findUserInChat(chatId, userId);
    }

    async findUserInChat(chatId: string, userId: string): Promise<ChatUserEntity> {
        const chatUser = await this.chatUsersRepository.findUserInChat(chatId, userId);
        if (!chatUser) {
            this.logger.debug(`User with id:${userId} not in chat with id:${chatId}`);
            throw new NotFoundException('User not found in chat');
        }
        this.logger.debug(`Found user with id:${userId} in chat with id:${chatId}`);

        return chatUser;
    }

    async findChatUsers(chatId: string): Promise<ChatUserEntity[]> {
        const chatUsers = await this.chatUsersRepository.findChatUsers(chatId);
        if (!chatUsers || chatUsers.length === 0) {
            this.logger.debug(`No users found in chat with id:${chatId}`);
            throw new NotFoundException('No users found in chat');
        }
        this.logger.debug(`Found ${chatUsers.length} users in chat with id:${chatId}`);

        return chatUsers;
    }

    async findUserChats(userId: string): Promise<ChatUserEntity[]> {
        const chatUsers = await this.chatUsersRepository.findUserChats(userId);
        if (!chatUsers || chatUsers.length === 0) {
            this.logger.debug(`No chats found for user with id:${userId}`);
            throw new NotFoundException('No chats found for user');
        }
        this.logger.debug(`Found ${chatUsers.length} chats for user with id:${userId}`);

        return chatUsers;
    }

    async updateUserInChat(chatId: string, userId: string, updateDto: AddUserToChatDto): Promise<ChatUserEntity> {
        const chatUser = await this.chatUsersRepository.findUserInChat(chatId, userId);
        if (!chatUser) {
            throw new NotFoundException(`User id:${userId} not found in chat id:${chatId}`);
        }

        const updatedChatUser = Object.assign(chatUser, updateDto);

        try {
            await this.chatUsersRepository.updateUserInChat(updatedChatUser);
        } catch (e) {
            this.logger.error(
                `Failed to update user with data: ${JSON.stringify(updatedChatUser)}\n${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(`Failed to update user id:${userId} in chat id:${chatId}`);
        }
        this.logger.debug(`Updated user id:${userId} in chat id:${chatId}`);

        return this.chatUsersRepository.findUserInChat(chatId, userId);
    }

    async removeUserFromChat(chatId: string, userId: string): Promise<ChatUserEntity> {
        const chatUser = await this.chatUsersRepository.findUserInChat(chatId, userId);
        if (!chatUser) {
            throw new NotFoundException(`User id:${userId} not found in chat id:${chatId}`);
        }

        try {
            await this.chatUsersRepository.removeUserFromChat(chatId, userId);
        } catch (e) {
            this.logger.error(`Failed to delete user id:${userId} from chat id:${chatId}\n${e.message}`, e.stack);
            throw new InternalServerErrorException(`Failed to delete user id:${userId} from chat id:${chatId}`);
        }

        return chatUser;
    }

    async removeUsersFromChat(chatId: string): Promise<void> {
        const chatUsers = await this.chatUsersRepository.findChatUsers(chatId);
        for (const chatUser of chatUsers) {
            await this.chatUsersRepository.removeUserFromChat(chatId, chatUser.user_id);
        }
    }
}
