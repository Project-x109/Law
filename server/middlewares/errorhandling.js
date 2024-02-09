// errorHandler.js
const express = require("express");
const MyCustomErrorType = require('./myCustomErrorType');
function errorHandler(err, req, res, next) {
  const error = []
  if (err instanceof MyCustomErrorType) {
    return res.status(400).json({ error: err.message });
  } else if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  error.push("Internal Server Error at error handling")
  return res.status(500).json({ success: false, error: error });
}

module.exports = errorHandler;
