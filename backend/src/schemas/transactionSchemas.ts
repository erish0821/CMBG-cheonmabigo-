import Joi from 'joi';

export const createTransactionSchema = Joi.object({
  amount: Joi.number()
    .required()
    .min(0)
    .messages({
      'number.min': '금액은 0 이상이어야 합니다.',
      'any.required': '금액은 필수 항목입니다.',
    }),

  description: Joi.string()
    .required()
    .min(1)
    .max(200)
    .messages({
      'string.min': '설명은 최소 1자 이상이어야 합니다.',
      'string.max': '설명은 최대 200자까지 가능합니다.',
      'any.required': '설명은 필수 항목입니다.',
    }),

  category: Joi.string()
    .required()
    .valid(
      'FOOD_DINING', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT',
      'HEALTHCARE', 'EDUCATION', 'INCOME', 'UTILITY', 'TRAVEL', 'OTHER'
    )
    .messages({
      'any.only': '유효하지 않은 카테고리입니다.',
      'any.required': '카테고리는 필수 항목입니다.',
    }),

  subcategory: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': '세부 카테고리는 최대 100자까지 가능합니다.',
    }),

  paymentMethod: Joi.string()
    .valid('CARD', 'CASH', 'TRANSFER', 'MOBILE_PAY')
    .default('CARD')
    .messages({
      'any.only': '유효하지 않은 결제 방법입니다.',
    }),

  location: Joi.string()
    .max(200)
    .allow('')
    .messages({
      'string.max': '위치는 최대 200자까지 가능합니다.',
    }),

  isIncome: Joi.boolean()
    .default(false),

  tags: Joi.array()
    .items(Joi.string().max(50))
    .max(10)
    .default([])
    .messages({
      'array.max': '태그는 최대 10개까지 가능합니다.',
    }),

  date: Joi.date()
    .default(Date.now)
    .max('now')
    .messages({
      'date.max': '거래 날짜는 현재 시간보다 이후일 수 없습니다.',
    }),

  confidence: Joi.number()
    .min(0)
    .max(1)
    .default(0.7),

  originalText: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': '원본 텍스트는 최대 500자까지 가능합니다.',
    }),

  aiParsed: Joi.boolean()
    .default(false),
});

export const updateTransactionSchema = Joi.object({
  amount: Joi.number()
    .min(0)
    .messages({
      'number.min': '금액은 0 이상이어야 합니다.',
    }),

  description: Joi.string()
    .min(1)
    .max(200)
    .messages({
      'string.min': '설명은 최소 1자 이상이어야 합니다.',
      'string.max': '설명은 최대 200자까지 가능합니다.',
    }),

  category: Joi.string()
    .valid(
      'FOOD_DINING', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT',
      'HEALTHCARE', 'EDUCATION', 'INCOME', 'UTILITY', 'TRAVEL', 'OTHER'
    )
    .messages({
      'any.only': '유효하지 않은 카테고리입니다.',
    }),

  subcategory: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': '세부 카테고리는 최대 100자까지 가능합니다.',
    }),

  paymentMethod: Joi.string()
    .valid('CARD', 'CASH', 'TRANSFER', 'MOBILE_PAY')
    .messages({
      'any.only': '유효하지 않은 결제 방법입니다.',
    }),

  location: Joi.string()
    .max(200)
    .allow('')
    .messages({
      'string.max': '위치는 최대 200자까지 가능합니다.',
    }),

  isIncome: Joi.boolean(),

  tags: Joi.array()
    .items(Joi.string().max(50))
    .max(10)
    .messages({
      'array.max': '태그는 최대 10개까지 가능합니다.',
    }),

  date: Joi.date()
    .max('now')
    .messages({
      'date.max': '거래 날짜는 현재 시간보다 이후일 수 없습니다.',
    }),
});

export const transactionQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),

  category: Joi.string()
    .valid(
      'FOOD_DINING', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT',
      'HEALTHCARE', 'EDUCATION', 'INCOME', 'UTILITY', 'TRAVEL', 'OTHER'
    ),

  subcategory: Joi.string()
    .max(100),

  startDate: Joi.date(),

  endDate: Joi.date()
    .when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')),
    }),

  minAmount: Joi.number()
    .min(0),

  maxAmount: Joi.number()
    .min(0)
    .when('minAmount', {
      is: Joi.exist(),
      then: Joi.number().min(Joi.ref('minAmount')),
    }),

  isIncome: Joi.boolean(),

  paymentMethod: Joi.string()
    .valid('CARD', 'CASH', 'TRANSFER', 'MOBILE_PAY'),

  sortBy: Joi.string()
    .valid('date', 'amount', 'category', 'createdAt')
    .default('date'),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
});

export const searchTransactionSchema = Joi.object({
  q: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': '검색어는 최소 1자 이상이어야 합니다.',
      'string.max': '검색어는 최대 100자까지 가능합니다.',
      'any.required': '검색어는 필수 항목입니다.',
    }),

  category: Joi.string()
    .valid(
      'FOOD_DINING', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT',
      'HEALTHCARE', 'EDUCATION', 'INCOME', 'UTILITY', 'TRAVEL', 'OTHER'
    ),

  minAmount: Joi.number()
    .min(0),

  maxAmount: Joi.number()
    .min(0)
    .when('minAmount', {
      is: Joi.exist(),
      then: Joi.number().min(Joi.ref('minAmount')),
    }),

  startDate: Joi.date(),

  endDate: Joi.date()
    .when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')),
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(20),
});

export const bulkTransactionSchema = Joi.object({
  transactions: Joi.array()
    .items(createTransactionSchema)
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': '최소 1개 이상의 거래가 필요합니다.',
      'array.max': '한 번에 최대 100개까지만 등록할 수 있습니다.',
      'any.required': '거래 목록은 필수 항목입니다.',
    }),
});