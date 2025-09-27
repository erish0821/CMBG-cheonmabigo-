import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';

export class AnalyticsController {
  static async getSummary(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { period = 'month' } = req.query;

      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const query = Transaction.query()
        .where('user_id', userId)
        .where('transaction_date', '>=', startDate)
        .where('transaction_date', '<=', now);

      const [
        totalIncomeResult,
        totalExpenseResult,
        transactionCount,
        categoryBreakdown
      ] = await Promise.all([
        query.clone().where('is_income', true).sum('amount as total').first(),
        query.clone().where('is_income', false).sum('amount as total').first(),
        query.clone().count('* as count').first(),
        query.clone()
          .where('is_income', false)
          .groupBy('category')
          .select('category')
          .sum('amount as total')
          .orderBy('total', 'desc')
      ]);

      const totalIncome = Number(totalIncomeResult?.total || 0);
      const totalExpense = Number(totalExpenseResult?.total || 0);

      res.json({
        success: true,
        data: {
          period,
          date_range: {
            start: startDate,
            end: now
          },
          summary: {
            total_income: totalIncome,
            total_expense: totalExpense,
            net_amount: totalIncome - totalExpense,
            transaction_count: Number(transactionCount?.count || 0)
          },
          category_breakdown: categoryBreakdown
        }
      });
    } catch (error) {
      console.error('Get analytics summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getTrends(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { period = 'month', months = 6 } = req.query;
      const monthsCount = Number(months);

      const trends = [];
      const now = new Date();

      for (let i = monthsCount - 1; i >= 0; i--) {
        const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const query = Transaction.query()
          .where('user_id', userId)
          .where('transaction_date', '>=', startDate)
          .where('transaction_date', '<=', endDate);

        const [incomeResult, expenseResult] = await Promise.all([
          query.clone().where('is_income', true).sum('amount as total').first(),
          query.clone().where('is_income', false).sum('amount as total').first()
        ]);

        trends.push({
          month: startDate.toISOString().substring(0, 7),
          income: Number(incomeResult?.total || 0),
          expense: Number(expenseResult?.total || 0),
          net: Number(incomeResult?.total || 0) - Number(expenseResult?.total || 0)
        });
      }

      res.json({
        success: true,
        data: {
          period,
          trends
        }
      });
    } catch (error) {
      console.error('Get analytics trends error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getCategoryAnalysis(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { period = 'month', category } = req.query;

      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      let query = Transaction.query()
        .where('user_id', userId)
        .where('transaction_date', '>=', startDate)
        .where('transaction_date', '<=', now)
        .where('is_income', false);

      if (category) {
        query = query.where('category', category as string);
      }

      const [
        categoryTotals,
        dailyBreakdown,
        averageTransaction
      ] = await Promise.all([
        query.clone()
          .groupBy('category')
          .select('category')
          .sum('amount as total')
          .count('* as count')
          .orderBy('total', 'desc'),
        query.clone()
          .select(Transaction.raw('DATE(transaction_date) as date'))
          .sum('amount as total')
          .groupBy(Transaction.raw('DATE(transaction_date)'))
          .orderBy('date'),
        query.clone().avg('amount as average').first()
      ]);

      res.json({
        success: true,
        data: {
          period,
          category,
          date_range: {
            start: startDate,
            end: now
          },
          category_totals: categoryTotals,
          daily_breakdown: dailyBreakdown,
          average_transaction: Number(averageTransaction?.average || 0)
        }
      });
    } catch (error) {
      console.error('Get category analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getInsights(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Current month data
      const currentMonthQuery = Transaction.query()
        .where('user_id', userId)
        .where('transaction_date', '>=', currentMonthStart)
        .where('transaction_date', '<=', now);

      // Last month data
      const lastMonthQuery = Transaction.query()
        .where('user_id', userId)
        .where('transaction_date', '>=', lastMonthStart)
        .where('transaction_date', '<=', lastMonthEnd);

      const [
        currentMonthExpense,
        lastMonthExpense,
        topCategories,
        unusualTransactions
      ] = await Promise.all([
        currentMonthQuery.clone().where('is_income', false).sum('amount as total').first(),
        lastMonthQuery.clone().where('is_income', false).sum('amount as total').first(),
        currentMonthQuery.clone()
          .where('is_income', false)
          .groupBy('category')
          .select('category')
          .sum('amount as total')
          .orderBy('total', 'desc')
          .limit(5),
        currentMonthQuery.clone()
          .where('is_income', false)
          .where('amount', '>', 100000) // Transactions over 100,000 KRW
          .orderBy('amount', 'desc')
          .limit(10)
      ]);

      const currentExpense = Number(currentMonthExpense?.total || 0);
      const lastExpense = Number(lastMonthExpense?.total || 0);
      const changePercent = lastExpense > 0 ? ((currentExpense - lastExpense) / lastExpense) * 100 : 0;

      const insights = [];

      // Spending comparison insight
      if (Math.abs(changePercent) > 10) {
        insights.push({
          type: changePercent > 0 ? 'warning' : 'positive',
          title: changePercent > 0 ? '¿ú ù  Lº' : '¿ú å ïX',
          message: `tà Ï ¿út ¿ú Ï  D ${Math.abs(changePercent).toFixed(1)}% ${changePercent > 0 ? 'ù ' : 'å'}à¥î.`,
          value: changePercent
        });
      }

      // Top category insight
      if (topCategories.length > 0) {
        const topCategory = topCategories[0];
        insights.push({
          type: 'info',
          title: '\  ¿ú tL‡¨',
          message: `tà Ï  • Œt ¿ú\ tL‡¨î ${topCategory.category}Ö»‰.`,
          value: Number(topCategory.total)
        });
      }

      // Unusual transactions insight
      if (unusualTransactions.length > 0) {
        insights.push({
          type: 'info',
          title: '‡a pò',
          message: `tà Ï 10Ã– t¡X pò  ${unusualTransactions.length}t à»¥î.`,
          value: unusualTransactions.length
        });
      }

      res.json({
        success: true,
        data: {
          insights,
          spending_comparison: {
            current_month: currentExpense,
            last_month: lastExpense,
            change_percent: changePercent
          },
          top_categories: topCategories,
          unusual_transactions: unusualTransactions
        }
      });
    } catch (error) {
      console.error('Get insights error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getBudgetAnalysis(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get active budgets for current period
      const budgets = await Budget.query()
        .where('user_id', userId)
        .where('is_active', true)
        .where('start_date', '<=', now)
        .where('end_date', '>=', now);

      const budgetAnalysis = [];

      for (const budget of budgets) {
        // Calculate spent amount for this budget's category
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

        budgetAnalysis.push({
          budget_id: budget.id,
          name: budget.name,
          category: budget.category,
          budget_amount: budgetAmount,
          spent_amount: spentAmount,
          remaining_amount: budgetAmount - spentAmount,
          usage_percent: usagePercent,
          status: usagePercent >= budget.alert_threshold ? 'warning' : 'normal',
          alert_threshold: budget.alert_threshold,
          period: budget.period,
          start_date: budget.start_date,
          end_date: budget.end_date
        });
      }

      res.json({
        success: true,
        data: {
          budget_analysis: budgetAnalysis,
          summary: {
            total_budgets: budgets.length,
            budgets_over_threshold: budgetAnalysis.filter(b => b.status === 'warning').length,
            average_usage: budgetAnalysis.length > 0
              ? budgetAnalysis.reduce((sum, b) => sum + b.usage_percent, 0) / budgetAnalysis.length
              : 0
          }
        }
      });
    } catch (error) {
      console.error('Get budget analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}