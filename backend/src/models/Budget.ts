import { BaseModel } from './BaseModel';
import { User } from './User';
import { TransactionCategory } from './Transaction';

export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export class Budget extends BaseModel {
  static tableName = 'budgets';

  user_id!: string;
  name!: string;
  amount!: number;
  category!: TransactionCategory | 'TOTAL';
  period!: BudgetPeriod;
  start_date!: Date;
  end_date!: Date;
  alert_threshold!: number;
  is_active!: boolean;
  auto_renew!: boolean;
  description?: string;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'name', 'amount', 'category', 'period', 'start_date', 'end_date'],
      properties: {
        id: { type: 'string' },
        user_id: { type: 'string' },
        name: { type: 'string', minLength: 1, maxLength: 100 },
        amount: { type: 'number', minimum: 0 },
        category: {
          type: 'string',
          enum: [
            'FOOD_DINING',
            'TRANSPORTATION',
            'SHOPPING',
            'ENTERTAINMENT',
            'HEALTHCARE',
            'EDUCATION',
            'UTILITY',
            'TRAVEL',
            'OTHER',
            'TOTAL'
          ]
        },
        period: {
          type: 'string',
          enum: ['weekly', 'monthly', 'quarterly', 'yearly']
        },
        start_date: { type: 'string', format: 'date' },
        end_date: { type: 'string', format: 'date' },
        alert_threshold: { type: 'number', minimum: 0, maximum: 100, default: 80 },
        is_active: { type: 'boolean', default: true },
        auto_renew: { type: 'boolean', default: false },
        description: { type: ['string', 'null'] },
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
          from: 'budgets.user_id',
          to: 'users.id'
        }
      }
    };
  }

  $beforeInsert() {
    super.$beforeInsert();
    this.alert_threshold = this.alert_threshold ?? 80;
    this.is_active = this.is_active ?? true;
    this.auto_renew = this.auto_renew ?? false;
  }

  static get modifiers() {
    return {
      active(query: any) {
        query.where('is_active', true);
      },
      byCategory(query: any, category: TransactionCategory | 'TOTAL') {
        query.where('category', category);
      },
      byPeriod(query: any, period: BudgetPeriod) {
        query.where('period', period);
      },
      current(query: any) {
        const now = new Date();
        query.where('start_date', '<=', now)
             .where('end_date', '>=', now);
      }
    };
  }

  // Helper methods
  get isCurrentlyActive(): boolean {
    const now = new Date();
    return this.is_active &&
           new Date(this.start_date) <= now &&
           new Date(this.end_date) >= now;
  }

  get formattedAmount(): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(this.amount);
  }

  get daysRemaining(): number {
    const now = new Date();
    const endDate = new Date(this.end_date);
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}