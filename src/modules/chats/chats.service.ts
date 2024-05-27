import {
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';

import { ChatUsersService } from 'src/modules/chat-users/chat-users.service';
import { ChatMessagesService } from 'src/modules/chat-messages/chat-messages.service'; // Import ChatMessagesService

import { CreateChatDto, UpdateChatDto } from './dtos';
import { ChatsRepository } from './chats.repository';
import { ChatEntity } from './chat.entity';

@Injectable()
export class ChatsService {
    logger = new Logger(ChatsService.name);

    constructor(
        private readonly chatsRepository: ChatsRepository,
        private readonly chatUsersService: ChatUsersService,
        private readonly chatMessagesService: ChatMessagesService, // Inject ChatMessagesService
    ) {}

    async create(ownerId: string, createDto: CreateChatDto): Promise<ChatEntity> {
        const checkChatname = await this.chatsRepository.findOneBySlug(createDto.slug);
        if (checkChatname) {
            this.logger.debug(
                `Chat with the same slug already exists: ${createDto.slug} under id:${checkChatname.chat_id}`,
            );
            throw new ConflictException('Chat with the same chatname already exists');
        }

        let newChatId: string;
        try {
            newChatId = await this.chatsRepository.create(ownerId, createDto);
        } catch (e) {
            this.logger.error(`Failed to create chat with data: ${JSON.stringify(createDto)}\n${e.message}`, e.stack);
            throw new InternalServerErrorException(`Failed to create chat`);
        }

        try {
            await this.chatUsersService.addUserToChat(newChatId, { userId: ownerId });
        } catch (e) {
            this.logger.error(
                `Failed to add owner with id:${ownerId} to chat with id:${newChatId}\n${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(`Failed to add owner to chat`);
        }

        // TODO later, add to chat default permissions

        return this.chatsRepository.findOneById(newChatId);
    }

    async findAll(): Promise<ChatEntity[]> {
        const chats = await this.chatsRepository.findAll();
        if (!chats || chats.length === 0) {
            this.logger.debug('No chats found');
            throw new NotFoundException('No chats found');
        }
        this.logger.debug(`Found ${chats.length} chats`);

        return chats;
    }

    async findOne(id: string): Promise<ChatEntity> {
        const chat = await this.chatsRepository.findOneById(id);
        if (!chat) {
            this.logger.log(`Chat id:${id} not found`);
            throw new NotFoundException(`Chat id:${id} not found`);
        }
        this.logger.debug(`Found chat id:${id}`);

        return chat;
    }

    async update(ownerId: string, id: string, updateDto: UpdateChatDto): Promise<ChatEntity> {
        const chat = await this.chatsRepository.findOneById(id);
        if (!chat) {
            throw new NotFoundException(`Chat id:${id} not found`);
        }
        if (chat.owner_id !== ownerId) {
            throw new ForbiddenException(`Access Denied. You do have permission to delete this chat`);
        }

        const updatedChat = Object.assign(chat, updateDto);

        try {
            await this.chatsRepository.update(updatedChat);
        } catch (e) {
            this.logger.error(`Failed to update chat with data: ${JSON.stringify(updatedChat)}\n${e.message}`, e.stack);
            throw new InternalServerErrorException(`Failed to update chat id:${id}`);
        }
        this.logger.debug(`Updated chat id:${id}`);

        const res = await this.chatsRepository.findOneById(id);

        return res;
    }

    async delete(ownerId: string, id: string): Promise<ChatEntity> {
        const chat = await this.chatsRepository.findOneById(id);
        if (!chat) {
            throw new NotFoundException(`Chat id:${id} not found`);
        }
        if (chat.owner_id !== ownerId) {
            throw new ForbiddenException(`Access Denied. You do have permission to delete this chat`);
        }

        try {
            await Promise.all([
                this.chatUsersService.removeUsersFromChat(id),
                this.chatMessagesService.removeMessagesFromChat(id),
            ]);
            await this.chatsRepository.delete(id);
        } catch (e) {
            this.logger.error(`Failed to delete chat id:${id}\n${e.message}`, e.stack);
            throw new InternalServerErrorException(`Failed to delete chat id:${id}`);
        }

        return chat;
    }
}
