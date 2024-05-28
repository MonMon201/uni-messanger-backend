import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ChatMessagesRepository } from './chat-messages.repository';
import { CreateChatMessageDto, UpdateChatMessageDto } from './dtos';
import { ChatMessageEntity } from './chat-message.entity';

@Injectable()
export class ChatMessagesService {
    logger = new Logger(ChatMessagesService.name);

    constructor(private readonly chatMessagesRepository: ChatMessagesRepository) {}

    async create(chatId: string, userId: string, createDto: CreateChatMessageDto): Promise<ChatMessageEntity> {
        let newChatMessageId: string;
        try {
            newChatMessageId = await this.chatMessagesRepository.create(chatId, userId, createDto);
        } catch (e) {
            this.logger.error(
                `Failed to create chat message with data: ${JSON.stringify(createDto)}\n${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(`Failed to create chat message`);
        }

        return this.chatMessagesRepository.findChatMessageById(newChatMessageId);
    }

    async findAllChatMessagesForDate(chatId: string, date: Date = new Date()): Promise<ChatMessageEntity[]> {
        const messages = await this.chatMessagesRepository.findAllChatMessagesForDate(chatId, date);
        if (!messages || messages.length === 0) {
            this.logger.debug('No chat messages found');
            throw new NotFoundException('No chat messages found');
        }
        this.logger.debug(`Found ${messages.length} chat messages`);

        return messages;
    }

    async findChatMessageById(messageId: string): Promise<ChatMessageEntity> {
        const message = await this.chatMessagesRepository.findChatMessageById(messageId);
        if (!message) {
            this.logger.log(`Chat message id:${messageId} not found`);
            throw new NotFoundException(`Chat message id:${messageId} not found`);
        }
        this.logger.debug(`Found chat message id:${messageId}`);

        return message;
    }

    async updateChatMessage(messageId: string, updateDto: UpdateChatMessageDto): Promise<ChatMessageEntity> {
        const message = await this.chatMessagesRepository.findChatMessageById(messageId);
        if (!message) {
            this.logger.log(`Chat message id:${messageId} not found`);
            throw new NotFoundException(`Chat message id:${messageId} not found for update`);
        }

        const updatedMessage = Object.assign(message, updateDto);

        try {
            await this.chatMessagesRepository.updateChatMessage(updatedMessage);
        } catch (e) {
            this.logger.error(
                `Failed to update chat message id:${messageId} with data: ${JSON.stringify(updateDto)}\n${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(`Failed to update chat message`);
        }
        this.logger.debug(`Updated chat message id:${messageId}`);

        return this.chatMessagesRepository.findChatMessageById(messageId);
    }

    async deleteChatMessage(messageId: string): Promise<ChatMessageEntity> {
        const message = await this.chatMessagesRepository.findChatMessageById(messageId);
        if (!message) {
            this.logger.log(`Chat message id:${messageId} not found`);
            throw new NotFoundException(`Chat message id:${messageId} not found for delete`);
        }

        try {
            await this.chatMessagesRepository.deleteChatMessage(messageId);
        } catch (e) {
            this.logger.error(`Failed to delete chat message id:${messageId}\n${e.message}`, e.stack);
            throw new InternalServerErrorException(`Failed to delete chat message`);
        }
        this.logger.debug(`Deleted chat message id:${messageId}`);

        return message;
    }

    async removeMessagesFromChat(chatId: string): Promise<void> {
        const messages = await this.chatMessagesRepository.findAllMessagesByChatId(chatId);
        for (const message of messages) {
            await this.chatMessagesRepository.deleteChatMessage(message.id);
        }
    }
}
