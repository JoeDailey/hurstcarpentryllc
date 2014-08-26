var express = require('express');
var router = express.Router();


/* GET home page. */
router.get("/", function(req, res) {
	db.all("SELECT  * FROM (  ( SELECT * FROM ( SELECT filter_id  FROM `filters`  GROUP BY filter_id ) AS 'tFilters'  ) AS 'mFilters'  LEFT JOIN  ( SELECT * FROM ( SELECT showcase_id, filter_id, title  FROM `showcases` ) AS 'tShowcases'  ) AS 'mShowcases' USING (`filter_id`)  INNER JOIN  ( SELECT * FROM ( SELECT *  FROM `images` ) AS 'tImages'  ) AS 'mImages' USING (`showcase_id`) );", function(err, imageList){
		res.render('index', { 
			settings:global.settings,
			photos: imageList,
			nav: '',
			admin:(req.signedCookies.session == "nickhurst"),
		});
	});
});

router.get("/gallery", function(req, res) {
  res.render('index', { nav: 'Gallery', admin:(req.signedCookies.session == "nickhurst")});
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
	res.render('success', { nav: 'Success' });
});

var monthlengths = [31,28,31,30,31,30,31,31,30,31,30,31];

module.exports = router;