$(document).ready(function(){
	
	/* borders transformation with Gastner-Newman diffusion-based cartogram method; Cartogram computed in ArcMAP, converted from SHP to JSON*/

	var h = document.getElementById("basket").offsetHeight;
	var w = h;

	var svg = d3.select(document.getElementById("basket"))
		.append("svg")
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox","0 0 " + w + " " + h)
		.attr("id", "SVG");

	var basket = d3.select('#basket');

	var g = svg.append("g")
		.attr("id", "container");

	var mercator = d3.geoMercator()
		.scale(1)
		.translate([0,0]);

	var geoPathInit = d3.geoPath().projection(mercator);

	var b = geoPathInit.bounds(init);
	var s = .95 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h);
	var t = [(w - s * (b[1][0] + b[0][0])) / 2, (h - s * (b[1][1] + b[0][1])) / 2];

	mercator.scale(s).translate(t);

	var geoPathInitUpdated = d3.geoPath().projection(mercator);

	g.append("g")
		.attr("id", "init")
		.attr("class", "wojewodztwo")
		.selectAll("path")
		.data(init.features)
		.enter()
		.append("path")
		.attr("id", function(d) {return d.properties.wojewodztw + '_init';})
		.attr("d", geoPathInitUpdated)
		.style({
			fill: "#dee2ed",
			stroke: "black"
			});
			
	//to get synchronous execution and load data in a loop
	var varList = [init,c500,c250,c200,c150,c100,c90,c80,c70,c60,c50,c40,c30,c20,c15,c10,c5,c1];
	var gaussValueList = ["init",500,250,200,150,100,90,80,70,60,50,40,30,20,15,10,5,1]

	for (var i=0; i<varList.length;i++) {
		item = varList[i];
		var geoPath = d3.geoPath().projection(mercator);
		g.append("g")
			.attr("id", i)
			.attr("class", "hide")
			.selectAll("path")
			.data(item.features)
			.enter()
			.append("path")
			.attr("id", function(d) {return d.properties.wojewodztw + i;})
			.attr("d", geoPath)
			.style({
				fill: "#ccc",
				stroke: "black"
				});
		};

	//clone function taken from SVG Path Morph Utility for KUTE.js
	clone = function(a) {
				var copy;
				if (a instanceof Array) {
					copy = [];
					for (var i = 0, len = a.length; i < len; i++) {
						copy[i] = clone(a[i]);
					}
					return copy;
				}
				return a;
			};

	pathParser = function(ID) {
		if(document.getElementById(ID)) {
			var str = document.getElementById(ID).getAttribute("d");
			var qstr = '"'+String(str)+'"';
			var noMZPath = qstr.replace(/[MZ]/g,'');
			var cleanPath = noMZPath.replace(/[L]/g,' ');
			var slicedPath = cleanPath.split(' ');
			var coordArray = []
			for(var r=0;r<slicedPath.length;r++) {
				coordArray.push(slicedPath[r].replace(/["]/g,''));
				};
			var xArray = [], yArray = [];
			for(var g=0;g<coordArray.length;g++) {
				xArray.push(coordArray[g].split(',')[0]);
				yArray.push(coordArray[g].split(',')[1]);
				};
			coo = [];
			for(var h=0;h<xArray.length;h++) {
				coo.push([parseFloat(xArray[h]),parseFloat(yArray[h])]);
				};
				return coo;
			};
		};
	
	//function based on KUTE.js Path Morph Log best morph index from SVG Path Morph Utility for KUTE.js
	bestIndex = function(IDenter,IDexit) {
		if(document.getElementById(IDenter) && document.getElementById(IDexit)) {
			enterPath = pathParser(IDenter);
			exitPath = pathParser(IDexit);
			var enterClone = clone(enterPath);
			var exitClone = clone(exitPath);
			var dxy = [], dx, dy;
			for(var i=0;i<exitClone.length;i++) {
				numerator = exitClone.splice(i,exitPath.length - i);
				exitClone = numerator.concat(exitClone);
				dx = Math.abs(enterClone[i][0] - exitClone[i][0]);
				dy = Math.abs(enterClone[i][1] - exitClone[i][1]);
				dxy.push(Math.sqrt(dx*dx + dy*dy));
				exitClone = []; exitClone = clone(exitPath); numerator = null;
				};
			return dxy.indexOf(Math.min.apply(null,dxy));
			};
		};
			
	//function checks both paths, finds the best morph index and waits for execution
	twn = function(ID1,ID2) {
		if(document.getElementById(ID1) && document.getElementById(ID2)) {
			enID = document.getElementById(ID1);
			exID = document.getElementById(ID2);
			var tween = KUTE.fromTo(enID, 
				{path: enID},
				{path: exID},
				{
					morphPrecision: 1,
					morphIndex: bestIndex(enID,exID),
					easing: 'easingElasticInOut',
					duration: 500
					});
				return tween;
			};
		};
			
	var actualStatus = 0;
	document.getElementById("display").innerHTML = "<p>"+String(gaussValueList[actualStatus])+"</p>";

	document.getElementById('NBt').onclick = function() {
		if (actualStatus < varList.length) {
			var preNext = actualStatus + 1;
			var nextTarget = String(preNext);
			if (document.getElementById("init") && document.getElementById(nextTarget)) {
				var dispList = [];
				var nextList = [];
				var dispObject = document.getElementById("init");
				var nextObject = document.getElementById(nextTarget);
				for (var num=0; num < dispObject.childNodes.length; num++) {
					dispList.push(dispObject.childNodes[num].id);
					nextList.push(nextObject.childNodes[num].id);
					};
				var tweenArray = [];
				for (var tnum=0; tnum < dispList.length; tnum++) {
					tweenArray.push([dispList[tnum],nextList[tnum]]);
					};
				var varArray = [];
				for (var vnum=0; vnum < tweenArray.length; vnum++) {
					varArray.push(twn(tweenArray[vnum][0],tweenArray[vnum][1]));
					};
				actualStatus += 1;
				document.getElementById("display").innerHTML = "<p>"+String(gaussValueList[actualStatus])+"</p>";
				nextStart = [];
				for(var ALO=0; ALO < varArray.length; ALO++){
					nextStart.push(varArray[ALO].start());
					};
				return nextStart;
				};
			};	
		};

	document.getElementById('PBt').onclick = function() {
		if (actualStatus >= 0) {
			var prePrev = actualStatus - 1;
			var prevTarget = String(prePrev);
			if (document.getElementById("init") && document.getElementById(prevTarget)) {
				var disppList = [];
				var prevList = [];
				var disppObject = document.getElementById("init");
				var prevObject = document.getElementById(prevTarget);
				for (var numm=0; numm < disppObject.childNodes.length; numm++) {
					disppList.push(disppObject.childNodes[numm].id);
					prevList.push(prevObject.childNodes[numm].id);
					};
				var tweennArray = [];
				for (var tnumm=0; tnumm < disppList.length; tnumm++) {
					tweennArray.push([disppList[tnumm],prevList[tnumm]]);
					};
					var varrArray = [];
				for (var vnumm=0; vnumm < tweennArray.length; vnumm++) {
					varrArray.push(twn(tweennArray[vnumm][0],tweennArray[vnumm][1]));
					};
				actualStatus -= 1;
				document.getElementById("display").innerHTML = "<p>"+String(gaussValueList[actualStatus])+"</p>";
				prevStart = [];
				for(var ALT=0; ALT < varrArray.length; ALT++){
					prevStart.push(varrArray[ALT].start());
					};			
				return prevStart;
				};
			};
		};

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
