import { BaseModel } from './BaseModel';
import { User } from './User';

export type TransactionCategory =
  | 'FOOD_DINING'
  | 'TRANSPORTATION'
  | 'SHOPPING'
  | 'ENTERTAINMENT'
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'INCOME'
  | 'UTILITY'
  | 'TRAVEL'
  | 'OTHER';

export type PaymentMethod = 'CARD' | 'CASH' | 'TRANSFER' | 'MOBILE_PAY';

export class Transaction extends BaseModel {
  static tableName = 'transactions';

  user_id!: string;
  amount!: number;
  description!: string;
  category!: TransactionCategory;
  subcategory?: string;
  is_income!: boolean;
  payment_method!: PaymentMethod;
  location?: string;
  tags!: string[];
  confidence?: number;
  original_text?: string;
  ai_parsed!: boolean;
  user_modified!: boolean;
  transaction_date!: Date;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'amount', 'description', 'category', 'transaction_date'],
      properties: {
        id: { type: 'string' },
        user_id: { type: 'string' },
        amount: { type: 'number', minimum: 0 },
        description: { type: 'string', minLength: 1 },
        category: {
          type: 'string',
          enum: [
            'FOOD_DINING',
            'TRANSPORTATION',
            'SHOPPING',
            'ENTERTAINMENT',
            'HEALTHCARE',
            'EDUCATION',
            'INCOME',
            'UTILITY',
            'TRAVEL',
            'OTHER'
          ]
        },
        subcategory: { type: ['string', 'null'], maxLength: 100 },
        is_income: { type: 'boolean', default: false },
        payment_method: {
          type: 'string',
          enum: ['CARD', 'CASH', 'TRANSFER', 'MOBILE_PAY'],
          default: 'CARD'
        },
        location: { type: ['string', 'null'], maxLength: 255 },
        tags: { type: 'array', items: { type: 'string' }, default: [] },
        confidence: { type: ['number', 'null'], minimum: 0, maximum: 1 },
        original_text: { type: ['string', 'null'] },
        ai_parsed: { type: 'boolean', default: false },
        user_modified: { type: 'boolean', default: false },
        transaction_date: { type: 'string', format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'transactions.user_id',
          to: 'users.id'
        }
      }
    };
  }

  $beforeInsert() {
    super.$beforeInsert();
    this.is_income = this.is_income ?? false;
    this.payment_method = this.payment_method ?? 'CARD';
    this.tags = this.tags ?? [];
    this.ai_parsed = this.ai_parsed ?? false;
    this.user_modified = this.user_modified ?? false;

    if (!this.transaction_date) {
      this.transaction_date = new Date();
    }
  }

  static get modifiers() {
    return {
      byCategory(query: any, category: TransactionCategory) {
        query.where('category', category);
      },
      byDateRange(query: any, startDate: Date, endDate: Date) {
        query.where('transaction_date', '>=', startDate)
             .where('transaction_date', '<=', endDate);
      },
      expenses(query: any) {
        query.where('is_income', false);
      },
      income(query: any) {
        query.where('is_income', true);
      },
      recent(query: any, limit = 10) {
        query.orderBy('transaction_date', 'desc').limit(limit);
      }
    };
  }

  // Helper methods
  get isExpense(): boolean {
    return !this.is_income;
  }

  get formattedAmount(): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(this.amount);
  }
}