import { AdminDocument } from '../../schemas/admin.schema';
import { IBaseRepository } from 'src/modules/repositories/Interface/IBase.repository';

export interface IAdminRepository extends IBaseRepository<AdminDocument> {
  findOne(query: object): Promise<AdminDocument | null>;
  updateOne(query: object, data: object): Promise<AdminDocument | null>;
}
