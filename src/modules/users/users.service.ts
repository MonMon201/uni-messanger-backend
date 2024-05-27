import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';

import { CreateUserDto, UpdateUserDto } from './dtos';
import { UsersRepository } from './users.repository';
import { UserEntity } from './user.entity';
import { AuthRepository } from '../auth/auth.repository';

@Injectable()
export class UsersService {
    logger = new Logger(UsersService.name);

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly authRepository: AuthRepository,
    ) {}

    async create(createDto: CreateUserDto): Promise<UserEntity> {
        const checkUsername = await this.usersRepository.findOneByUsername(createDto.username);
        if (checkUsername) {
            this.logger.debug(
                `User with the same username already exists: ${createDto.username} under id:${checkUsername.user_id}`,
            );
            throw new ConflictException('User with the same username already exists');
        }

        let newUserId: string;
        try {
            newUserId = await this.usersRepository.create(createDto);
        } catch (e) {
            this.logger.error(`Failed to create user with data: ${JSON.stringify(createDto)}\n${e.message}`, e.stack);
            throw new InternalServerErrorException(`Failed to create user`);
        }

        return this.usersRepository.findOneById(newUserId);
    }

    async findAll(): Promise<UserEntity[]> {
        const users = await this.usersRepository.findAll();
        if (!users || users.length === 0) {
            this.logger.debug('No users found');
            throw new NotFoundException('No users found');
        }
        this.logger.debug(`Found ${users.length} users`);

        return users;
    }

    async findOne(id: string): Promise<UserEntity> {
        const user = await this.usersRepository.findOneById(id);
        if (!user) {
            this.logger.log(`User id:${id} not found`);
            throw new NotFoundException(`User id:${id} not found`);
        }
        this.logger.debug(`Found user id:${id}`);

        return user;
    }

    async findOneByUsername(username: string): Promise<UserEntity> {
        const user = await this.usersRepository.findOneByUsername(username);
        if (!user) {
            this.logger.log(`User username:${username} not found`);
            throw new NotFoundException(`User username:${username} not found`);
        }
        this.logger.debug(`Found user username:${username}`);

        return user;
    }

    async findOneByEmail(email: string): Promise<UserEntity> {
        const userAuthEntity = await this.authRepository.findAuthByLoginCred(email);

        if (!userAuthEntity) {
            this.logger.log(`User email:${email} not found`);
            throw new NotFoundException(`User email:${email} not found`);
        }

        const { user_id } = userAuthEntity;

        try {
            return await this.usersRepository.findOneById(user_id);
        } catch (e) {
            throw e;
        }
    }

    async update(id: string, updateDto: UpdateUserDto): Promise<UserEntity> {
        const user = await this.usersRepository.findOneById(id);
        if (!user) {
            this.logger.log(`User id:${id} not found for update`);
            throw new NotFoundException(`User id:${id} not found`);
        }

        const updatedUser = Object.assign(user, updateDto);

        try {
            await this.usersRepository.update(updatedUser);
        } catch (e) {
            this.logger.error(`Failed to update user with data: ${JSON.stringify(updatedUser)}\n${e.message}`, e.stack);
            throw new InternalServerErrorException(`Failed to update user id:${id}`);
        }
        this.logger.debug(`Updated user id:${id}`);

        return this.usersRepository.findOneById(id);
    }

    async delete(id: string): Promise<UserEntity> {
        const user = await this.usersRepository.findOneById(id);
        if (!user) {
            throw new NotFoundException(`User id:${id} not found`);
        }

        try {
            await this.usersRepository.delete(id);
        } catch (e) {
            this.logger.error(`Failed to delete user id:${id}\n${e.message}`, e.stack);
            throw new InternalServerErrorException(`Failed to delete user id:${id}`);
        }

        return user;
    }
}
