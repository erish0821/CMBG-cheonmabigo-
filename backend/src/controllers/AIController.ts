import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { validationResult } from 'express-validator';
import axios from 'axios';

export class AIController {
  private static PYTHON_LLM_URL = process.env.PYTHON_LLM_URL || 'http://localhost:8001';

  static async chatWithAI(req: Request, res: Response) {
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

      const { message, context = {} } = req.body;

      // Call Python LLM service
      const response = await axios.post(`${this.PYTHON_LLM_URL}/api/chat`, {
        message,
        context: {
          ...context,
          user_id: userId
        }
      });

      res.json({
        success: true,
        data: {
          response: response.data.response,
          intent: response.data.intent,
          confidence: response.data.confidence,
          action: response.data.action
        }
      });
    } catch (error) {
      console.error('Chat with AI error:', error);

      if (axios.isAxiosError(error)) {
        return res.status(502).json({
          success: false,
          message: 'AI service unavailable',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async parseTransaction(req: Request, res: Response) {
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

      const { text, auto_save = false } = req.body;

      // Call Python LLM service for transaction parsing
      const response = await axios.post(`${this.PYTHON_LLM_URL}/api/parse-transaction`, {
        text,
        user_id: userId
      });

      const parsedTransaction = response.data.transaction;

      // If auto_save is true and confidence is high enough, save the transaction
      if (auto_save && response.data.confidence >= 0.8) {
        const transactionData = {
          ...parsedTransaction,
          user_id: userId,
          original_text: text,
          ai_parsed: true,
          confidence: response.data.confidence
        };

        const savedTransaction = await Transaction.query().insert(transactionData);

        return res.json({
          success: true,
          data: {
            parsed_transaction: parsedTransaction,
            saved_transaction: savedTransaction,
            confidence: response.data.confidence,
            auto_saved: true
          }
        });
      }

      res.json({
        success: true,
        data: {
          parsed_transaction: parsedTransaction,
          confidence: response.data.confidence,
          auto_saved: false,
          suggestions: response.data.suggestions || []
        }
      });
    } catch (error) {
      console.error('Parse transaction error:', error);

      if (axios.isAxiosError(error)) {
        return res.status(502).json({
          success: false,
          message: 'AI service unavailable',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async generateInsights(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { period = 'month', categories = [] } = req.query;

      // Get recent transactions for context
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
        .where('transaction_date', '<=', now);

      if (categories && Array.isArray(categories) && categories.length > 0) {
        query = query.whereIn('category', categories as string[]);
      }

      const transactions = await query.orderBy('transaction_date', 'desc');

      // Call Python LLM service for insights generation
      const response = await axios.post(`${this.PYTHON_LLM_URL}/api/generate-insights`, {
        transactions,
        period,
        user_id: userId
      });

      res.json({
        success: true,
        data: {
          insights: response.data.insights,
          recommendations: response.data.recommendations,
          period,
          transaction_count: transactions.length,
          generated_at: new Date()
        }
      });
    } catch (error) {
      console.error('Generate insights error:', error);

      if (axios.isAxiosError(error)) {
        return res.status(502).json({
          success: false,
          message: 'AI service unavailable',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getFinancialAdvice(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { question, context = {} } = req.body;

      // Get user's financial context (recent transactions, budgets, etc.)
      const [recentTransactions, monthlySpending] = await Promise.all([
        Transaction.query()
          .where('user_id', userId)
          .orderBy('transaction_date', 'desc')
          .limit(50),
        Transaction.query()
          .where('user_id', userId)
          .where('transaction_date', '>=', new Date(new Date().getFullYear(), new Date().getMonth(), 1))
          .where('is_income', false)
          .groupBy('category')
          .select('category')
          .sum('amount as total')
      ]);

      const financialContext = {
        recent_transactions: recentTransactions,
        monthly_spending: monthlySpending,
        ...context
      };

      // Call Python LLM service for financial advice
      const response = await axios.post(`${this.PYTHON_LLM_URL}/api/financial-advice`, {
        question,
        context: financialContext,
        user_id: userId
      });

      res.json({
        success: true,
        data: {
          advice: response.data.advice,
          confidence: response.data.confidence,
          sources: response.data.sources || [],
          follow_up_questions: response.data.follow_up_questions || [],
          action_items: response.data.action_items || []
        }
      });
    } catch (error) {
      console.error('Get financial advice error:', error);

      if (axios.isAxiosError(error)) {
        return res.status(502).json({
          success: false,
          message: 'AI service unavailable',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async analyzeSpendingPattern(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { months = 3 } = req.query;
      const monthsCount = Number(months);

      // Get spending data for analysis
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsCount);

      const transactions = await Transaction.query()
        .where('user_id', userId)
        .where('is_income', false)
        .where('transaction_date', '>=', startDate)
        .orderBy('transaction_date', 'desc');

      // Call Python LLM service for pattern analysis
      const response = await axios.post(`${this.PYTHON_LLM_URL}/api/analyze-spending`, {
        transactions,
        months: monthsCount,
        user_id: userId
      });

      res.json({
        success: true,
        data: {
          patterns: response.data.patterns,
          trends: response.data.trends,
          anomalies: response.data.anomalies,
          predictions: response.data.predictions,
          recommendations: response.data.recommendations,
          analysis_period: `${monthsCount}Ô`,
          transaction_count: transactions.length
        }
      });
    } catch (error) {
      console.error('Analyze spending pattern error:', error);

      if (axios.isAxiosError(error)) {
        return res.status(502).json({
          success: false,
          message: 'AI service unavailable',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getPersonalizedTips(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { category, goal_type } = req.query;

      // Get user's financial profile
      const [transactions, budgets, goals] = await Promise.all([
        Transaction.query()
          .where('user_id', userId)
          .orderBy('transaction_date', 'desc')
          .limit(100),
        // Note: Budget and Goal models would need to be implemented
        // Budget.query().where('user_id', userId).where('is_active', true),
        // Goal.query().where('user_id', userId).where('status', 'active')
        [],
        []
      ]);

      const userProfile = {
        transactions,
        budgets,
        goals,
        preferences: {
          category,
          goal_type
        }
      };

      // Call Python LLM service for personalized tips
      const response = await axios.post(`${this.PYTHON_LLM_URL}/api/personalized-tips`, {
        user_profile: userProfile,
        user_id: userId
      });

      res.json({
        success: true,
        data: {
          tips: response.data.tips,
          priority_level: response.data.priority_level,
          estimated_impact: response.data.estimated_impact,
          difficulty_level: response.data.difficulty_level,
          category: category || 'general',
          personalization_score: response.data.personalization_score
        }
      });
    } catch (error) {
      console.error('Get personalized tips error:', error);

      if (axios.isAxiosError(error)) {
        return res.status(502).json({
          success: false,
          message: 'AI service unavailable',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}