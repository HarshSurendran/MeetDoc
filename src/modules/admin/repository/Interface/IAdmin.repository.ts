import { AdminDocument } from "../../schemas/admin.schema";

export interface IAdminRepository {
    findOne(query: object): Promise<AdminDocument | null>;
    updateOne(query: object, data: object): Promise<AdminDocument | null>;
}