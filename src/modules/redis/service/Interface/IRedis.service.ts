export interface IRedisService {
    onModuleInit(): Promise<void>
    onModuleDestroy(): Promise<void>
    set(key: string, value: string, ttl?: number): Promise<void>
    get(key: string): Promise<string | null>
    delete(key: string): Promise<void> 
}