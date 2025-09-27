import Joi from 'joi';

export const chatSchema = Joi.object({
  message: Joi.string()
    .required()
    .min(1)
    .max(1000)
    .messages({
      'string.min': '메시지는 최소 1자 이상이어야 합니다.',
      'string.max': '메시지는 최대 1000자까지 가능합니다.',
      'any.required': '메시지는 필수 항목입니다.',
    }),

  sessionId: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': '세션 ID는 최대 50자까지 가능합니다.',
    }),

  context: Joi.object({
    userId: Joi.string(),
    income: Joi.number().min(0),
    spendingPatterns: Joi.object(),
    financialGoals: Joi.array().items(Joi.string()),
    recentTransactions: Joi.array(),
    currentBudgets: Joi.array(),
  })
    .allow({})
    .default({}),
});

export const parseTransactionSchema = Joi.object({
  text: Joi.string()
    .required()
    .min(1)
    .max(500)
    .messages({
      'string.min': '텍스트는 최소 1자 이상이어야 합니다.',
      'string.max': '텍스트는 최대 500자까지 가능합니다.',
      'any.required': '파싱할 텍스트는 필수 항목입니다.',
    }),

  language: Joi.string()
    .valid('ko', 'en')
    .default('ko')
    .messages({
      'any.only': '언어는 ko 또는 en만 지원됩니다.',
    }),

  includeContext: Joi.boolean()
    .default(false),
});

export const generateInsightsSchema = Joi.object({
  period: Joi.string()
    .valid('week', 'month', 'quarter', 'year')
    .default('month')
    .messages({
      'any.only': '기간은 week, month, quarter, year 중 하나여야 합니다.',
    }),

  categories: Joi.array()
    .items(Joi.string().valid(
      'FOOD_DINING', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT',
      'HEALTHCARE', 'EDUCATION', 'UTILITY', 'TRAVEL', 'OTHER'
    ))
    .max(10)
    .default([])
    .messages({
      'array.max': '카테고리는 최대 10개까지 선택할 수 있습니다.',
    }),

  analysisType: Joi.string()
    .valid('spending', 'saving', 'budget', 'general')
    .default('general')
    .messages({
      'any.only': '분석 유형은 spending, saving, budget, general 중 하나여야 합니다.',
    }),

  includeRecommendations: Joi.boolean()
    .default(true),
});

export const financialAdviceSchema = Joi.object({
  question: Joi.string()
    .required()
    .min(5)
    .max(500)
    .messages({
      'string.min': '질문은 최소 5자 이상이어야 합니다.',
      'string.max': '질문은 최대 500자까지 가능합니다.',
      'any.required': '질문은 필수 항목입니다.',
    }),

  userProfile: Joi.object({
    age: Joi.number().integer().min(18).max(100),
    income: Joi.number().min(0),
    familySize: Joi.number().integer().min(1).max(20),
    riskTolerance: Joi.string().valid('conservative', 'moderate', 'aggressive'),
    financialGoals: Joi.array().items(Joi.string()),
    currentDebt: Joi.number().min(0),
    savings: Joi.number().min(0),
    investmentExperience: Joi.string().valid('none', 'beginner', 'intermediate', 'advanced'),
  })
    .allow({})
    .default({}),

  context: Joi.object({
    recentTransactions: Joi.array(),
    currentBudgets: Joi.array(),
    spendingPatterns: Joi.object(),
  })
    .allow({})
    .default({}),
});

export const spendingPredictionSchema = Joi.object({
  period: Joi.string()
    .required()
    .valid('week', 'month', 'quarter')
    .messages({
      'any.only': '예측 기간은 week, month, quarter 중 하나여야 합니다.',
      'any.required': '예측 기간은 필수 항목입니다.',
    }),

  categories: Joi.array()
    .items(Joi.string().valid(
      'FOOD_DINING', 'TRANSPORTATION', 'SHOPPING', 'ENTERTAINMENT',
      'HEALTHCARE', 'EDUCATION', 'UTILITY', 'TRAVEL', 'OTHER'
    ))
    .max(10)
    .default([])
    .messages({
      'array.max': '카테고리는 최대 10개까지 선택할 수 있습니다.',
    }),

  includeSeasonality: Joi.boolean()
    .default(true),

  confidenceLevel: Joi.number()
    .min(0.8)
    .max(0.99)
    .default(0.95)
    .messages({
      'number.min': '신뢰도는 80% 이상이어야 합니다.',
      'number.max': '신뢰도는 99% 이하여야 합니다.',
    }),
});

export const budgetSuggestionSchema = Joi.object({
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
    .allow({})
    .default({}),

  preferences: Joi.object({
    aggressiveSaving: Joi.boolean().default(false),
    emergencyFundMonths: Joi.number().integer().min(3).max(12).default(6),
    investmentAllocation: Joi.number().min(0).max(50).default(10),
    debtPayoffPriority: Joi.boolean().default(false),
  })
    .allow({})
    .default({}),
});

export const conversationHistorySchema = Joi.object({
  sessionId: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': '세션 ID는 최대 50자까지 가능합니다.',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.min': '조회 개수는 최소 1개 이상이어야 합니다.',
      'number.max': '조회 개수는 최대 100개까지 가능합니다.',
    }),

  startDate: Joi.date(),

  endDate: Joi.date()
    .when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')),
    }),

  messageType: Joi.string()
    .valid('user', 'assistant', 'system')
    .messages({
      'any.only': '메시지 타입은 user, assistant, system 중 하나여야 합니다.',
    }),
});

export const voiceToTextSchema = Joi.object({
  language: Joi.string()
    .valid('ko-KR', 'en-US', 'ja-JP', 'zh-CN')
    .default('ko-KR')
    .messages({
      'any.only': '지원되지 않는 언어입니다.',
    }),

  includeTimestamps: Joi.boolean()
    .default(false),

  filterProfanity: Joi.boolean()
    .default(true),

  enhanceForFinance: Joi.boolean()
    .default(true),
});