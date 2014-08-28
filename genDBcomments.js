
var sqlite3 = require("sqlite3").verbose();
var file = __dirname + "/db.sqlite";

var s4 = function() {return Math.floor((1 + Math.random()) * 0x10000).toString(36);};
var db = new sqlite3.Database(file);
var lorem = [
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris a mollis sapien, vel ultricies tellus. Integer quis dui efficitur, placerat est id, molestie lorem. Nullam finibus purus orci, eget mattis eros ullamcorper non.",
	"Phasellus sollicitudin finibus massa, quis finibus sapien mattis nec. Donec tincidunt at urna et mattis. Fusce suscipit ipsum arcu, ut tempor risus scelerisque ut. Nulla pharetra tristique nulla, non sollicitudin neque.",
	"Aenean sit amet ante velit. Vestibulum posuere efficitur consectetur. Nam sagittis, elit eu efficitur fermentum, lectus tortor gravida massa, vitae sollicitudin odio diam et eros.",
	"Nullam metus nisl, auctor sed ullamcorper quis, porttitor non erat. Cras scelerisque ex sed elit blandit, eu luctus ipsum tincidunt. Mauris vel nisl non risus cursus rhoncus. Etiam id purus dui.",
	"Etiam vitae dolor eget est aliquet eleifend in at odio. Pellentesque lobortis dolor sed odio ullamcorper ornare.",
	"Praesent hendrerit nunc ac ex pharetra sollicitudin. Curabitur condimentum dignissim libero sed tempor. Etiam a diam aliquam, pharetra dolor eget, efficitur leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
	"Aliquam erat volutpat. Curabitur eu sem gravida, maximus nisl sed, varius ipsum. Curabitur accumsan urna nec rutrum varius. Phasellus scelerisque lectus eu euismod iaculis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
	"Donec vehicula porta convallis. Donec facilisis tempus auctor. In quis consectetur tortor. Ut finibus ante ligula. Aliquam mollis, velit ut ornare fringilla, ante leo porttitor odio, vel euismod mi purus ut nunc.",
	"Quisque leo libero, egestas dapibus metus non, convallis malesuada lectus. Curabitur at quam sed tortor iaculis gravida. Vivamus iaculis risus eget euismod elementum.",
	"Sed ac dui enim. Pellentesque molestie lectus neque, in efficitur arcu dapibus vel. Cras nec suscipit leo. Sed sollicitudin leo a ex pulvinar mollis. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
	"Maecenas fringilla sem maximus, rutrum justo et, fermentum odio.",
	"Quisque vel nibh ut justo eleifend rhoncus ut at magna. Nullam iaculis sapien ut quam tristique fringilla.",
	"Aliquam feugiat ex velit, elementum porta massa lobortis eget. Etiam quis mollis mauris, in molestie felis. Cras interdum est nec semper vulputate. Integer auctor neque dapibus blandit bibendum.",
	"Fusce nisi nulla, venenatis et pellentesque vel, fermentum vel ipsum. Cras tempus, sem vehicula lacinia lacinia, mauris lectus euismod ligula, quis aliquam diam arcu et tellus. Nulla facilisi.",
	"Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed vehicula nunc nisl, eu consectetur mauris auctor nec. Sed lacinia velit tellus, in porta sapien vehicula ac.",
	"Proin iaculis lacus a nisl varius, fermentum tempor nisl blandit. Sed neque augue, iaculis nec ultrices sit amet, lacinia in erat. Ut vel massa ut eros lacinia hendrerit.",
	"Etiam sed interdum neque. Fusce sem mauris, molestie sit amet rhoncus pretium, hendrerit a est. Etiam eros diam, consectetur a purus eu, faucibus vehicula urna. Vestibulum nec venenatis risus.",
	"Sed at leo at lectus ullamcorper convallis ac vitae risus. Donec eu neque dapibus, viverra diam eu, sollicitudin risus. Vivamus varius augue sed augue feugiat consectetur. Curabitur at iaculis ex.",
	"Duis id efficitur urna. Suspendisse potenti. Proin finibus tellus sed ex pellentesque, mollis porttitor orci sodales. Nunc est nulla, mollis at rutrum sed, mattis vitae magna."
];

var names = [
	"Leticia Wade",
	"Janis Welch",
	"Jeremy Morrison",
	"Isabel Myers",
	"Jose Ramirez",
	"Lillie Dawson",
	"Dawn Anderson",
	"Juan Lawson",
	"Tasha Hines",
	"Robert Schmidt"
]

db.run("DELETE FROM comments", function(){
	var Parents = [];
	for (var i = 0; i < 20; i++) {
		var id = s4();
		if(Parents.length == 0 || Math.random()<0.5){
			Parents.push(id);
			db.run("INSERT INTO comments ('comment_id', 'showcase_id', 'name', 'email_address', 'text') "+
				"VALUES ('c_"+id+"', 's_2ha1', '"+names[Math.floor(Math.random()*names.length)]+"', 'email', '"+lorem[Math.floor(Math.random()*lorem.length)]+"')")
		}else{
			var parent_id = Parents[Math.floor(Math.random()*Parents.length)];
			Parents.push(id);
			db.run("INSERT INTO comments ('comment_id', 'parent_id', 'showcase_id', 'name', 'email_address', 'text') "+
				"VALUES ('c_"+id+"', 'c_"+parent_id+"', 's_2ha1', '"+
					names[Math.floor(Math.random()*names.length)]+"', 'email', '"+lorem[Math.floor(Math.random()*lorem.length)]+"')")
		}
	};
})

