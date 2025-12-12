import Joi from 'joi';

// Validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).optional().messages({
    'string.pattern.base': 'Phone must be in E.164 format (e.g., +1234567890)'
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    }),
  role: Joi.string().valid('patient', 'hospital', 'insurer', 'doctor').required().messages({
    'any.only': 'Role must be patient, hospital, insurer, or doctor',
    'any.required': 'Role is required'
  }),
  walletAddress: Joi.string().optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const phoneVerifySchema = Joi.object({
  phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required().messages({
    'string.pattern.base': 'Phone must be in E.164 format (e.g., +1234567890)',
    'any.required': 'Phone number is required'
  })
});

export const otpVerifySchema = Joi.object({
  phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
  code: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.length': 'OTP must be 6 digits',
    'string.pattern.base': 'OTP must contain only numbers',
    'any.required': 'OTP code is required'
  })
});

export const recordUploadSchema = Joi.object({
  patientId: Joi.string().required().messages({
    'any.required': 'Patient ID is required'
  }),
  type: Joi.string().required().messages({
    'any.required': 'Record type is required'
  }),
  description: Joi.string().max(500).optional(),
  date: Joi.date().iso().optional()
});

export const consentRequestSchema = Joi.object({
  patientId: Joi.string().required().messages({
    'any.required': 'Patient ID is required'
  }),
  purpose: Joi.string().max(200).required().messages({
    'any.required': 'Purpose is required',
    'string.max': 'Purpose cannot exceed 200 characters'
  }),
  recordTypes: Joi.array().items(Joi.string()).optional()
});

export const consentActionSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required().messages({
    'any.only': 'Action must be approve or reject',
    'any.required': 'Action is required'
  })
});

// Middleware to validate requests
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

// File upload validation
export const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: 'Invalid file type. Only PDF, JPEG, and PNG files are allowed'
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({
      error: 'File size exceeds 10MB limit'
    });
  }

  next();
};
