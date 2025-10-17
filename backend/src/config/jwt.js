/**
 * JWT Configuration
 */
module.exports = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRE || '7d',
  algorithm: 'HS256'
};

