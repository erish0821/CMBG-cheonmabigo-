import { Request, Response } from 'express';
import { Budget } from '../models/Budget';
import { Transaction } from '../models/Transaction';

export class BudgetController {
  static async createBudget(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { startDate, endDate, alertThreshold, isActive, autoRenew, ...otherData } = req.body;

      const budgetData = {
        ...otherData,
        user_id: userId.toString(),
        start_date: startDate,
        end_date: endDate,
        alert_threshold: alertThreshold,
        is_active: isActive,
        auto_renew: autoRenew
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
          name: '0� � �',
          period: 'monthly',
          categories: [
            { category: 'FOOD_DINING', amount: 300000, description: '�D' },
            { category: 'TRANSPORTATION', amount: 150000, description: 'P�D' },
            { category: 'SHOPPING', amount: 200000, description: '�Q' },
            { category: 'ENTERTAINMENT', amount: 100000, description: '$}' },
            { category: 'UTILITY', amount: 100000, description: '��' }
          ]
        },
        {
          name: '} �',
          period: 'monthly',
          categories: [
            { category: 'FOOD_DINING', amount: 200000, description: '�D' },
            { category: 'TRANSPORTATION', amount: 100000, description: 'P�D' },
            { category: 'SHOPPING', amount: 100000, description: '�Q' },
            { category: 'ENTERTAINMENT', amount: 50000, description: '$}' },
            { category: 'UTILITY', amount: 80000, description: '��' }
          ]
        },
        {
          name: '�  �',
          period: 'monthly',
          categories: [
            { category: 'FOOD_DINING', amount: 500000, description: '�D' },
            { category: 'TRANSPORTATION', amount: 200000, description: 'P�D' },
            { category: 'SHOPPING', amount: 400000, description: '�Q' },
            { category: 'ENTERTAINMENT', amount: 200000, description: '$}' },
            { category: 'UTILITY', amount: 150000, description: '��' },
            { category: 'TRAVEL', amount: 300000, description: '�' }
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
        '0� � �': [
          { category: 'FOOD_DINING', amount: 300000, name: '�D' },
          { category: 'TRANSPORTATION', amount: 150000, name: 'P�D' },
          { category: 'SHOPPING', amount: 200000, name: '�Q' },
          { category: 'ENTERTAINMENT', amount: 100000, name: '$}' },
          { category: 'UTILITY', amount: 100000, name: '��' }
        ],
        '} �': [
          { category: 'FOOD_DINING', amount: 200000, name: '�D' },
          { category: 'TRANSPORTATION', amount: 100000, name: 'P�D' },
          { category: 'SHOPPING', amount: 100000, name: '�Q' },
          { category: 'ENTERTAINMENT', amount: 50000, name: '$}' },
          { category: 'UTILITY', amount: 80000, name: '��' }
        ],
        '�  �': [
          { category: 'FOOD_DINING', amount: 500000, name: '�D' },
          { category: 'TRANSPORTATION', amount: 200000, name: 'P�D' },
          { category: 'SHOPPING', amount: 400000, name: '�Q' },
          { category: 'ENTERTAINMENT', amount: 200000, name: '$}' },
          { category: 'UTILITY', amount: 150000, name: '��' },
          { category: 'TRAVEL', amount: 300000, name: '�' }
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
          reasoning: `�� 3� �� ��X 110%\ $X� � | Pȵ��.`,
          transaction_count: Number(analysis.transaction_count)
        };
      });

      res.json({
        success: true,
        data: {
          analysis_period: '3�',
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

  static async getBudgetProgress(req: Request, res: Response) {
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

      // Calculate detailed progress
      let spentQuery = Transaction.query()
        .where('user_id', userId)
        .where('is_income', false)
        .where('transaction_date', '>=', budget.start_date)
        .where('transaction_date', '<=', budget.end_date);

      if (budget.category !== 'TOTAL') {
        spentQuery = spentQuery.where('category', budget.category);
      }

      const [spentResult, dailySpending] = await Promise.all([
        spentQuery.clone().sum('amount as total').first(),
        spentQuery.clone()
          .select(Transaction.raw('DATE(transaction_date) as date'))
          .sum('amount as amount')
          .groupBy(Transaction.raw('DATE(transaction_date)'))
          .orderBy('date', 'desc')
      ]);

      const spentAmount = Number(spentResult?.total || 0);
      const budgetAmount = Number(budget.amount);
      const usagePercent = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

      // Calculate time-based metrics
      const startDate = new Date(budget.start_date);
      const endDate = new Date(budget.end_date);
      const currentDate = new Date();

      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, totalDays - daysElapsed);

      const timeProgressPercent = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
      const dailyAverageSpent = daysElapsed > 0 ? spentAmount / daysElapsed : 0;
      const recommendedDailySpending = daysRemaining > 0 ? (budgetAmount - spentAmount) / daysRemaining : 0;

      res.json({
        success: true,
        data: {
          budget_id: budgetId,
          budget_amount: budgetAmount,
          spent_amount: spentAmount,
          remaining_amount: budgetAmount - spentAmount,
          usage_percent: Math.round(usagePercent * 100) / 100,
          time_progress_percent: Math.round(timeProgressPercent * 100) / 100,
          days_elapsed: daysElapsed,
          days_remaining: daysRemaining,
          daily_average_spent: Math.round(dailyAverageSpent),
          recommended_daily_spending: Math.round(recommendedDailySpending),
          is_on_track: usagePercent <= timeProgressPercent,
          status: usagePercent >= budget.alert_threshold ? 'warning' : 'normal',
          daily_spending: dailySpending
        }
      });
    } catch (error) {
      console.error('Get budget progress error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * 예산 요약 정보 조회
   */
  static async getBudgetSummary(req: Request, res: Response) {
    try {
      console.log('=== getBudgetSummary 시작 ===');
      const userId = req.user?.id;
      console.log('사용자 ID:', userId);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // 활성 예산 조회
      console.log('예산 조회 시작...');
      const budgets = await Budget.query()
        .where('user_id', userId.toString())
        .where('is_active', true);

      console.log('조회된 예산:', budgets);

      if (budgets.length === 0) {
        console.log('활성 예산이 없음, 기본값 반환');
        return res.json({
          success: true,
          data: {
            totalBudget: 0,
            totalSpent: 0,
            totalRemaining: 0,
            budgetProgress: 0,
            dailyRecommended: 0,
            status: 'good'
          }
        });
      }

      // 현재 달 범위 계산
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      console.log('월 범위:', {
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString()
      });

      // 이번 달 지출 총액 계산
      console.log('거래 내역 조회 시작...');
      const transactions = await Transaction.query()
        .where('user_id', userId.toString())
        .where('is_income', false)
        .where('transaction_date', '>=', startOfMonth.toISOString())
        .where('transaction_date', '<=', endOfMonth.toISOString());

      console.log('조회된 거래 내역:', transactions);

      const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
      const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      const totalRemaining = Math.max(0, totalBudget - totalSpent);
      const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      // 일일 권장 지출액 계산
      const daysInMonth = endOfMonth.getDate();
      const daysRemaining = Math.max(1, daysInMonth - now.getDate() + 1);
      const dailyRecommended = Math.round(totalRemaining / daysRemaining);

      // 상태 계산
      let status: 'good' | 'warning' | 'over';
      if (budgetProgress <= 70) {
        status = 'good';
      } else if (budgetProgress <= 100) {
        status = 'warning';
      } else {
        status = 'over';
      }

      console.log('예산 요약 계산 완료:', {
        totalBudget,
        totalSpent,
        totalRemaining,
        budgetProgress: Math.round(budgetProgress * 100) / 100,
        dailyRecommended,
        status
      });

      res.json({
        success: true,
        data: {
          totalBudget,
          totalSpent,
          totalRemaining,
          budgetProgress: Math.round(budgetProgress * 100) / 100,
          dailyRecommended,
          status
        }
      });
    } catch (error) {
      console.error('Get budget summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}