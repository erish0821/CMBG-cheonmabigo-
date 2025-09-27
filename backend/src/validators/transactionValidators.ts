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
    .withMessage('a@ 0 t�X +��| i��'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('��D �%t�8�'),
  body('category')
    .isIn(categories)
    .withMessage(' �\ tL�|  �t�8�'),
  body('subcategory')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('8� tLଔ 100� tX�| i��'),
  body('is_income')
    .optional()
    .isBoolean()
    .withMessage('� 쀔 true � false�| i��'),
  body('payment_method')
    .optional()
    .isIn(paymentMethods)
    .withMessage(' �\ � )�D  �t�8�'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('X� 255� tX�| i��'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('��� 0� ��| i��'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('��� 8��t�| i��'),
  body('transaction_date')
    .optional()
    .isISO8601()
    .withMessage(' �\ �� �D �%t�8� (ISO 8601)')
];

export const updateTransactionValidation = [
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('a@ 0 t�X +��| i��'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('��D �%t�8�'),
  body('category')
    .optional()
    .isIn(categories)
    .withMessage(' �\ tL�|  �t�8�'),
  body('subcategory')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('8� tLଔ 100� tX�| i��'),
  body('is_income')
    .optional()
    .isBoolean()
    .withMessage('� 쀔 true � false�| i��'),
  body('payment_method')
    .optional()
    .isIn(paymentMethods)
    .withMessage(' �\ � )�D  �t�8�'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('X� 255� tX�| i��'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('��� 0� ��| i��'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('��� 8��t�| i��'),
  body('transaction_date')
    .optional()
    .isISO8601()
    .withMessage(' �\ �� �D �%t�8� (ISO 8601)')
];

export const bulkCreateTransactionsValidation = [
  body('transactions')
    .isArray({ min: 1 })
    .withMessage('p� �]@ 0�tp \� 1 t�t�| i��'),
  body('transactions.*.amount')
    .isFloat({ min: 0 })
    .withMessage('a@ 0 t�X +��| i��'),
  body('transactions.*.description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('��D �%t�8�'),
  body('transactions.*.category')
    .isIn(categories)
    .withMessage(' �\ tL�|  �t�8�'),
  body('transactions.*.is_income')
    .optional()
    .isBoolean()
    .withMessage('� 쀔 true � false�| i��'),
  body('transactions.*.payment_method')
    .optional()
    .isIn(paymentMethods)
    .withMessage(' �\ � )�D  �t�8�'),
  body('transactions.*.transaction_date')
    .optional()
    .isISO8601()
    .withMessage(' �\ �� �D �%t�8� (ISO 8601)')
];

export const getTransactionsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('�t�� 1 t�X �| i��'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('\ � 1-100 �tX �| i��'),
  query('category')
    .optional()
    .isIn(categories)
    .withMessage(' �\ tL�|  �t�8�'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('ܑ �ܔ  �\ �� �t�| i��'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('�� �ܔ  �\ �� �t�| i��'),
  query('is_income')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('� 쀔 true � false�| i��'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('�ɴ� 1-255� �t�| i��')
];