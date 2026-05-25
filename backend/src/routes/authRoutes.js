const express = require('express');
const router  = express.Router();
const { 
  login, 
  register, 
  logout,
  refreshToken,
  getMe, 
  changePassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation, userValidation, handleValidationErrors } = require('../middleware/validation');

router.post('/register',         
  userValidation,
  register
);

router.post('/login',            
  loginValidation,
  login
);

router.post('/refresh',          
  refreshToken
);

router.post('/logout',           
  protect, 
  logout
);

router.get('/me',                
  protect, 
  getMe
);

router.patch('/change-password', 
  protect, 
  changePassword
);

module.exports = router;