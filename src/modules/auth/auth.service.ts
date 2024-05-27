import {
    ConflictException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from 'src/modules/users/users.service';
import { UserEntity } from 'src/modules/users/user.entity';

import { LoginDto, RegisterDto, JwtDto } from './dtos';
import { AuthRepository } from './auth.repository';
import { Hash } from './utils/hash';
import { JwtPayload } from './types/jwt-payload';

@Injectable()
export class AuthService {
    logger = new Logger(AuthService.name);

    constructor(
        private readonly authRepository: AuthRepository,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) {}

    async register(dto: RegisterDto): Promise<UserEntity> {
        const { email, password, ...createUserDto } = dto;

        const hashedPassword = Hash.make(password);

        let user;
        try {
            user = await this.usersService.create(createUserDto);
        } catch (e) {
            if (e?.status === HttpStatus.CONFLICT) {
                throw new ConflictException('User with the same email/username exists');
            } else {
                this.logger.error(`Failed to create user with data: ${JSON.stringify(dto)}\n${e.message}`, e.stack);
                throw new InternalServerErrorException('Failed to create user');
            }
        }

        // todo create auth entity and return jwtToken
        try {
            await this.authRepository.create(email, hashedPassword, user.user_id);
        } catch (e) {
            this.logger.error(`Failed to create auth entity for user id:${user.user_id}\n${e.message}`, e.stack);
            throw new InternalServerErrorException('Failed to create auth entity');
        }

        return user;
    }

    async login(dto: LoginDto): Promise<JwtDto> {
        const { email, password } = dto;

        const auth = await this.authRepository.findAuthByLoginCred(email);
        if (!auth) {
            this.logger.debug(`Invalid credentials`);
            throw new UnauthorizedException();
        }

        const hashedPassword = auth.password;
        if (!Hash.compare(password, hashedPassword)) {
            this.logger.debug(`Invalid credentials`);
            throw new UnauthorizedException();
        }

        const res = {
            jwt: await this.signJwt({ sub: auth.user_id, email: auth.email }),
        };

        this.logger.log(`User with email:${email} logged in`);

        return res;
    }

    async signJwt(payload: JwtPayload): Promise<string> {
        return this.jwtService.sign(payload);
    }

    // async findOneByUserId(userId: string): Promise<JwtRefreshEntity> {
    //     return this.authRepository.findJwtRefreshByUserId(userId);
    // }
}
