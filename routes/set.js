var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');


/* GET users listing. */
router.post('/new_filter', function(req, res) {
	if(!admin(req, res)) return;
	console.log(req.body);
	db.run("INSERT INTO filters ('filter_id', 'type', 'details', 'price', 'price_per') "+
			"VALUES ('"+global.s4()+"', '"+req.body.type+"', '"+req.body.details+"',"+
			" '"+req.body.price+"', '"+req.body.price_per+"')", function(err){
				if(err) console.log(err);
				res.redirect("/admin/filters");
			});
});
router.post('/update_filter/:filter_id', function(req, res) {
	if(!admin(req, res)) return;
	console.log(req.body);
	db.run("UPDATE filters SET type='"+req.body.type+"', details='"+req.body.details+"', "+
				"price='"+req.body.price+"', price_per='"+req.body.price_per+"' WHERE filter_id='"+req.params.filter_id+"'",
				function(err){
					if(err) console.log(err);
					res.redirect("/admin/filters/");
				});
});
router.post('/delete_filter/:filter_id', function(req, res){
	if(!admin(req, res)) return;
	db.run("DELETE FROM filters WHERE filter_id='"+req.params.filter_id+"'", function(){
		res.redirect("/admin/filters");
	});
})

//////Gallery
router.post('/new_gallery', function(req, res) {
	if(!admin(req, res)) return;
	console.log(req.body);
	db.run("INSERT INTO showcases ('showcase_id', 'title', 'about', 'location', 'price', 'filter_id') "+
			"VALUES ('s_"+global.s4()+"', '"+req.body.title+"', '"+req.body.about+"',"+
			" '"+req.body.location+"', '"+req.body.price+"', '"+req.body.filter_id+"')", function(err){
				if(err) console.log(err);
				res.redirect("/admin/gallery");
			});
});
router.post('/update_gallery/:showcase_id', function(req, res) {
	if(!admin(req, res)) return;
	console.log(req.body);
	db.run("UPDATE showcases SET title='"+req.body.title+"', about='"+req.body.about+"', location='"+req.body.location+"', "+
			" price='"+req.body.price+"', filter_id='"+req.body.filter_id+"' WHERE showcase_id='"+req.params.showcase_id+"'", function(err){
				if(err) console.log(err);
				res.redirect("/admin/gallery");
			});
});
router.post('/delete_gallery/:showcase_id', function(req, res){
	if(!admin(req, res)) return;
	db.run("DELETE FROM showcases WHERE showcase_id='"+req.params.showcase_id+"'", function(){
		res.redirect("/admin/gallery");
	});
});

//images
router.post('/add_images/:showcase_id', function(req, res){
	if(!admin(req, res)) return;
	var form = new formidable.IncomingForm(),
	files = [];


	form.uploadDir = global.__project_dirname+"/tmp";
	form.on('file', function(field, file) {
		console.log(file);

		file.image_id = global.s4()+global.s4();
		file.endPath = global.__project_dirname+"/public/images/"+file.image_id+"."+file.type.replace("image/","");
		files.push({field:field, file:file});
	});
	form.on('end', function() {
		console.log('done');
		console.log(files);
		db.get("SELECT image_order FROM images WHERE showcase_id='"+req.params.showcase_id+
			"' ORDER BY image_order DESC LIMIT 1", function(err, image_number){
			if(err){
				console.log(err);
			}
			var db_index = 0;
			if(image_number) db_index = image_number.image_order;
			files.forEach(function(file, index){
				console.log(file.file.path, "-->", file.file.endPath);
				try{
					fs.renameSync(file.file.path, file.file.endPath);
				}catch (e){
					console.log(e);
				}
				db.run(	"INSERT INTO images ('image_id', 'image_url', 'image_order', 'showcase_id') "+
						"VALUES ('"+file.file.image_id+"', '"+file.file.endPath+"', '"+( ++db_index )+"', '"+req.params.showcase_id+"')", function(err){
							if(index == files.length) res.redirect("/admin/gallery"+req.params.showcase_id);
				});
			});
		});
	});
	form.parse(req);
});


module.exports = router;
