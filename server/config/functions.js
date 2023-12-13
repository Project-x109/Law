const secretKey = 'YourSuperSecretKeyHere1234567890';
const jwt = require('jsonwebtoken');
const emailValidator = (email) => {
  const emailRegex = RegExp(
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
  );

  return !emailRegex.test(email);
};
const validatePassword = (password) => {
  // Regular expressions for validation
  const lengthRegex = /^.{8,}$/; // At least 8 characters
  const capitalLetterRegex = /[A-Z]/; // At least one capital letter
  const specialCharacterRegex = /[\W_]/; // At least one special character
  const numberRegex = /\d/; // At least one digit

  const errors = [];

  if (!lengthRegex.test(password)) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!capitalLetterRegex.test(password)) {
    errors.push('Password must contain at least one capital letter');
  }

  if (!specialCharacterRegex.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (!numberRegex.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return errors;
};
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization; // Assuming the token is included in the Authorization header
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized Error Here' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized Error Here' });
    }
    req.user = decoded;
    next();
  });
};
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};
module.exports = {
  emailValidator,
  validatePassword,
  verifyToken,
  isAuthenticated
};
