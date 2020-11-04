import { getCustomRepository, DeleteResult } from "typeorm";

import TransactionsRepository from '../repositories/TransactionsRepository';

// import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<DeleteResult> {
    const transactionRepository = await getCustomRepository(TransactionsRepository);

    const deleted = await transactionRepository.delete(id)

    return deleted;
  }
}

export default DeleteTransactionService;
