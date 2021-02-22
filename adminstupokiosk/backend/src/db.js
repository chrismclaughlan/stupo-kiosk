var mysql = require("mysql");

var db = mysql.createConnection({
  host: process.env.REACT_APP_DB_HOST,
  port: process.env.REACT_APP_DB_PORT,
  user: process.env.REACT_APP_DB_USER,
  password: process.env.REACT_APP_DB_PASSWORD,
  database: process.env.REACT_APP_DB_DATABASE,
  // dateStrings: true,
  // multipleStatements: true
});

db.connect((error) => {
  if (error) throw error;
});

module.exports = db;
