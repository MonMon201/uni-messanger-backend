import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/modules/auth/types/jwt-payload';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';

import { ChatsService } from './chats.service';
import { CreateChatDto, UpdateChatDto } from './dtos';
import { ChatEntity } from './chat.entity';

@Controller({
    path: 'chats',
    version: '1',
})
@UseGuards(AuthGuard)
@ApiTags('chats')
export class ChatsController {
    constructor(private readonly chatsService: ChatsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBody({ type: CreateChatDto })
    @ApiResponse({ status: 201, description: 'Chat created', type: ChatEntity })
    @ApiResponse({ status: 409, description: 'Chat with the same chatname already exists' })
    async create(@CurrentUser() user: JwtPayload, @Body() chat: CreateChatDto): Promise<ChatEntity> {
        return this.chatsService.create(user.sub, chat);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'List of chats', type: ChatEntity, isArray: true })
    @ApiResponse({ status: 404, description: 'No chats found' })
    async findAll(): Promise<ChatEntity[]> {
        return this.chatsService.findAll();
    }

    @Get(':chatId')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'Chat found', type: ChatEntity })
    @ApiResponse({ status: 404, description: 'Chat not found' })
    async findOne(@Param('chatId', ParseUUIDPipe) chatId: string): Promise<ChatEntity> {
        return this.chatsService.findOne(chatId);
    }

    @Patch(':chatId')
    @HttpCode(HttpStatus.OK)
    @ApiBody({ type: UpdateChatDto })
    @ApiResponse({ status: 200, description: 'Chat updated', type: ChatEntity })
    @ApiResponse({ status: 404, description: 'Chat not found' })
    async update(
        @CurrentUser() user: JwtPayload,
        @Param('chatId', ParseUUIDPipe) chatId: string,
        @Body() updateDto: UpdateChatDto,
    ): Promise<ChatEntity> {
        return this.chatsService.update(user.sub, chatId, updateDto);
    }

    // TODO add cascade deleting of everything that relates to chat
}
