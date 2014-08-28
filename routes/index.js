var express = require('express');
var router = express.Router();
var isErr = function(err, res){
	if(err){
		console.log(err);
		res.redirect("/?e=An Error Has Occurred");
		return true;
	}
	return false;
}

/* GET home page. */
router.get("/", function(req, res) {
	db.all("SELECT  * FROM (  ( SELECT * FROM ( SELECT filter_id  FROM `filters`  GROUP BY filter_id ) AS 'tFilters'  ) AS 'mFilters'  LEFT JOIN  ( SELECT * FROM ( SELECT showcase_id, filter_id, title  FROM `showcases` ) AS 'tShowcases'  ) AS 'mShowcases' USING (`filter_id`)  INNER JOIN  ( SELECT * FROM ( SELECT *  FROM `images` ) AS 'tImages'  ) AS 'mImages' USING (`showcase_id`) );", function(err, imageList){
		res.render('user_index', { 
			settings:global.settings,
			photos: imageList,
			nav: '',
			admin:(req.signedCookies.session == "nickhurst"),
		});
	});
});

router.post("/make_estimate", function(req, res) {
	// var transport = nm.createTransport();
	var transport = nm.createTransport("direct", {debug: true});
	console.log(global.secret, global.secret.from);
	transport.sendMail({
	    from: "Hurst Carpentry <"+global.secret.from+">", // sender address
	    to: "<"+req.body.email+">", // list of receivers
	    subject: "Your estimate", // Subject line
	    text: "Thank you for submiting your estimate request. Someone will get back to you within 48 hours.", // plaintext body
	    html: "<h1>Thank you!</h1><br><p>Your request has been logged, and someone will contact you within 48 hours.</p><br><h2> The estimate information you supplied:</h2><p style='margin:10px'>"+
	    		req.body.name+"<br>"+
	    		req.body.email+"<br>"+
	    		req.body.location+"<br>"+
	    		req.body.type+"<br>"+
	    		req.body.description+"</p>"+
	    		"<h2>-Hurst Carpentry</h2><br><p>If you do not recieve a response withing 48 hours please call (920)209-1741.</p>" // html body
	}, function(error, response){
	    if(error){
	        console.log(error);
	        res.redirect("/m?An error has occured. Please try again. This issue has been logged.")
	        return;
	    }

	    // response.statusHandler only applies to 'direct' transport
	    response.statusHandler.once("failed", function(data){
	        console.log(
	          "Permanently failed delivering message to %s with the following response: %s",
	          data.domain, data.response);
	        res.redirect("/m?An error has occured. Please try again and check that the email you entered is yours. This issue has been logged.")
	    });

	    response.statusHandler.once("requeue", function(data){
	        console.log("Temporarily failed delivering message to %s", data.domain);
	    });

	    response.statusHandler.once("sent", function(data){
	        console.log("Message was accepted by %s", data.domain);
	        res.redirect("/estimate");
	    });
	});
	var today = new Date();
	var month = today.getMonth();
	var day = today.getDate();
	var year = today.getFullYear();
	if(monthlengths[today.getMonth()] > today.getDate+2){
		month = (today.getMonth()+2)%12;
		day = (day+2)%monthlengths[today.getMonth()];
		if(today.getMonth()==11)
			year = year+1;
	}
	transport.sendMail({
	    from: "Hurst Carpentry <"+global.secret.from+">", // sender address
	    to: global.secret.to, // list of receivers
	    subject: "New estimate Request Pending", // Subject line
	    text: "A new estimate request has been made:\n"+
	    		req.body.name+"\n"+
	    		req.body.email+"\n"+
	    		req.body.location+"\n"+
	    		req.body.type+"\n"+
	    		req.body.description+"\n A response is expected by "+
	    		month+"/"+
	    		day+"/"+
	    		year+" at "+
	    		today.toLocaleTimeString()+".",
	    html: "<h1>A new estimate request has been made:</h1><br><p>"+req.body.name+" is expecting a response by "+
	    		month+"/"+
	    		day+"/"+
	    		year+" at "+
	    		today.toLocaleTimeString()+
	    		".</p><h2> The estimate information supplied:</h2><p style='margin:10px'>"+
	    		req.body.name+"<br>"+
	    		req.body.email+"<br>"+
	    		req.body.location+"<br>"+
	    		req.body.type+"<br>"+
	    		req.body.description+"</p>" // html body
	}, function(error, response){
	    if(error){
	        console.log(error);
	        fs.writeFile(__dirname+"/../logs/"+s4()+s4(), JSON.stringify(req.body));
	        return;
	    }

	    // response.statusHandler only applies to 'direct' transport
	    response.statusHandler.once("failed", function(data){
	        console.log(
	          "Permanently failed delivering message to %s with the following response: %s",
	          data.domain, data.response);
	        fs.writeFile(__dirname+"/../logs/"+s4()+s4(), req.body);
	    });
	});
});

