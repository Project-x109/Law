// errorHandler.js
const express = require("express");
const MyCustomErrorType = require('./myCustomErrorType');
function errorHandler(err, req, res, next) {
  console.error("Error:", err);
  if (err instanceof MyCustomErrorType) {
    return res.status(400).json({ error: err.message });
  } else if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: "Internal Server Error" });
}

module.exports = errorHandler;
