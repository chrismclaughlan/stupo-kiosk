var dotenv = require("dotenv").config(); // config({path: ''})
if (dotenv.error) throw dotenv.error;
var express = require("express");
var app = express();
var session = require("express-session");
var mysql = require("mysql");
var MySQLStore = require("express-mysql-session")(session);
var cookieParser = require("cookie-parser");
//var bodyParser = require("body-parser");
const path = require("path");

var PORT = 4321;
var MAKE_SESSION_COOKIE_SECURE = false;

/* Does this work? */
if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  MAKE_SESSION_COOKIE_SECURE = true;
}

//app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

var db = require("./src/db");
var sessionStore = new MySQLStore({}, db);

const auth = require("./src/Auth");
var sessionRouter = require("./src/SessionRouter");
var usersRouter = require("./src/UsersRouter");
var categoriesRouter = require("./src/CategoriesRouter");
var productsRouter = require("./src/ProductsRouter");

app.use(
  session({
    key: "stupokiosk_sid",
    secret: process.env.REACT_APP_SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: MAKE_SESSION_COOKIE_SECURE, httpOnly: true }, // TODO max age etc.
  })
);

app.use("/api/session", sessionRouter);
app.use("/api/users", usersRouter); // auth.requireLogin,
app.use("/api/categories", categoriesRouter); // auth.requireLogin,
app.use("/api/products", productsRouter); // auth.requireLogin,

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.listen(PORT, () => {
  console.log(`admin-stupokiosk listening at localhost:${PORT}`);
});
