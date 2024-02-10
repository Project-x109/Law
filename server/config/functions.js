const secretKey = 'YourSuperSecretKeyHere1234567890';
const jwt = require('jsonwebtoken');
const moment = require('moment');

function isValidDateOfBirth(value) {
  const allowedDateFormat = 'YYYY-MM-DD';
  const formattedDate = moment(value).format(allowedDateFormat);
  if (!moment(formattedDate, allowedDateFormat, true).isValid()) {
    return false;
  }
  const minAllowedAge = 18;
  const currentDate = moment();
  const birthDate = moment(value, allowedDateFormat);
  const age = currentDate.diff(birthDate, 'years');

  if (age < minAllowedAge) {
    return false;
  }
  return true;
}

const emailValidator = (email) => {
  const emailRegex = RegExp(
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
  );

  return emailRegex.test(email);
};
const phoneValidator = (phoneNo) => {
  const phoneRegx = RegExp(
    /(\+\s*2\s*5\s*1\s*9\s*(([0-9]\s*){8}\s*))|(\+\s*2\s*5\s*1\s*9\s*(([0-9]\s*){8}\s*))|(0\s*9\s*(([0-9]\s*){8}))|(0\s*7\s*(([0-9]\s*){8}))/
  )

  return phoneRegx.test(phoneNo);
}
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  const error = []
  if (!token) {
    error.push('Unauthorized Error at verify token')
    return res.status(401).json({ success: false, error: error });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      error.push('Unauthorized Error at verify token')
      return res.status(401).json({ success: false, error: error });

    }
    req.user = decoded;
    next();
  });
};
const isAuthenticated = (req, res, next) => {
  const error = []
  try {
    if (req.isAuthenticated()) {
      return next();
    } else {
      error.push('Unauthorized Error at is authenticated')
      return res.status(401).json({ success: false, error: error });

    }
  } catch (err) {
    console.log(err)
    error.push('error at catch block');
    return res.status(500).json({ success: false, error: error })
  }
};
const formatResolutionTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const formattedTime = `${days} days, ${hours % 24} hours, ${minutes % 60} minutes, ${seconds % 60} seconds`;
  return formattedTime;
}
const getInitials = (firstName, lastName) => {
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';

  return `${firstInitial}${lastInitial}`;
};
module.exports = {
  emailValidator,
  phoneValidator,
  verifyToken,
  isAuthenticated,
  isValidDateOfBirth,
  formatResolutionTime,
  getInitials
};
