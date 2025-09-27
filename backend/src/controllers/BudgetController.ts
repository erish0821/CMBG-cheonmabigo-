import { Request, Response } from 'express';
import { Budget } from '../models/Budget';
import { Transaction } from '../models/Transaction';
import { validationResult } from 'express-validator';

export class BudgetController {
  static async createBudget(req: Request, res: Response) {
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

      const budgetData = {
        ...req.body,
        user_id: userId
      };

      const budget = await Budget.query().insert(budgetData);

      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: budget
      });
    } catch (error) {
      console.error('Create budget error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getBudgets(req: Request, res: Response) {
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
        period,
        is_active
      } = req.query;

      let query = Budget.query()
        .where('user_id', userId)
        .orderBy('created_at', 'desc');

      // Apply filters
      if (category) {
        query = query.where('category', category as string);
      }

      if (period) {
        query = query.where('period', period as string);
      }

      if (is_active !== undefined) {
        query = query.where('is_active', is_active === 'true');
      }

      const budgets = await query.page(
        Number(page) - 1,
        Number(limit)
      );

      // Calculate usage for each budget
      const budgetsWithUsage = await Promise.all(
        budgets.results.map(async (budget) => {
          let spentQuery = Transaction.query()
            .where('user_id', userId)
            .where('is_income', false)
            .where('transaction_date', '>=', budget.start_date)
            .where('transaction_date', '<=', budget.end_date);

          if (budget.category !== 'TOTAL') {
            spentQuery = spentQuery.where('category', budget.category);
          }

          const spentResult = await spentQuery.sum('amount as total').first();
          const spentAmount = Number(spentResult?.total || 0);
          const budgetAmount = Number(budget.amount);
          const usagePercent = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

          return {
            ...budget,
            spent_amount: spentAmount,
            remaining_amount: budgetAmount - spentAmount,
            usage_percent: usagePercent,
            status: usagePercent >= budget.alert_threshold ? 'warning' : 'normal'
          };
        })
      );

      res.json({
        success: true,
        data: budgetsWithUsage,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: budgets.total
        }
      });
    } catch (error) {
      console.error('Get budgets error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getBudget(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const budgetId = req.params.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const budget = await Budget.query()
        .findById(budgetId)
        .where('user_id', userId);

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found'
        });
      }

      // Calculate usage
      let spentQuery = Transaction.query()
        .where('user_id', userId)
        .where('is_income', false)
        .where('transaction_date', '>=', budget.start_date)
        .where('transaction_date', '<=', budget.end_date);

      if (budget.category !== 'TOTAL') {
        spentQuery = spentQuery.where('category', budget.category);
      }

      const [spentResult, transactions] = await Promise.all([
        spentQuery.clone().sum('amount as total').first(),
        spentQuery.clone().orderBy('transaction_date', 'desc').limit(10)
      ]);

      const spentAmount = Number(spentResult?.total || 0);
      const budgetAmount = Number(budget.amount);
      const usagePercent = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

      const budgetWithUsage = {
        ...budget,
        spent_amount: spentAmount,
        remaining_amount: budgetAmount - spentAmount,
        usage_percent: usagePercent,
        status: usagePercent >= budget.alert_threshold ? 'warning' : 'normal',
        recent_transactions: transactions
      };

      res.json({
        success: true,
        data: budgetWithUsage
      });
    } catch (error) {
      console.error('Get budget error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async updateBudget(req: Request, res: Response) {
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
      const budgetId = req.params.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const updateData = {
        ...req.body,
        updated_at: new Date()
      };

      const budget = await Budget.query()
        .findById(budgetId)
        .where('user_id', userId)
        .patch(updateData)
        .returning('*')
        .first();

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found'
        });
      }

      res.json({
        success: true,
        message: 'Budget updated successfully',
        data: budget
      });
    } catch (error) {
      console.error('Update budget error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async deleteBudget(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const budgetId = req.params.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const deletedCount = await Budget.query()
        .deleteById(budgetId)
        .where('user_id', userId);

      if (deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found'
        });
      }

      res.json({
        success: true,
        message: 'Budget deleted successfully'
      });
    } catch (error) {
      console.error('Delete budget error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getBudgetTemplates(req: Request, res: Response) {
    try {
      const templates = [
        {
          name: '0¯ ‘ ∞',
          period: 'monthly',
          categories: [
            { category: 'FOOD_DINING', amount: 300000, description: '›D' },
            { category: 'TRANSPORTATION', amount: 150000, description: 'PµD' },
            { category: 'SHOPPING', amount: 200000, description: '¸Q' },
            { category: 'ENTERTAINMENT', amount: 100000, description: '$}' },
            { category: 'UTILITY', amount: 100000, description: 'ı¸' }
          ]
        },
        {
          name: '} ∞',
          period: 'monthly',
          categories: [
            { category: 'FOOD_DINING', amount: 200000, description: '›D' },
            { category: 'TRANSPORTATION', amount: 100000, description: 'PµD' },
            { category: 'SHOPPING', amount: 100000, description: '¸Q' },
            { category: 'ENTERTAINMENT', amount: 50000, description: '$}' },
            { category: 'UTILITY', amount: 80000, description: 'ı¸' }
          ]
        },
        {
          name: 'Ï  ∞',
          period: 'monthly',
          categories: [
            { category: 'FOOD_DINING', amount: 500000, description: '›D' },
            { category: 'TRANSPORTATION', amount: 200000, description: 'PµD' },
            { category: 'SHOPPING', amount: 400000, description: '¸Q' },
            { category: 'ENTERTAINMENT', amount: 200000, description: '$}' },
            { category: 'UTILITY', amount: 150000, description: 'ı¸' },
            { category: 'TRAVEL', amount: 300000, description: 'Ïâ' }
          ]
        }
      ];

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Get budget templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async createBudgetFromTemplate(req: Request, res: Response) {
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

      const { template_name, start_date, adjustments = {} } = req.body;

      // Get template data (in real app, this might come from database)
      const templates = {
        '0¯ ‘ ∞': [
          { category: 'FOOD_DINING', amount: 300000, name: '›D' },
          { category: 'TRANSPORTATION', amount: 150000, name: 'PµD' },
          { category: 'SHOPPING', amount: 200000, name: '¸Q' },
          { category: 'ENTERTAINMENT', amount: 100000, name: '$}' },
          { category: 'UTILITY', amount: 100000, name: 'ı¸' }
        ],
        '} ∞': [
          { category: 'FOOD_DINING', amount: 200000, name: '›D' },
          { category: 'TRANSPORTATION', amount: 100000, name: 'PµD' },
          { category: 'SHOPPING', amount: 100000, name: '¸Q' },
          { category: 'ENTERTAINMENT', amount: 50000, name: '$}' },
          { category: 'UTILITY', amount: 80000, name: 'ı¸' }
        ],
        'Ï  ∞': [
          { category: 'FOOD_DINING', amount: 500000, name: '›D' },
          { category: 'TRANSPORTATION', amount: 200000, name: 'PµD' },
          { category: 'SHOPPING', amount: 400000, name: '¸Q' },
          { category: 'ENTERTAINMENT', amount: 200000, name: '$}' },
          { category: 'UTILITY', amount: 150000, name: 'ı¸' },
          { category: 'TRAVEL', amount: 300000, name: 'Ïâ' }
        ]
      };

      const templateData = templates[template_name as keyof typeof templates];
      if (!templateData) {
        return res.status(400).json({
          success: false,
          message: 'Invalid template name'
        });
      }

      const startDate = new Date(start_date);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      const budgets = templateData.map(item => ({
        user_id: userId,
        name: item.name,
        category: item.category,
        amount: adjustments[item.category] || item.amount,
        period: 'monthly',
        start_date: startDate,
        end_date: endDate,
        alert_threshold: 80,
        is_active: true
      }));

      const createdBudgets = await Budget.query().insert(budgets);

      res.status(201).json({
        success: true,
        message: `${createdBudgets.length} budgets created from template`,
        data: createdBudgets
      });
    } catch (error) {
      console.error('Create budget from template error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getBudgetRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Analyze last 3 months of spending to make recommendations
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const spendingAnalysis = await Transaction.query()
        .where('user_id', userId)
        .where('is_income', false)
        .where('transaction_date', '>=', threeMonthsAgo)
        .groupBy('category')
        .select('category')
        .avg('amount as avg_amount')
        .sum('amount as total_amount')
        .count('* as transaction_count');

      const recommendations = spendingAnalysis.map(analysis => {
        const avgMonthlySpend = Number(analysis.total_amount) / 3;
        const recommendedBudget = Math.ceil(avgMonthlySpend * 1.1); // 10% buffer

        return {
          category: analysis.category,
          current_avg_monthly: avgMonthlySpend,
          recommended_budget: recommendedBudget,
          reasoning: `¿ú 3‘ …‡ ¿úX 110%\ $XÏ Ï | P»µ»‰.`,
          transaction_count: Number(analysis.transaction_count)
        };
      });

      res.json({
        success: true,
        data: {
          analysis_period: '3‘',
          recommendations
        }
      });
    } catch (error) {
      console.error('Get budget recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}