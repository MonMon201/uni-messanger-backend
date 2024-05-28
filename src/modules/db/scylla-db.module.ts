import { DynamicModule, Global, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Client } from 'cassandra-driver';
import { SCYLLA_DB_CLIENT, SCYLLA_DB_CONTEXT } from './scylla-db.constants';

type ScyllaDbModuleOptions = {
    contactPoints: string[];
    localDataCenter: string;
    keyspace: string;
    credentials?: {
        username: string;
        password: string;
    };
};

type ScyllaDbModuleAsyncOptions = {
    imports?: any[];
    useFactory?: (...args: any[]) => ScyllaDbModuleOptions | Promise<ScyllaDbModuleOptions>;
    inject?: any[];
};

const logger = new Logger(SCYLLA_DB_CONTEXT);

@Global()
@Module({})
export class ScyllaDbModule implements OnApplicationShutdown {
    constructor(private readonly moduleRef: ModuleRef) {}

    static forRoot(options: ScyllaDbModuleOptions): DynamicModule {
        const scyllaDbClientProvider = {
            provide: SCYLLA_DB_CLIENT,
            useValue: this.createClient(options),
        };

        return {
            module: ScyllaDbModule,
            providers: [scyllaDbClientProvider],
            exports: [scyllaDbClientProvider],
        };
    }

    static forRootAsync(options: ScyllaDbModuleAsyncOptions): DynamicModule {
        if (!options.useFactory) {
            throw new Error('Invalid configuration. Must provide useFactory');
        }

        const scyllaDbClientProvider = {
            provide: SCYLLA_DB_CLIENT,
            useFactory: async (...args: any[]) => {
                const config = await options.useFactory(...args);
                return this.createClient(config);
            },
            imports: options.imports || [],
            inject: options.inject || [],
        };

        return {
            module: ScyllaDbModule,
            providers: [scyllaDbClientProvider],
            exports: [scyllaDbClientProvider],
        };
    }

    static createClient(options: ScyllaDbModuleOptions): Client {
        const client = new Client(options);
        logger.log('ScyllaDB client instance is ready');
        return client;
    }

    async onApplicationShutdown() {
        const client = this.moduleRef.get<Client>(SCYLLA_DB_CLIENT);
        if (client) {
            await client.shutdown();
        }
    }
}
