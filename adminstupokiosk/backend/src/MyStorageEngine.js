var fs = require("fs");
var sharp = require("sharp");

const IMAGE_SIZE = 100;

function getDestination(req, file, cb) {
  cb(null, "/dev/null");
}

function MyStorageEngine(opts) {
  this.getDestination = opts.destination || getDestination;
}

MyStorageEngine.prototype._handleFile = function _handleFile(req, file, cb) {
  this.getDestination(req, file, function (err, path) {
    if (err) return cb(err);

    var outStream = fs.createWriteStream(path);
    var resizer = sharp().resize(IMAGE_SIZE, IMAGE_SIZE).png();

    file.stream.pipe(resizer).pipe(outStream);
    outStream.on("error", cb);
    outStream.on("finish", function () {
      cb(null, {
        path: path,
        size: outStream.bytesWritten,
      });
    });
  });
};

MyStorageEngine.prototype._removeFile = function _removeFile(req, file, cb) {
  fs.unlink(file.path, cb);
};

module.exports = function (opts) {
  return new MyStorageEngine(opts);
};
