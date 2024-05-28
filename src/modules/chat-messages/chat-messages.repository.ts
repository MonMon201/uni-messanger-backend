import { Inject, Injectable } from '@nestjs/common';
import { Client, types } from 'cassandra-driver';

import { tmpStringifyDbResult } from 'src/common/utils/tmp-stringify-db-result';
import { SCYLLA_DB_CLIENT } from 'src/modules/db/scylla-db.constants';

import { CreateChatMessageDto, UpdateChatMessageDto } from './dtos';
import { ChatMessageEntity } from './chat-message.entity';

@Injectable()
export class ChatMessagesRepository {
    constructor(@Inject(SCYLLA_DB_CLIENT) private readonly dbClient: Client) {}

    async create(chatId: string, userId: string, createDto: CreateChatMessageDto): Promise<string> {
        const newChatMessageId = types.Uuid.random().toString();

        await this.dbClient.execute(
            `INSERT INTO chat_messages (id, chat_id, date, user_id, content, created_at, updated_at, reply_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newChatMessageId,
                chatId,
                types.LocalDate.fromDate(new Date()),
                userId,
                createDto.content,
                new Date(),
                new Date(),
                createDto.reply_to ?? null,
            ],
        );

        return newChatMessageId;
    }

    async findAllChatMessagesForDate(chatId: string, date: Date) {
        const resultSet = await this.dbClient.execute(
            `SELECT * FROM chat_messages WHERE chat_id = ? AND date = ? ALLOW FILTERING;`,
            [chatId, types.LocalDate.fromDate(date)],
        );

        return tmpStringifyDbResult(resultSet.rows) as any as ChatMessageEntity[];
    }

    async findChatMessageById(messageId: string): Promise<ChatMessageEntity> {
        const resultSet = await this.dbClient.execute(`SELECT * FROM chat_messages WHERE id = ?`, [messageId]);

        return tmpStringifyDbResult(resultSet.first()) as any as ChatMessageEntity;
    }

    async updateChatMessage(chatMessage: ChatMessageEntity): Promise<void> {
        await this.dbClient.execute(
            `UPDATE chat_messages SET content = ?, updated_at = ? WHERE chat_id = ? AND date = ? AND id = ?`,
            [
                chatMessage.content,
                new Date(),
                chatMessage.chat_id,
                types.LocalDate.fromDate(chatMessage.date),
                chatMessage.id,
            ],
        );
    }

    async deleteChatMessage(messageId: string): Promise<void> {
        await this.dbClient.execute(`DELETE FROM chat_messages WHERE id = ?`, [messageId]);
    }

    async findAllMessagesByChatId(chatId: string): Promise<ChatMessageEntity[]> {
        const resultSet = await this.dbClient.execute(`SELECT * FROM chat_messages WHERE chat_id = ?`, [chatId]);

        return tmpStringifyDbResult(resultSet.rows) as any as ChatMessageEntity[];
    }
}
