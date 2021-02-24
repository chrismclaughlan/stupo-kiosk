const callback = (res, type, message, detail = null, code = 200) => {
  const error = {
    type,
    message,
    detail,
  };
  console.error(error);
  res.status(code).json({ error });
};

module.exports = { callback };
