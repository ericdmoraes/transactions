import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions: Transaction[] ): Promise<Balance> {
    const totalBalance = transactions.reduce(
      (acc: Balance, el: Transaction) => {
        if (el.type === 'income') {
          acc.income += el.value;
          acc.total += el.value;
        } else if (el.type === 'outcome') {
          acc.outcome += el.value;
          acc.total -= el.value;
        }

        return acc;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );
    return totalBalance;
  }
}

export default TransactionsRepository;
