// @ts-check

const path = require('path');

const PORT = 4000;

const moment = require("moment");

/* Env */
const result = require("dotenv").config();
if (result.error) throw result.error;

/* Express */
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

/* Database */
const mysql = require("mysql");
const db = mysql.createConnection({
  host: process.env.REACT_APP_DB_HOST,
  port: parseInt(process.env.REACT_APP_DB_PORT, 10),
  user: process.env.REACT_APP_DB_USER,
  password: process.env.REACT_APP_DB_PASSWORD,
  database: process.env.REACT_APP_DB_DATABASE,
  dateStrings: true,
  // multipleStatements: true,
});
db.connect(function (err) {
  if (err) throw err;
});

/* Validation */
var validator = require("validator");

/* Discord API */
const Discord = require("discord.js");
const discordClient = new Discord.Client();
discordClient.on("error", () =>
  discordClient.login(process.env.REACT_APP_DISCORD_BOT_TOKEN)
);
discordClient.on("ready", () => {
  console.log(`${discordClient.user.tag} successfully logged in`);
});
discordClient.login(process.env.REACT_APP_DISCORD_BOT_TOKEN);

/**
 * *Careful about error handling TODO. Eg https://discord.com/developers/docs/topics/rate-limits
 * @param {*} message
 * @param {*} channelId
 */
const discordSendMessage = (message, channelId = "809568968461123618") => {
  const channel = discordClient.channels.cache.get(channelId);
  if (
    channel &&
    channel
      .send(message + "")
      .catch((error) => console.error(`discordClient Error: ${error}`))
  ) {
    return true;
  } else {
    console.error(
      `Discord bot Could not send message to channelid: ${channelId}`
    );
    return false;
  }
};

/* MYSQL queries */

function responseError(res, code, description, setHeader = {}) {
  if (setHeader) res.set(setHeader);

  res.status(code).json({ errorDescription: description });
}

const queryDatabase = (res, query, cols, callback) => {
  db.query(query, cols, (err, results) => {
    if (err) {
      console.error(err);
      return responseError(
        res,
        500,
        "Server encountered an error querying the database"
      );
    }

    if (results == null || results.length === 0)
      return responseError(res, 200, "Could not find results for query");

    return callback(results);
  });
};

/* Type definitions / Docs */

/**
 * @typedef {Object} Product
 * @property {number} id - DB key
 * @property {string} name - Name of product
 * @property {string} image - URI of product image
 * @property {number} price - Price before discount
 * @property {number} [priceDiscounted] - Price if discounted
 */

/**
 * @typedef {Object} Category
 * @property {string} name - Name of category
 * @property {string[]} keywords - Keywords for search functionality
 * @property {string} image - URI of product image
 * @property {string} description - Description of category
 * @property {Product[]} products - Array of products in this category
 */

/**
 * @typedef {Object} CustomerInfo
 * @property {string} name
 * @property {string} address
 * @property {string} phone
 * @property {string} [comment]
 *
 */

/**
 * @typedef {Object} OrderItem
 * @property {number} productID - DB key of product
 * @property {number} productQuantity - Quantity of product ordered
 */

/**
 * @typedef {Object} Order
 * @property {OrderItem[]} items - Items ordered by customer
 * @property {CustomerInfo} customerInfo - Customer information to help delivery process
 * @property {string} PaymentMethod - Method for payment
 */

/**
 * Returns list of products under a specific category.
 *
 * @function
 * @name GET/api/catalogue/categories/:categoryID/products
 * @param {number} [req.params.categoryID] - Category ID of products we're looking for
 * @see Category
 * @see Product
 */
app.get("/api/catalogue/categories/:categoryID/products", (req, res) => {
  const { categoryID } = req.params;
  const { price } = req.query;

  if (categoryID != null) {
    let query = "SELECT * FROM products WHERE category_id = ?";

    if (price === "low") query += " ORDER BY price ASC";
    // TODO change db to take price as default and price_original if discounted -----------------------------------
    else if (price === "high") query += " ORDER BY price DESC";

    return queryDatabase(res, query, [categoryID], (results) => {
      return res.json(results);
    });
  }

  return responseError(
    res,
    404,
    "Invalid/Missing parameters/query, expected: /api/catalogue/categories/:some_category_id/products"
  );
});

/**
 * Returns list of categories.
 *
 * @function
 * @name GET/api/catalogue/categories
 * @param {number} [req.query.page] - Page number of results (OFFSET in mysql)
 * @param {number} [req.query.per_page] - Number of results in page (LIMIT in mysql)
 * @param {number} [req.query.search] - Search string to find in 'keywords' column in mysql for categories
 * @see Category
 */
