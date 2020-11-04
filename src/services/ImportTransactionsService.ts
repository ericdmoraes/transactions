import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from "../repositories/TransactionsRepository";

import { In, getRepository, getCustomRepository } from "typeorm";

import csvParse from 'csv-parse';
import fs from 'fs';

interface CSV {
  title: string;
  type: "income" | "outcome",
  value: number;
  category: string;
}

interface LoadResponse {
  categories: string[];
  transactions: CSV[];
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const readCsv = await this.loadCSV(filePath);

    const AllCategories = await this.verifyCategoriesExistsInDatabaseAndCreate(readCsv.categories);

    const CreatedTransactions = await this.createAllTransactions(readCsv.transactions, AllCategories)

    await fs.promises.unlink(filePath);

    return CreatedTransactions;
  }

  async createAllTransactions(transactions: CSV[], categories: Category[]) {
    const transactionRepository = getCustomRepository(TransactionRepository)

    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category: categories.find(category => category.title === transaction.category)
        }))
      )

    await transactionRepository.save(createdTransactions)

    return createdTransactions;
  }

  async verifyCategoriesExistsInDatabaseAndCreate(categories: string[]): Promise<Category[]> {
    const categoryRepository = getRepository(Category)

    const createdCategories = await categoryRepository.find({
      where: {
        title: In(categories)
      }
    })

    const categoriesTitle = createdCategories.map(cat => cat.title)

    const addCategoriesTitles = categories.filter(cat => !categoriesTitle.includes(cat)).filter((value, index, self) => self.indexOf(value) === index)

    const newCategories = categoryRepository.create(
      addCategoriesTitles.map(catTitle => ({
        title: catTitle
      }))
    )

    await categoryRepository.save(newCategories)

    const allCategories = [...newCategories, ...createdCategories]

    return allCategories;
  }

  async loadCSV(filePath: string): Promise<LoadResponse> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSV[] = []
    const categories: string[] = []

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) => cell.trim());

      transactions.push({
        title,
        type,
        value,
        category
      })

      categories.push(category)

    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return {
      categories,
      transactions
    }
  }
}

export default ImportTransactionsService;
