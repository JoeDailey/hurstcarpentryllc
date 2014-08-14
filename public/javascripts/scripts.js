$("textarea").bind("input propertychange", function(){
	$("#"+$(this).attr("id")+"shadow").val($(this).val());
});