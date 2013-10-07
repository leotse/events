////////////////
// App Routes //
////////////////

// GET /
exports.index = function(req, res) {
  res.render('index', { user: req.user });
};

// GET /logout
exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
}