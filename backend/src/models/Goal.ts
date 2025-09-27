import { BaseModel } from './BaseModel';
import { User } from './User';

export type GoalType =
  | 'saving'
  | 'debt_reduction'
  | 'investment'
  | 'emergency_fund'
  | 'retirement'
  | 'vacation'
  | 'education'
  | 'home_purchase'
  | 'other';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export class Goal extends BaseModel {
  static tableName = 'goals';

  user_id!: string;
  title!: string;
  description?: string;
  target_amount!: number;
  current_amount!: number;
  goal_type!: GoalType;
  target_date?: Date;
  start_date!: Date;
  status!: GoalStatus;
  monthly_contribution?: number;
  priority!: number;
  metadata?: object;
  is_automated!: boolean;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'title', 'target_amount', 'goal_type'],
      properties: {
        id: { type: 'string' },
        user_id: { type: 'string' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: ['string', 'null'] },
        target_amount: { type: 'number', minimum: 0 },
        current_amount: { type: 'number', minimum: 0, default: 0 },
        goal_type: {
          type: 'string',
          enum: [
            'saving',
            'debt_reduction',
            'investment',
            'emergency_fund',
            'retirement',
            'vacation',
            'education',
            'home_purchase',
            'other'
          ]
        },
        target_date: { type: ['string', 'null'], format: 'date' },
        start_date: { type: 'string', format: 'date' },
        status: {
          type: 'string',
          enum: ['active', 'completed', 'paused', 'cancelled'],
          default: 'active'
        },
        monthly_contribution: { type: ['number', 'null'], minimum: 0 },
        priority: { type: 'integer', minimum: 1, maximum: 5, default: 1 },
        metadata: { type: ['object', 'null'] },
        is_automated: { type: 'boolean', default: false },
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
          from: 'goals.user_id',
          to: 'users.id'
        }
      }
    };
  }

  $beforeInsert() {
    super.$beforeInsert();
    this.current_amount = this.current_amount ?? 0;
    this.status = this.status ?? 'active';
    this.priority = this.priority ?? 1;
    this.is_automated = this.is_automated ?? false;

    if (!this.start_date) {
      this.start_date = new Date();
    }
  }

  static get modifiers() {
    return {
      active(query: any) {
        query.where('status', 'active');
      },
      byType(query: any, goalType: GoalType) {
        query.where('goal_type', goalType);
      },
      byPriority(query: any, priority: number) {
        query.where('priority', priority);
      },
      highPriority(query: any) {
        query.where('priority', '<=', 2).orderBy('priority');
      },
      completed(query: any) {
        query.where('status', 'completed');
      },
      nearTarget(query: any, threshold = 0.9) {
        query.whereRaw('current_amount >= target_amount * ?', [threshold]);
      }
    };
  }

  // Helper methods
  get progressPercentage(): number {
    if (this.target_amount <= 0) return 0;
    return Math.min((this.current_amount / this.target_amount) * 100, 100);
  }

  get remainingAmount(): number {
    return Math.max(this.target_amount - this.current_amount, 0);
  }

  get isCompleted(): boolean {
    return this.status === 'completed' || this.current_amount >= this.target_amount;
  }

  get formattedTargetAmount(): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(this.target_amount);
  }

  get formattedCurrentAmount(): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(this.current_amount);
  }

  get formattedRemainingAmount(): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(this.remainingAmount);
  }

  get daysRemaining(): number | null {
    if (!this.target_date) return null;

    const now = new Date();
    const target = new Date(this.target_date);
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get estimatedMonthsToComplete(): number | null {
    if (!this.monthly_contribution || this.monthly_contribution <= 0) return null;

    const remaining = this.remainingAmount;
    return Math.ceil(remaining / this.monthly_contribution);
  }

  get priorityLabel(): string {
    const labels = {
      1: '최우선',
      2: '높음',
      3: '보통',
      4: '낮음',
      5: '최저'
    };
    return labels[this.priority as keyof typeof labels] || '보통';
  }

  get typeLabel(): string {
    const labels = {
      saving: '저축',
      debt_reduction: '부채 상환',
      investment: '투자',
      emergency_fund: '비상금',
      retirement: '은퇴 자금',
      vacation: '여행',
      education: '교육',
      home_purchase: '주택 구매',
      other: '기타'
    };
    return labels[this.goal_type] || '기타';
  }
}