const { body, param, validationResult } = require('express-validator');

// ── Custom error handler ──
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// ── Resident validation ──
const residentValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/).withMessage('Phone number format is invalid.'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email format is invalid.'),
  body('kebele')
    .optional()
    .trim()
    .notEmpty().withMessage('Kebele is required.'),
  body('houseNo')
    .optional()
    .trim()
    .notEmpty().withMessage('House number is required.'),
  handleValidationErrors,
];

// ── User creation/update validation ──
const userValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required.'),
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain number.')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage('Password must contain special character.'),
  body('role')
    .isIn(['superadmin', 'admin', 'clerk', 'resident']).withMessage('Invalid role.'),
  handleValidationErrors,
];

// ── Login validation ──
const loginValidation = [
  body('identifier')
    .trim()
    .notEmpty().withMessage('Email or username is required.'),
  body('password')
    .notEmpty().withMessage('Password is required.'),
  handleValidationErrors,
];

// ── Certificate validation ──
const certificateValidation = [
  body('residentId')
    .notEmpty().withMessage('Resident ID is required.'),
  body('type')
    .isIn(['birth', 'death', 'marriage', 'divorce']).withMessage('Invalid certificate type.'),
  body('issueDate')
    .isISO8601().withMessage('Valid issue date is required.'),
  handleValidationErrors,
];

// ── Request validation ──
const requestValidation = [
  body('residentId')
    .notEmpty().withMessage('Resident ID is required.'),
  body('type')
    .notEmpty().withMessage('Request type is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Request type must be 2-50 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters.'),
  handleValidationErrors,
];

// ── ID parameter validation ──
const idValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format.'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  residentValidation,
  userValidation,
  loginValidation,
  certificateValidation,
  requestValidation,
  idValidation,
};
