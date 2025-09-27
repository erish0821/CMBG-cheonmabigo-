import Joi from 'joi';

export const createBudgetSchema = Joi.object({
  name: Joi.string()
    .required()
    .min(1)
    .max(100)
    .messages({
      'string.min': '예산 이름은 최소 1자 이상이어야 합니다.',
      'string.max': '예산 이름은 최대 100자까지 가능합니다.',
      'any.required': '예산 이름은 필수 항목입니다.',
    }),

  amount: Joi.number()
    .required()
    .min(0)
    .messages({
      'number.min': '예산 금액은 0 이상이어야 합니다.',
      'any.required': '예산 금액은 필수 항목입니다.',
    }),

  category: Joi.string()
    .required()
    .valid(
      'FOOD_DINING', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT',
      'HEALTHCARE', 'EDUCATION', 'UTILITY', 'TRAVEL', 'OTHER', 'TOTAL'
    )
    .messages({
      'any.only': '유효하지 않은 카테고리입니다.',
      'any.required': '카테고리는 필수 항목입니다.',
    }),

  period: Joi.string()
    .required()
    .valid('weekly', 'monthly', 'quarterly', 'yearly')
    .messages({
      'any.only': '예산 기간은 weekly, monthly, quarterly, yearly 중 하나여야 합니다.',
      'any.required': '예산 기간은 필수 항목입니다.',
    }),

  startDate: Joi.date()
    .default(Date.now)
    .messages({
      'date.base': '올바른 시작 날짜를 입력해주세요.',
    }),

  endDate: Joi.date()
    .when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')),
    })
    .messages({
      'date.min': '종료 날짜는 시작 날짜보다 이후여야 합니다.',
    }),

  alertThreshold: Joi.number()
    .min(0)
    .max(100)
    .default(80)
    .messages({
      'number.min': '알림 임계값은 0% 이상이어야 합니다.',
      'number.max': '알림 임계값은 100% 이하여야 합니다.',
    }),

  description: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': '설명은 최대 500자까지 가능합니다.',
    }),

  isActive: Joi.boolean()
    .default(true),

  autoRenew: Joi.boolean()
    .default(false),
});

export const updateBudgetSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .messages({
      'string.min': '예산 이름은 최소 1자 이상이어야 합니다.',
      'string.max': '예산 이름은 최대 100자까지 가능합니다.',
    }),

  amount: Joi.number()
    .min(0)
    .messages({
      'number.min': '예산 금액은 0 이상이어야 합니다.',
    }),

  category: Joi.string()
    .valid(
      'FOOD_DINING', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT',
      'HEALTHCARE', 'EDUCATION', 'UTILITY', 'TRAVEL', 'OTHER', 'TOTAL'
    )
    .messages({
      'any.only': '유효하지 않은 카테고리입니다.',
    }),

  period: Joi.string()
    .valid('weekly', 'monthly', 'quarterly', 'yearly')
    .messages({
      'any.only': '예산 기간은 weekly, monthly, quarterly, yearly 중 하나여야 합니다.',
    }),

  endDate: Joi.date()
    .messages({
      'date.base': '올바른 종료 날짜를 입력해주세요.',
    }),

  alertThreshold: Joi.number()
    .min(0)
    .max(100)
    .messages({
      'number.min': '알림 임계값은 0% 이상이어야 합니다.',
      'number.max': '알림 임계값은 100% 이하여야 합니다.',
    }),

  description: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': '설명은 최대 500자까지 가능합니다.',
    }),

  isActive: Joi.boolean(),

  autoRenew: Joi.boolean(),
});

export const budgetQuerySchema = Joi.object({
  active: Joi.boolean(),

  category: Joi.string()
    .valid(
      'FOOD_DINING', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT',
      'HEALTHCARE', 'EDUCATION', 'UTILITY', 'TRAVEL', 'OTHER', 'TOTAL'
    ),

  period: Joi.string()
    .valid('weekly', 'monthly', 'quarterly', 'yearly'),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(20),

  sortBy: Joi.string()
    .valid('name', 'amount', 'category', 'period', 'createdAt')
    .default('createdAt'),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
});

export const budgetRecommendationSchema = Joi.object({
  income: Joi.number()
    .required()
    .min(0)
    .messages({
      'number.min': '소득은 0 이상이어야 합니다.',
      'any.required': '소득은 필수 항목입니다.',
    }),

  goals: Joi.array()
    .items(Joi.string().valid(
      'saving', 'debt_reduction', 'investment', 'emergency_fund',
      'retirement', 'vacation', 'education', 'home_purchase', 'other'
    ))
    .max(5)
    .default([])
    .messages({
      'array.max': '재정 목표는 최대 5개까지 선택할 수 있습니다.',
    }),

  currentSpending: Joi.object({
    FOOD_DINING: Joi.number().min(0),
    TRANSPORTATION: Joi.number().min(0),
    SHOPPING: Joi.number().min(0),
    ENTERTAINMENT: Joi.number().min(0),
    HEALTHCARE: Joi.number().min(0),
    EDUCATION: Joi.number().min(0),
    UTILITY: Joi.number().min(0),
    TRAVEL: Joi.number().min(0),
    OTHER: Joi.number().min(0),
  })
    .default({}),

  riskTolerance: Joi.string()
    .valid('conservative', 'moderate', 'aggressive')
    .default('moderate'),

  age: Joi.number()
    .integer()
    .min(18)
    .max(100)
    .messages({
      'number.min': '나이는 18세 이상이어야 합니다.',
      'number.max': '나이는 100세 이하여야 합니다.',
    }),

  familySize: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .default(1)
    .messages({
      'number.min': '가족 구성원은 최소 1명이어야 합니다.',
      'number.max': '가족 구성원은 최대 20명까지 입력할 수 있습니다.',
    }),
});