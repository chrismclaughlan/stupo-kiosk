var db = require("./db");
var express = require("express");
var categoriesRouter = express.Router();
var multer = require("multer");
var { join } = require("path");
var MyStorageEngine = require("./MyStorageEngine");
const { unlinkSync } = require("fs");
const handleError = require("./Error").callback;

const PUBLIC_DIR = "public";
const IMAGES_DIR = "images";
const CATEGORIES_DIR = "categories";

const getSaveDir = (image) => join(PUBLIC_DIR, IMAGES_DIR, CATEGORIES_DIR, image.toLowerCase());
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
categoriesRouter.post("/create", (req, res) => {
  const errorType = "Error creating category";

  upload(req, res, (error) => {
    if (error) return handleError(res, errorType, "Uploading image", error.message, 500);

    const { name, keywords, description } = req.body;

    if (!name || !keywords || !req.file || !description)
      return handleError(res, errorType, "Missing parameter(s)", 'Expected "name", "keywords", "image", "description"');

    const sql = "INSERT INTO categories (name, keywords, image, description) VALUES (?, ?, ?, ?)";
    const cols = [name, keywords, removePublicDir(req.file.path), description];
    db.query(sql, cols, (error, data, fields) => {
      if (error) return handleError(res, errorType, "Querying database", error.code, 500);

      if (data.affectedRows === 0) return handleError(res, errorType, "Querying database", "No rows affected");

      res.end();
    });
  });
});

/* Read */
categoriesRouter.get("/", (req, res) => {
  const errorType = "Error getting categories";

  const sql = "SELECT * FROM categories";
  const cols = [];
  db.query(sql, cols, (error, data, fields) => {
    if (error) return handleError(res, errorType, "Querying database", error.code, 500);

    return res.json(data);
  });
});

categoriesRouter.get("/:categoryId", (req, res) => {
  const errorType = "Error getting category";
  const { categoryId } = req.params;

  const sql = "SELECT * FROM categories WHERE id = ?";
  const cols = [categoryId];
  db.query(sql, cols, (error, data, fields) => {
    if (error) return handleError(res, errorType, "Querying database", error.code, 500);

    return res.json(data);
  });
});

/* Update */
categoriesRouter.post("/update", (req, res) => {
  const errorType = "Error updating category";

  upload(req, res, (error) => {
    if (error) return handleError(res, errorType, "Uploading image", error.message, 500);

    const { id, name, keywords, description } = req.body;

    // TODO delete old image <<<<<<<<<<<<<
    let columnsFormat = [];
    let cols = [];

    if (name) {
      columnsFormat.push("name = ?");
      cols.push(name.trim());
    }

    if (keywords) {
      columnsFormat.push("keywords = ?");
      cols.push(keywords.trim().toLowerCase());
    }

    if (req.file) {
      columnsFormat.push("image = ?");
      cols.push(removePublicDir(req.file.path));
    }

    if (description) {
      columnsFormat.push("description = ?");
      cols.push(description.trim());
    }

    if (!id || cols.length === 0)
      return handleError(
        res,
        errorType,
        "Missing parameter(s)",
        'Expected "id" AND one of "name", "keywords", "image", "description"'
      );

    cols.push(id);
    const sql = `UPDATE categories SET ${columnsFormat.join(", ")} WHERE id = ?`;
    db.query(sql, cols, (error, data, fields) => {
      if (error) return handleError(res, errorType, "Querying database", error.code, 500);

      if (data.affectedRows === 0) return handleError(res, errorType, "Querying database", "No rows affected");

      res.end();
    });
  });
});

/* Destroy */
categoriesRouter.post("/destroy", (req, res) => {
  const errorType = "Error destroying category";

  const { id } = req.body;

  if (!id) return handleError(res, errorType, "Missing parameter(s)", 'Expected "id"');

  const sqlImage = "SELECT image FROM categories WHERE image = (SELECT image FROM categories WHERE id = ?)";
  const sqlDelete = "DELETE FROM categories WHERE id = ?";
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

module.exports = categoriesRouter;
