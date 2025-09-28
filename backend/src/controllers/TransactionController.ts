import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { validationResult } from 'express-validator';

export class TransactionController {
  static async createTransaction(req: Request, res: Response) {
    try {
      console.log('🔍 Transaction 생성 요청 받음:');
      console.log('- req.body:', JSON.stringify(req.body, null, 2));
      console.log('- req.user:', req.user);
      console.log('- req.user?.id:', req.user?.id);
      console.log('- req.user?.id 타입:', typeof req.user?.id);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation 오류:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const transactionData = {
        ...req.body,
        user_id: String(userId)  // 숫자를 문자열로 변환
      };

      console.log('📦 최종 transactionData:', JSON.stringify(transactionData, null, 2));
      console.log('🔢 transactionData.user_id 타입:', typeof transactionData.user_id);

      const transaction = await Transaction.query().insert(transactionData);

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getTransactions(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const {
        page = 1,
        limit = 20,
        category,
        start_date,
        end_date,
        is_income,
        search
      } = req.query;

      let query = Transaction.query()
        .where('user_id', userId)
        .orderBy('transaction_date', 'desc');

      // Apply filters
      if (category) {
        query = query.where('category', category as string);
      }

      if (start_date) {
        query = query.where('transaction_date', '>=', start_date as string);
      }

      if (end_date) {
        query = query.where('transaction_date', '<=', end_date as string);
      }

      if (is_income !== undefined) {
        query = query.where('is_income', is_income === 'true');
      }

      if (search) {
        query = query.where(function() {
          this.where('description', 'ilike', `%${search}%`)
            .orWhere('location', 'ilike', `%${search}%`);
        });
      }

      const transactions = await query.page(
        Number(page) - 1,
        Number(limit)
      );

      res.json({
        success: true,
        data: transactions.results,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: transactions.total
        }
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getTransaction(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const transactionId = req.params.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const transaction = await Transaction.query()
        .findById(transactionId)
        .where('user_id', userId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async updateTransaction(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user?.id;
      const transactionId = req.params.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const updateData = {
        ...req.body,
        user_modified: true,
        updated_at: new Date()
      };

      const transaction = await Transaction.query()
        .findById(transactionId)
        .where('user_id', userId)
        .patch(updateData)
        .returning('*')
        .first();

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        message: 'Transaction updated successfully',
        data: transaction
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async deleteTransaction(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const transactionId = req.params.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const deletedCount = await Transaction.query()
        .deleteById(transactionId)
        .where('user_id', userId);

      if (deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        message: 'Transaction deleted successfully'
      });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async bulkCreateTransactions(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { transactions } = req.body;

      const transactionsWithUserId = transactions.map((transaction: any) => ({
        ...transaction,
        user_id: String(userId)  // 숫자를 문자열로 변환
      }));

      const createdTransactions = await Transaction.query()
        .insert(transactionsWithUserId);

      res.status(201).json({
        success: true,
        message: `${createdTransactions.length} transactions created successfully`,
        data: createdTransactions
      });
    } catch (error) {
      console.error('Bulk create transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getTransactionSummary(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { start_date, end_date } = req.query;

      let query = Transaction.query().where('user_id', userId);

      if (start_date) {
        query = query.where('transaction_date', '>=', start_date as string);
      }

      if (end_date) {
        query = query.where('transaction_date', '<=', end_date as string);
      }

      const [incomeResult, expenseResult] = await Promise.all([
        query.clone().where('is_income', true).sum('amount as total').first(),
        query.clone().where('is_income', false).sum('amount as total').first()
      ]);

      const totalIncome = Number(incomeResult?.total || 0);
      const totalExpense = Number(expenseResult?.total || 0);

      res.json({
        success: true,
        data: {
          total_income: totalIncome,
          total_expense: totalExpense,
          net_amount: totalIncome - totalExpense,
          period: {
            start_date,
            end_date
          }
        }
      });
    } catch (error) {
      console.error('Get transaction summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}