router.get("/estimate", function(req, res) {
	res.render('user_success', { nav: 'Success' });
});

router.get("/gallery", function(req, res){
	db.all("SELECT * FROM (SELECT showcases.*, images.image_url, images.image_order FROM showcases LEFT JOIN images USING ('showcase_id') ORDER BY image_id ASC ) GROUP BY showcase_id", function(err, galleryList){
		res.render("user_gallery", {
			nav:"Gallery",
			galleries:galleryList,
			admin:(req.signedCookies.session == "nickhurst")
		});
	});
});

router.get("/gallery/:showcase_id", function(req, res){
	var locks = 3, _gallery_entity, _imageList, _commentHTML;
	var done = function(){
		locks--;
		if(locks<=0){
			res.render("user_gallery_entity", {
				nav:"Gallery",
				gallery:_gallery_entity,
				images:_imageList,
				comments:_commentHTML,
				admin:(req.signedCookies.session == "nickhurst")
			});
		}
	}
	db.get("SELECT showcases.*, filters.type FROM showcases LEFT JOIN filters USING ('filter_id') WHERE showcase_id='"+req.params.showcase_id+"';", function(err, gallery_entity){
		if(isErr(err, res)) return;
		_gallery_entity = gallery_entity;
		done();
	});
	db.all("SELECT * FROM images WHERE showcase_id='"+req.params.showcase_id+"';", function(err, imageList){
		if(isErr(err, res)) return;
		_imageList = imageList;
		done();
	});
	db.all("SELECT * FROM comments WHERE showcase_id='"+req.params.showcase_id+"' ORDER BY created_at DESC;", function(err, commentList){
		// if(isErr(err, res)) return;
		var commentMap = {};
		for(var commentIndex in commentList){
			var comment = commentList[commentIndex];
			comment.children = [];
			commentMap[comment.comment_id] = comment;
		}
		console.log("mapped", commentMap);
		for(var commentIndex in commentMap){
			var comment = commentMap[commentIndex];
			if(comment.parent_id){
				commentMap[comment.parent_id].children.push(comment);
			}
		}
		for(var commentIndex in commentMap){
			if(commentMap[commentIndex].parent_id){
				delete commentMap[commentIndex];
			}
		}
		var HTML = "";
		for(var commentIndex in commentMap){
			HTML += generateCommentHTML(commentMap[commentIndex]);
		}
		console.log("done", JSON.stringify(commentMap), HTML);
		_commentHTML = HTML;
		done();
	});
});

var generateCommentHTML = function(comment){
	var html = "";
	if(!comment.parent_id)
		html += '<div class="card">';
	{
		
		html += "<div class='comment-container' id='"+comment.comment_id+"' comment-id='"+comment.comment_id+"'>";
		{
			html += "<h3 class='comment-name'>" +comment.name + "</h3>";
			html += "<p class='comment-text'>" +comment.text + "</p>";
			html += "<button class='comment-reply-button'>Reply</button>"

			for(var commentIndex in comment.children){
				html += generateCommentHTML(comment.children[commentIndex]);
			}
		}
		html += "</div>"
	}
	if(!comment.parent_id)
		html += '</div>';
	return html;
}

var monthlengths = [31,28,31,30,31,30,31,31,30,31,30,31];

module.exports = router;