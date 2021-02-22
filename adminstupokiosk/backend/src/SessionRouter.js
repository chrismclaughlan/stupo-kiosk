var db = require("./db");
var express = require("express");
var sessionRouter = express.Router();
var bcrypt = require("bcrypt");
const handleError = require("./Error").callback;

sessionRouter.post("/login", (req, res) => {
  const errorType = "Error logging in";
  const { email, password } = req.body;

  if (!email || !password)
    return handleError(res, errorType, "Missing parameter(s)", 'Expected "email" and "password"');

  const sql = "SELECT * FROM users WHERE email = ?";
  const cols = [email];
  db.query(sql, cols, (error, data, fields) => {
    if (error) return handleError(res, errorType, "Querying database", error.code, 500);

    if (!data || data.length === 0) return handleError(res, errorType, "Querying database", "Email does not exist");

    const user = data[0];

    if (user.password) {
      bcrypt.compare(password, user.password, (error, passwordsMatch) => {
        if (error) return handleError(res, errorType, "Comparing passwords", error, 500);

        if (passwordsMatch) {
          req.session.isLoggedIn = true;
          req.session.user = {
            id: user.id,
            email: user.email,
          };

          /* Logged in */
          //res.end();
          res.send(`Successfully logged in as: ${user.email}`);
        } else {
          return handleError(res, errorType, "Incorrect password");
        }
      });
    } else {
      return handleError(res, errorType, "Unknown error", null, 500);
    }
  });
});

module.exports = sessionRouter;
