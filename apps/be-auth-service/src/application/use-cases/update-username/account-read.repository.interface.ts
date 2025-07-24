import { Account } from '../../../domain/aggregates/account.aggregate';

export abstract class AccountReadRepositoryInterface {
    public abstract getById(id: string): Promise<Account|null>
}