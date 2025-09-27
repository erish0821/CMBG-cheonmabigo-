import { body, query } from 'express-validator';

const categories = [
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
];

const paymentMethods = ['CARD', 'CASH', 'TRANSFER', 'MOBILE_PAY'];

export const createTransactionValidation = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('a@ 0 t¡X +êÏ| i»‰'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('¥©D Ö%t¸8î'),
  body('category')
    .isIn(categories)
    .withMessage(' ®\ tL‡¨|  ›t¸8î'),
  body('subcategory')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('8Ä tL‡¨î 100ê tXÏ| i»‰'),
  body('is_income')
    .optional()
    .isBoolean()
    .withMessage('Ö ÏÄî true î falseÏ| i»‰'),
  body('payment_method')
    .optional()
    .isIn(paymentMethods)
    .withMessage(' ®\ ∞ )ïD  ›t¸8î'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Xî 255ê tXÏ| i»‰'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('‹¯î 0Ù ‹Ï| i»‰'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('‹¯î 8êÙt¥| i»‰'),
  body('transaction_date')
    .optional()
    .isISO8601()
    .withMessage(' ®\ †‹ ›D Ö%t¸8î (ISO 8601)')
];

export const updateTransactionValidation = [
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('a@ 0 t¡X +êÏ| i»‰'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('¥©D Ö%t¸8î'),
  body('category')
    .optional()
    .isIn(categories)
    .withMessage(' ®\ tL‡¨|  ›t¸8î'),
  body('subcategory')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('8Ä tL‡¨î 100ê tXÏ| i»‰'),
  body('is_income')
    .optional()
    .isBoolean()
    .withMessage('Ö ÏÄî true î falseÏ| i»‰'),
  body('payment_method')
    .optional()
    .isIn(paymentMethods)
    .withMessage(' ®\ ∞ )ïD  ›t¸8î'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Xî 255ê tXÏ| i»‰'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('‹¯î 0Ù ‹Ï| i»‰'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('‹¯î 8êÙt¥| i»‰'),
  body('transaction_date')
    .optional()
    .isISO8601()
    .withMessage(' ®\ †‹ ›D Ö%t¸8î (ISO 8601)')
];

export const bulkCreateTransactionsValidation = [
  body('transactions')
    .isArray({ min: 1 })
    .withMessage('pò ©]@ 0Ùtp \å 1 t¡t¥| i»‰'),
  body('transactions.*.amount')
    .isFloat({ min: 0 })
    .withMessage('a@ 0 t¡X +êÏ| i»‰'),
  body('transactions.*.description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('¥©D Ö%t¸8î'),
  body('transactions.*.category')
    .isIn(categories)
    .withMessage(' ®\ tL‡¨|  ›t¸8î'),
  body('transactions.*.is_income')
    .optional()
    .isBoolean()
    .withMessage('Ö ÏÄî true î falseÏ| i»‰'),
  body('transactions.*.payment_method')
    .optional()
    .isIn(paymentMethods)
    .withMessage(' ®\ ∞ )ïD  ›t¸8î'),
  body('transactions.*.transaction_date')
    .optional()
    .isISO8601()
    .withMessage(' ®\ †‹ ›D Ö%t¸8î (ISO 8601)')
];

export const getTransactionsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('òt¿î 1 t¡X Ï| i»‰'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('\ î 1-100 ¨tX Ï| i»‰'),
  query('category')
    .optional()
    .isIn(categories)
    .withMessage(' ®\ tL‡¨|  ›t¸8î'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('‹ë †‹î  ®\ †‹ ›t¥| i»‰'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('ÖÃ †‹î  ®\ †‹ ›t¥| i»‰'),
  query('is_income')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Ö ÏÄî true î falseÏ| i»‰'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Ä…¥î 1-255ê ¨tÏ| i»‰')
];