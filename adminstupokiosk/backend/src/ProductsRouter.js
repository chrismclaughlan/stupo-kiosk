var db = require("./db");
var express = require("express");
var productsRouter = express.Router();
var multer = require("multer");
var { join } = require("path");
var MyStorageEngine = require("./MyStorageEngine");
const { unlinkSync } = require("fs");
const handleError = require("./Error").callback;
var mysql = require("mysql");

const PUBLIC_DIR = "public";
const IMAGES_DIR = "images";
const PRODUCTS_DIR = "products";

const getSaveDir = (image) => join(PUBLIC_DIR, IMAGES_DIR, PRODUCTS_DIR, image.toLowerCase());
const removePublicDir = (imagePath) => imagePath.replace(PUBLIC_DIR, "");
const addPublicDir = (imagePath) => join(PUBLIC_DIR, imagePath);

var multerStorage = MyStorageEngine({
  destination: (req, file, cb) => cb(null, getSaveDir(file.originalname)),
  // filename: (req, file, cb) => cb(null, file.originalname.toLowerCase()),
});

var multerFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
    return cb(new Error('Wrong file type, expected ".jpg" ".jpeg" ".png"'));

  cb(null, true);
};

const FIVE_MB_TO_BYTES = 5242880;
var upload = multer({ storage: multerStorage, fileFilter: multerFileFilter, limits: FIVE_MB_TO_BYTES }).single("image");

/* Create */
productsRouter.post("/create", (req, res) => {
  const errorType = "Error creating product";

  upload(req, res, (error) => {
    if (error) return handleError(res, errorType, "Uploading image", error.message, 500);

    let { category_id: categoryId, name, price, price_discounted: priceDiscounted } = req.body;
    // categoryId = parseInt(categoryId + "", 10);
    // price = parseFloat(price + "", 10);
    // priceDiscounted = parseFloat(priceDiscounted + "", 10);

    if (!categoryId || !name || !req.file || !price)
      return handleError(
        res,
        errorType,
        "Missing parameter(s)",
        'Expected "category_id", "name", "image", "price", OPTIONAL "price_discounted"'
      );

    let valuesFormat = [];
    let columnsFormat = ["category_id", "name", "image", "price"];
    let cols = [categoryId, name.trim(), removePublicDir(req.file.path), price];

    if (priceDiscounted) {
      columnsFormat.push("price_discounted");
      cols.push(priceDiscounted);
    }

    for (var i = 0; i < columnsFormat.length; i++) valuesFormat.push("?");

    const sql = `INSERT INTO products (${columnsFormat.join(", ")}) VALUES (${valuesFormat.join(", ")})`;
    db.query(sql, cols, (error, data, fields) => {
      if (error) return handleError(res, errorType, "Querying database", error.code, 500);

      if (data.affectedRows === 0) return handleError(res, errorType, "Querying database", "No rows affected");

      res.end();
    });
  });
});

/* Read */
productsRouter.get("/", (req, res) => {
  const errorType = "Error getting products";

  const sql = "SELECT * FROM products";
  const cols = [];
  db.query(sql, cols, (error, data, fields) => {
    if (error) return handleError(res, errorType, "Querying database", error.code, 500);

    return res.json(data);
  });
});

productsRouter.get("/:productId", (req, res) => {
  const errorType = "Error getting category";

  const { productId } = req.params;

  const sql = "SELECT * FROM products WHERE id = ?";
  const cols = [productId];
  db.query(sql, cols, (error, data, fields) => {
    if (error) return handleError(res, errorType, "Querying database", error.code, 500);

    return res.json(data);
  });
});

/* Update */
productsRouter.post("/update", (req, res) => {
  const errorType = "Error updating product";

  upload(req, res, (error) => {
    if (error) return handleError(res, errorType, "Uploading image", error.message, 500);

    const { id, category_id: categoryId, name, price, price_discounted: priceDiscounted } = req.body;

    // TODO delete old image <<<<<<<<<<<<<
    let columnsFormat = [];
    let cols = [];

    if (categoryId) {
      columnsFormat.push("category_id = ?");
      cols.push(categoryId);
    }

    if (name) {
      columnsFormat.push("name = ?");
      cols.push(name.trim());
    }

    if (req.file) {
      columnsFormat.push("image = ?");
      cols.push(removePublicDir(req.file.path));
    }

    if (price) {
      columnsFormat.push("price = ?");
      cols.push(price);
    }

    if (priceDiscounted) {
      columnsFormat.push("price_discounted = ?");
      cols.push(priceDiscounted);
    }

    if (!id || cols.length === 0)
      return handleError(
        res,
        errorType,
        "Missing parameter(s)",
        'Expected "id" AND one of "category_id", "name", "image", "price", "price_discounted"'
      );

    cols.push(id);
    const sql = `UPDATE products SET ${columnsFormat.join(", ")} WHERE id = ?`;
    db.query(sql, cols, (error, data, fields) => {
      if (error) return handleError(res, errorType, "Querying database", error.code, 500);

      if (data.affectedRows === 0) return handleError(res, errorType, "Querying database", "No rows affected");

      res.end();
    });
  });
});

/* Destroy */
productsRouter.post("/destroy", (req, res) => {
  const errorType = "Error destroying product";

  const { id } = req.body;

  if (!id) return handleError(res, errorType, "Missing parameter(s)", 'Expected "id"');

  const sqlImage = "SELECT image FROM products WHERE image = (SELECT image FROM products WHERE id = ?)";
  const sqlDelete = "DELETE FROM products WHERE id = ?";
  const cols = [id];

  db.query(sqlImage, cols, (errorImage, dataImage, fields) => {
    if (errorImage) return handleError(res, errorType, "Querying database (SELECT)", errorImage.code, 500);

    db.query(sqlDelete, cols, (errorDelete, dataDelete, fields) => {
      if (errorDelete) return handleError(res, errorType, "Querying database (DELETE)", errorDelete.code, 500);

      if (dataDelete.affectedRows === 0)
        return handleError(res, errorType, "Querying database (DELETE)", "No rows affected");

      /* If only one category uses image delete image */
      if (dataImage && dataImage.length === 1) {
        const imagePath = addPublicDir(dataImage[0].image);
        try {
          unlinkSync(imagePath);
        } catch (err) {
          //return handleError(res, errorType, "Deleting ", error.code, 500);
          console.error(`Error deleting image ${imagePath}`);
        }
      }

      res.end();
    });
  });
});

module.exports = productsRouter;
