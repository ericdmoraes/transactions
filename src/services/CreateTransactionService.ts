// Modules
import { uuid } from "uuidv4";
import { getCustomRepository, getRepository } from "typeorm";

import AppError from '../errors/AppError';

// Models
import Transaction from '../models/Transaction';
import Category from '../models/Category'

// Repositories
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string,
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository)
    const categoryRepository = getRepository(Category)

    const categoryData = await categoryRepository.findOne({
      where: {
        title: category
      }
    })

    const transactions = await transactionRepository.find()
    const { total } = await transactionRepository.getBalance(transactions)

    if (type === 'outcome' && total < value) {
      throw new AppError('You dont have money for this!', 400)
    }

    let transaction: Transaction;

    if(!categoryData) {
      const categoryData = categoryRepository.create({
        id: uuid(),
        title: category
      })

      await categoryRepository.save(categoryData)

      transaction = transactionRepository.create({
        category: categoryData,
        id: uuid(),
        title,
        value,
        type
      })
    } else {
      transaction = transactionRepository.create({
        category: categoryData,
        id: uuid(),
        title,
        value,
        type
      })
    }

    await transactionRepository.save(transaction)

    return transaction;
  }
}

export default CreateTransactionService;
