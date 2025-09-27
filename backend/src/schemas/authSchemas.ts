import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '올바른 이메일 형식이 아닙니다.',
      'any.required': '이메일은 필수 항목입니다.',
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': '비밀번호는 최소 6자 이상이어야 합니다.',
      'string.max': '비밀번호는 최대 128자까지 가능합니다.',
      'any.required': '비밀번호는 필수 항목입니다.',
    }),

  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': '이름은 최소 2자 이상이어야 합니다.',
      'string.max': '이름은 최대 50자까지 가능합니다.',
      'any.required': '이름은 필수 항목입니다.',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '올바른 이메일 형식이 아닙니다.',
      'any.required': '이메일은 필수 항목입니다.',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': '비밀번호는 필수 항목입니다.',
    }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': '리프레시 토큰은 필수 항목입니다.',
    }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': '현재 비밀번호는 필수 항목입니다.',
    }),

  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': '새 비밀번호는 최소 6자 이상이어야 합니다.',
      'string.max': '새 비밀번호는 최대 128자까지 가능합니다.',
      'any.required': '새 비밀번호는 필수 항목입니다.',
    }),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': '이름은 최소 2자 이상이어야 합니다.',
      'string.max': '이름은 최대 50자까지 가능합니다.',
    }),

  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .allow('')
    .messages({
      'string.pattern.base': '올바른 전화번호 형식이 아닙니다.',
    }),

  birthDate: Joi.date()
    .max('now')
    .allow(null)
    .messages({
      'date.max': '생년월일은 현재 날짜보다 이전이어야 합니다.',
    }),

  gender: Joi.string()
    .valid('male', 'female', 'other')
    .allow(null)
    .messages({
      'any.only': '성별은 male, female, other 중 하나여야 합니다.',
    }),
});

export const emailVerificationSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': '인증 토큰은 필수 항목입니다.',
    }),
});

export const resetPasswordRequestSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '올바른 이메일 형식이 아닙니다.',
      'any.required': '이메일은 필수 항목입니다.',
    }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': '재설정 토큰은 필수 항목입니다.',
    }),

  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': '새 비밀번호는 최소 6자 이상이어야 합니다.',
      'string.max': '새 비밀번호는 최대 128자까지 가능합니다.',
      'any.required': '새 비밀번호는 필수 항목입니다.',
    }),
});