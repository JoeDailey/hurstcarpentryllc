var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
	if(req.signedCookies && req.signedCookies.session == "nickhurst"){
		res.render("admin_index", {settings:global.settings});
	}else{
		var error = "";
		if(req.query.e)
			error = req.query.e;
		res.render("admin_login",{message:error});
	}
});
router.post('/login', function(req, res) {
	console.log(req.body);
	if(req.body.login == secret.login && req.body.pass == secret.pass){
		res.cookie('session', "nickhurst", { signed: true });
		res.redirect("/admin");
		return;
	}
	res.redirect("/admin?e=Wrong Combination");
});
router.get('/filters', function(req, res){
	console.log(req.signedCookies);
	if(req.signedCookies.session != "nickhurst"){res.redirect("/admin"); return;}
	res.render("admin_filters", {filters:[]});
});
router.get('/gallery', function(req, res){
	if(req.signedCookies.session != "nickhurst"){res.redirect("/admin"); return;}
	res.render("admin_gallery", {gallery:[], filters:[]});
});
router.get('/gallery/:entity', function(req, res){
	if(req.signedCookies.session != "nickhurst"){res.redirect("/admin"); return;}
	res.render("admin_gallery_entity", {});
});


module.exports = router;
