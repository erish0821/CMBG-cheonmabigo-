import { Model } from 'objection';

export class BaseModel extends Model {
  id!: string;
  created_at!: Date;
  updated_at!: Date;

  $beforeInsert() {
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  $beforeUpdate() {
    this.updated_at = new Date();
  }

  static get idColumn() {
    return 'id';
  }
}