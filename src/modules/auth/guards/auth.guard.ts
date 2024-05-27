import { CanActivate, ExecutionContext, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

export class AuthGuard implements CanActivate {
    constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (context.getType() === 'ws') {
            return this.validateWebSocketConnection(context);
        } else {
            return this.validateHttpRequest(context);
        }
    }

    private async validateHttpRequest(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            request['user'] = await this.jwtService.verifyAsync(token);
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private async validateWebSocketConnection(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient();
        const token = this.extractTokenFromSocket(client);
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            client['user'] = await this.jwtService.verifyAsync(token);
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = (request.headers as any).authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    private extractTokenFromSocket(client: any): string | undefined {
        const token = client.handshake?.query?.token;
        return token ? token : undefined;
    }
}
