import { ObjectId } from "mongoose";

export interface IBaseRepository<T> {
    create(data: T): Promise<T>;
    find(query?: object): Promise<T[]>;
    findById(id: ObjectId): Promise<T | null>;
    update(id: ObjectId, data: Partial<T>): Promise<T | null>;
    delete(id: ObjectId): Promise<T | null>;
}
