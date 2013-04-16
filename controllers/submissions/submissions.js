exports.create = function(req, res, next) {
  res.send("12345");
}

exports.get = function(req, res, next) {
  console.err("FUCK " + req.params);
  res.send("information about " + req.params.id);
}
