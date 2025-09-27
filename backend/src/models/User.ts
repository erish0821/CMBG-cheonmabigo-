import { BaseModel } from './BaseModel';
import { Transaction } from './Transaction';
import { Budget } from './Budget';
import { Goal } from './Goal';

export class User extends BaseModel {
  static tableName = 'users';

  email!: string;
  password!: string;
  name!: string;
  phone_number?: string;
  birth_date?: Date;
  gender?: 'male' | 'female' | 'other';
  is_active!: boolean;
  email_verified!: boolean;
  email_verified_at?: Date;
  last_login_at?: Date;
  login_count!: number;
  preferences?: object;
  timezone!: string;
  language!: string;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password', 'name'],
      properties: {
        id: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
        name: { type: 'string', minLength: 1, maxLength: 100 },
        phone_number: { type: ['string', 'null'], maxLength: 20 },
        birth_date: { type: ['string', 'null'], format: 'date' },
        gender: { type: ['string', 'null'], enum: ['male', 'female', 'other'] },
        is_active: { type: 'boolean', default: true },
        email_verified: { type: 'boolean', default: false },
        email_verified_at: { type: ['string', 'null'], format: 'date-time' },
        last_login_at: { type: ['string', 'null'] },
        login_count: { type: 'integer', default: 0 },
        preferences: { type: ['object', 'null'] },
        timezone: { type: 'string', default: 'Asia/Seoul' },
        language: { type: 'string', default: 'ko' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      transactions: {
        relation: BaseModel.HasManyRelation,
        modelClass: Transaction,
        join: {
          from: 'users.id',
          to: 'transactions.user_id'
        }
      },
      budgets: {
        relation: BaseModel.HasManyRelation,
        modelClass: Budget,
        join: {
          from: 'users.id',
          to: 'budgets.user_id'
        }
      },
      goals: {
        relation: BaseModel.HasManyRelation,
        modelClass: Goal,
        join: {
          from: 'users.id',
          to: 'goals.user_id'
        }
      }
    };
  }

  $beforeInsert() {
    super.$beforeInsert();
    this.is_active = this.is_active ?? true;
    this.email_verified = this.email_verified ?? false;
    this.login_count = this.login_count ?? 0;
    this.timezone = this.timezone ?? 'Asia/Seoul';
    this.language = this.language ?? 'ko';
  }

  $beforeUpdate() {
    super.$beforeUpdate();
    // Date 객체를 문자열로 변환
    if (this.last_login_at instanceof Date) {
      this.last_login_at = this.last_login_at.toISOString() as any;
    }
  }

  $formatJson(json: any) {
    json = super.$formatJson(json);
    delete json.password; // Never return password in JSON
    return json;
  }
}