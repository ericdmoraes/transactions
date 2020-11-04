import { Router } from 'express';
import multer from "multer";

// Type
import { getCustomRepository } from "typeorm";

// Multer
import uploadConfig from '../configs/upload.config';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

// multer instance
const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (req, res) => {
  const transactionRepository = await getCustomRepository(TransactionsRepository);

  const transactions = await transactionRepository.find()
  const balance = await transactionRepository.getBalance(transactions)

  return res.json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (req, res) => {
  const { title, value, type, category } = req.body;
  const createTransaction = new CreateTransactionService()
  const transaction = await createTransaction.execute({ value, title, type, category })
  return res.json(transaction);
});

transactionsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const deleteTransaction = new DeleteTransactionService();
  const deletedTransaction = await deleteTransaction.execute(id)
  return res.json(deletedTransaction)
});

transactionsRouter.post('/import', upload.single('file') ,async (req, res) => {
  const { file } = req;
  const importService = new ImportTransactionsService()
  const transactions = await importService.execute(file.path)
  return res.json(transactions)

});

export default transactionsRouter;