app.get("/api/catalogue/categories", (req, res) => {
  const { page, per_page: perPage, search } = req.query;

  let colsPages = [],
    colsSearch = [];
  let queryPages = "",
    querySearch = "";

  /* Parse page parameters (MYSQL: LIMIT OFFSET)
  /* Only difference -> if page: "... LIMIT ? ..."; cols = [page] */
  if (page != null) {
    let limit,
      page_ = parseInt(page + "", 10);
    if (perPage != null) limit = parseInt(perPage + "", 10);
    else limit = 10; // default per page

    if (page_ !== page_ || limit !== limit)
      return responseError(res, 500, "Could not parse query parameters");

    const offset = (page_ - 1) * limit;

    queryPages = "LIMIT ? OFFSET ?";
    colsPages = [limit, offset];
  }

  if (search != null) {
    querySearch = "AND keywords LIKE ?";
    colsSearch = ["%" + search + "%"];
  }

  const query = `SELECT t.id, t.name, t.keywords, t.image, t.description, GROUP_CONCAT(t.products) AS products FROM 
(SELECT c.id, c.name, c.keywords, c.image, c.description, 
JSON_OBJECT('id', p.id, 'name', p.name, 'image', p.image, 'price', p.price, 'priceDiscounted', p.price_discounted)
AS products FROM categories AS c, products AS p WHERE p.category_id = c.id ${querySearch}) t
GROUP BY t.id ${queryPages}`;
  const cols = [...colsSearch, ...colsPages];

  return queryDatabase(res, query, cols, (results) => {
    for (var i = 0; i < results.length; i++)
      results[i].products = JSON.parse(`[${results[i].products}]`);

    res.json(results);
  });
});

const ACCEPTED_PAYMENT_METHODS = ["cash"];

/** TODO
 * - Remove Items from stock + Create "order" object + notify people
 * - Return if (not)successful: eg products could not be available
 * ONLY ALLOW ONE REACTION ON AN ORDER, REMOVE ALL OTHERS.
 * to see who accepts order
 * https://discordjs.guide/popular-topics/reactions.html#awaiting-reactions
 */
app.post("/api/orders", (req, res) => {
  let { items, customerInfo, paymentMethod } = req.body;

  /* Validate json keys */
  if (items == null || customerInfo == null || paymentMethod == null) {
    return responseError(
      res,
      400,
      'Expected keys not defined, expected: "items": [...], "customerInfo": {...}, paymentMethod: "..."'
    );
  }

  /* Escape json data */
  customerInfo.name = validator.escape(customerInfo.name + "");
  customerInfo.address = validator.escape(customerInfo.address + "");
  customerInfo.phone = validator.escape(customerInfo.phone + "");
  customerInfo.comment =
    customerInfo.comment == null
      ? ""
      : validator.escape(customerInfo.comment + "");
  paymentMethod = validator.escape(paymentMethod + "");

  /* Validate json data */
  if (ACCEPTED_PAYMENT_METHODS.indexOf(paymentMethod) === -1)
    return responseError(
      res,
      422,
      `Invalid paymentMethod, expected: ${ACCEPTED_PAYMENT_METHODS}`
    );
  else if (customerInfo.name.length <= 1 || customerInfo.address.length <= 1)
    return responseError(
      res,
      422,
      'Invalid value for customerInfo "name" or "address", expected string with length > 1'
    );
  else if (!validator.isMobilePhone(customerInfo.phone))
    return responseError(
      res,
      422,
      'Invalid value for customerInfo "phone" (number), expected for example: "+49xxxxxxxxxxx"'
    );
  else if (
    !items.every(
      (itm) =>
        typeof itm.productID === "number" &&
        typeof itm.productQuantity === "number"
    )
  )
    return responseError(
      res,
      422,
      'Invalid value(s) for "items", expected: {"productID": some_integer, "productQuantity": some_integer}'
    );

  /* Prepare MYSQL query */
  let cols = [];
  let query = "SELECT * FROM products WHERE id IN (";

  for (var i = 0; i < items.length; i++) {
    cols.push(items[i].productID);
    if (i !== items.length - 1) query += "?, ";
    else query += "?) ORDER BY id ASC";
  }

  const orderId = 1234567890; // TODO

  queryDatabase(res, query, cols, (results) => {
    /* Form table from results. table describes order for employee delivery/organisation */
    let table = "",
      paymentDue = 0;

    // Loop each result (product) and find it's matching id in POST data. If found (productID exists in db), append item row to table.
    for (var i = 0; i < items.length; i++) {
      let productPOST = items[i];
      let productDB = results.find((p) => p.id === productPOST.productID);

      if (productDB === undefined)
        return responseError(
          res,
          200,
          `Could not find productID: ${productPOST.productID} in db`
        );

      let price = productDB.price_discounted
        ? productDB.price_discounted
        : productDB.price;
      let quantity = productPOST.productQuantity;
      let total = price * quantity;
      let name = productDB.name;

      table += `\n## '€${price} x${quantity} -> €${total}\t${name}'`;

      paymentDue += total;
    }

    /* Send table to discord */
    const messageSuccessful = discordSendMessage(
      `
\`\`\`prolog
#### ORDER ID - ${orderId} ####
# '${moment().format("MMMM Do YYYY, h:mm:ss a")}'
# Name: '${customerInfo.name}'
# Address: '${customerInfo.address}'
# Phone: ${customerInfo.phone}${
        customerInfo.comment
          ? "\n# Comment: '" + customerInfo.comment + "'"
          : ""
      }
#${table}
#
# Payment Method: '${paymentMethod}'
# Payment Due: €${paymentDue}
\`\`\`
`
    );

    if (!messageSuccessful)
      return responseError(
        res,
        503,
        "Could not issue order message, please try again",
        { "Retry-After": "500" }
      );

    // Success
    res.status(200).end();
  });
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
