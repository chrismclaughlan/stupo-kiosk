var db = require("./db");
var express = require("express");
var usersRouter = express.Router();
var validator = require("email-validator");
var bcrypt = require("bcrypt");
const handleError = require("./Error").callback;

const SALT_ROUNDS = 10;
const VALIDATION = {
  EMAIL: {
    MIN: 5,
    MAX: 255,
  },
  PASSWORD: {
    MIN: 8,
    MAX: 30,
  },
};

// Create - Remember to check for ER_DUP_ENTRY on frontend
usersRouter.post("/create", (req, res) => {
  const errorType = "Error creating user";
  const { email, password } = req.body;

  if (!email || !password)
    return handleError(res, errorType, "Missing parameter(s)", 'Expected "email" and "password"');

  if (email.length < VALIDATION.EMAIL.MIN || email.length > VALIDATION.EMAIL.MAX || !validator.validate(email + ""))
    return handleError(
      res,
      errorType,
      "Invalid email",
      `Min length = ${VALIDATION.EMAIL.MIN} Max length = ${VALIDATION.EMAIL.MAX}`
    );

  if (password.length < VALIDATION.PASSWORD.MIN || password.length > VALIDATION.PASSWORD.MAX)
    return handleError(
      res,
      errorType,
      "Invalid password",
      `Min length = ${VALIDATION.PASSWORD.MIN} Max length = ${VALIDATION.PASSWORD.MAX}`
    );

  // Email and Password are suitable

  bcrypt.hash(password, SALT_ROUNDS, (error, hashedPassword) => {
    if (error) return handleError(res, errorType, "Hashing password");

    const sql = "INSERT INTO users (email, password) VALUES (?, ?)";
    const cols = [email, hashedPassword];
    db.query(sql, cols, (error, data, fields) => {
      if (error) return handleError(res, errorType, "Querying database", error.code, 500);

      if (data.affectedRows === 0) return handleError(res, errorType, "Querying database", "No rows affected");

      res.json({ data });
    });
  });
});

// Read
usersRouter.get("/", (req, res) => {
  const errorType = "Error getting users";
  const sql = "SELECT id, email FROM users"; /* WARNING: DON'T INCLUDE PASSWORD */
  const cols = [];

  db.query(sql, cols, (error, data, fields) => {
    if (error) return handleError(res, errorType, "Querying database", error.code, 500);

    res.json(data);
  });
});

usersRouter.get("/:userId", (req, res) => {
  const errorType = "Error getting user";
  const { userId } = req.params;

  if (!userId) return handleError(res, errorType, "Missing parameter(s)", "Expected /:user_id");

  const sql = "SELECT id, email FROM users WHERE id = ?"; /* WARNING: DON'T INCLUDE PASSWORD */
  const cols = [userId];
  db.query(sql, cols, (error, data, fields) => {
    if (error) return handleError(res, errorType, "Querying database", error.code, 500);

    res.json(data);
  });
});

// Update - TODO change email?
usersRouter.post("/update", (req, res) => {
  const errorType = "Error updating user";
  const { id, password } = req.body;

  if (!id || !password) return handleError(res, errorType, "Missing parameter(s)", 'Expected "id" and "password"');

  /* No need to validate id as we're not updating it */

  if (password.length < VALIDATION.PASSWORD.MIN || password.length > VALIDATION.PASSWORD.MAX)
    return handleError(res, errorType, "Invalid password");

  bcrypt.hash(password, SALT_ROUNDS, (error, hashedPassword) => {
    if (error) return handleError(res, errorType, "Hashing password", null, 500);

    const sql = "UPDATE users SET password = ? WHERE id = ?";
    const cols = [hashedPassword, id];
    db.query(sql, cols, (error, data, fields) => {
      if (error) return handleError(res, errorType, "Querying database", error.code, 500);

      if (data.affectedRows === 0) return handleError(res, errorType, "Querying database", "No rows affected");

      res.end();
    });
  });
});

// Destroy
usersRouter.post("/destroy", (req, res) => {
  const errorType = "Error destroying user";
  const { id } = req.body;

  if (!id) return handleError(res, errorType, "Id not defined");

  const sql = "DELETE FROM users WHERE id = ?";
  const cols = [id];
  db.query(sql, cols, (error, data, fields) => {
    if (error) return handleError(res, errorType, "Querying database", error.code, 500);

    if (data.affectedRows === 0) return handleError(res, errorType, "Querying database", "No rows affected");

    res.end();
  });
});

module.exports = usersRouter;
