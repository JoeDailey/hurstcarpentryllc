
/* GET home page. */
exports.index = function(req, res) {
  res.render('index', { nav: '' });
};
exports.gallery = function(req, res) {
  res.render('index', { nav: 'Gallery' });
};

