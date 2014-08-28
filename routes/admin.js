var express = require('express');
var router = express.Router();
var isErr = function(err, res){
	if(err){
		console.log(err);
		res.redirect("/admin?e=An error occurred!");
		return true;
	}
	return false;
}

/* GET users listing. */
router.get('/', function(req, res) {
	if(req.signedCookies && req.signedCookies.session == "nickhurst"){
		res.render("admin_index", {settings:global.settings, nav:"admin"});
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
	if(!admin(req, res)) return;
	db.all('SELECT * FROM filters', function(err, filtersList){
		res.render("admin_filters", {filters:filtersList, nav:"filters"});
	});
});
router.get('/filters/:filter_id', function(req, res){
	if(!admin(req, res)) return;
	db.get('SELECT * FROM filters WHERE filter_id="'+req.params.filter_id+'";', function(err, filterEntity){
		if(err || !filterEntity)
			res.redirect("/admin/filters?e=Filter does not exist.");
		else
			res.render("admin_filters_entity", {filter:filterEntity, nav:"filters"})
	});
});
router.get('/gallery', function(req, res){
	if(!admin(req, res)) return;
	db.all('SELECT * FROM filters', function(err, filtersList){
		db.all('SELECT showcases.*, filters.type AS filter_type FROM showcases LEFT JOIN filters ON showcases.filter_id=filters.filter_id', function(err, galleryList){
			console.log(galleryList)
			res.render("admin_gallery", {gallery:galleryList, filters:filtersList, nav:"gallery"});
		});
	});
});
router.get('/gallery/:showcases_id', function(req, res){
	console.log(res);
	if(!admin(req, res)) return;
	db.all('SELECT * FROM filters', function(err, filtersList){
		if(isErr(err, res)) return;
		db.get('SELECT * FROM showcases WHERE showcase_id="'+req.params.showcases_id+'"', function(err, gallery){
			if(isErr(err, res)) return;
			if(!gallery){
				res.redirect("/admin/gallery?e=Gallery does not exist.");
				return;
			}else{
				db.all('SELECT * FROM images WHERE showcase_id="'+req.params.showcases_id+'";', function(err, imageList){
					if(isErr(err, res)) return;
					if(!imageList) imageList = [];
					res.render("admin_gallery_entity", {filters:filtersList, gallery:gallery, images:imageList, nav:"gallery"});
				});
			}
		});
	});
});

global.admin = function(req, res){
	if(!req.signedCookies || req.signedCookies.session != "nickhurst"){
		res.redirect("/admin");
		return false;
	}
	return true;
}

module.exports = router;
