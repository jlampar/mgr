$(document).ready(function(){

	var cnt = $('#cont');
	var head = $('#header');
	var parastory = $('#paraStory');
	var first = $('#first');
	var second = $('#second');
	var third = $('#third');
	$(window).on('scroll', function() {
		var st = $(this).scrollTop();
		cnt.css({  
			'opacity' : 1 - st/200
			}); 
		head.css({  
			'opacity' : 1 - st/130
			}); 
		parastory.css({
			'opacity' : 0 + st/350
			});
		first.css({
			'opacity' : 0 + st/450
			});
		second.css({
			'opacity' : 0 + st/470
			});
		third.css({
			'opacity' : 0 + st/490
			});
	});

	$(".boxFrame").hover(
		function(){
			if($(window).width() > 961) {
    			$(this).children(".icon").toggleClass("icon over");
    		};
    	},
    	function(){
    		if($(window).width() > 961) {
    			$(this).children(".over").toggleClass("over icon");
    		};
    	});


	
});