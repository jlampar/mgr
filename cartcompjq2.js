//SVG fixer from: https://gist.github.com/leonderijke/c5cf7c5b2e424c0061d2#file-svgfixer-js
/**
 * SVG Fixer
 *
 * Fixes references to inline SVG elements when the <base> tag is in use.
 * Firefox won't display SVG icons referenced with
 * `<svg><use xlink:href="#id-of-icon-def"></use></svg>` when the <base> tag is on the page.
 *
 * More info:
 * - http://stackoverflow.com/a/18265336/796152
 * - http://www.w3.org/TR/SVG/linking.html
 *
 * One would think that setting the `xml:base` attribute fixes things,
 * but that is being removed from the platform: https://code.google.com/p/chromium/issues/detail?id=341854
 */

(function(document, window) {
	"use strict";

	/**
	* Initialize the SVG Fixer after the DOM is ready
	*/
	document.addEventListener("DOMContentLoaded", function() {

		/**
		 * Current URL, without the hash
		 */
		var baseUrl = window.location.href
			.replace(window.location.hash, "");

		/**
		*  Find all `use` elements with a namespaced `href` attribute, e.g.
		*  <use xlink:href="#some-id"></use>
		*
		*  See: http://stackoverflow.com/a/23047888/796152
		*/
		[].slice.call(document.querySelectorAll("use[*|href]"))

			/**
			* Filter out all elements whose namespaced `href` attribute doesn't
			* start with `#` (i.e. all non-relative IRI's)
			*
			* Note: we're assuming the `xlink` prefix for the XLink namespace!
			*/
			.filter(function(element) {
				return (element.getAttribute("xlink:href").indexOf("#") === 0);
			})

			/**
			* Prepend `window.location` to the namespaced `href` attribute value,
			* in order to make it an absolute IRI
			*
			* Note: we're assuming the `xlink` prefix for the XLink namespace!
			*/
			.forEach(function(element) {
				element.setAttribute("xlink:href", baseUrl + element.getAttribute("xlink:href"));
			});

	}, false);

}(document, window));

$(document).ready(function(){

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
	var mercator = d3.geoMercator();

	var fileList = [151,81,61,41,21,11,7,5,3,1];
	var gaussValueList = ["init",81,61,41,21,11,7,5,3,1];
	
	var queue = d3.queue();
	fileList.forEach(function(value) {
		url = "https://rawgit.com/jlampar/mgr/master/jsonfile/qc" + String(value) + ".json";
		queue.defer(d3.json, url);
	});

	queue.awaitAll(function(error, topology) {
		if (error) throw error;
		var initjson = topojson.feature(topology[0], Object.values(topology[0].objects)[0]);
		mercator
			.scale(1)
			.translate([0,0]);
		var geoPathInit = d3.geoPath().projection(mercator);
		var b = geoPathInit.bounds(initjson);
		var s = .95 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h);
		var t = [(w - s * (b[1][0] + b[0][0])) / 2, (h - s * (b[1][1] + b[0][1])) / 2];
		mercator
			.scale(s)
			.translate(t);

		for(i = 0; i < topology.length; i++) {
			var geoPath = d3.geoPath().projection(mercator);
			var dat = topojson.feature(topology[i], Object.values(topology[i].objects)[0]);
			if(i === 0) {
				g.append("g")
					.attr("id", i)
					.selectAll("path")
					.data(dat.features)
					.enter()
					.append("path")
					.attr("id", function(d) {return d.properties.woj + String(i);})
					.attr("d", geoPath)
					.style({
						"fill": "#dee2ed",
						"stroke": "black",
						"stroke-width": "0.05em"
					});
			} else {
				g.append("g")
					.attr("id", i)
					.attr("class", "hide")
					.selectAll("path")
					.data(dat.features)
					.enter()
					.append("path")
					.attr("id", function(d) {return d.properties.woj + String(i);})
					.attr("d", geoPath);
			}
			
			}
		});

	i = 0;
	
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
			var slicedPath = qstr.replace(/[MZ]/g,'').replace(/[L]/g,' ').split(' ');
			var coo = [];
			for(var h=0;h<xArray.length;h++) {
				coo.push([parseFloat(((slicedPath[r].replace(/["]/g,''))[g].split(',')[0])[h]),parseFloat(((slicedPath[r].replace(/["]/g,''))[g].split(',')[1])[h])]);
				}
				return coo;
			}
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
				}
			return dxy.indexOf(Math.min.apply(null,dxy));
			}
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
			}
		};
			
	var actualStatus = 0;
	document.getElementById("display").innerHTML = "<p>"+String(gaussValueList[actualStatus])+"</p>";
	
	document.getElementById('NBt').onclick = function() {
		//if (error) throw error;
		if (actualStatus < gaussValueList.length) {
			var preNext = actualStatus + 1;
			var nextTarget = String(preNext);
			if (document.getElementById("0") && document.getElementById(nextTarget)) {
				var dispList = [];
				var nextList = [];
				var dispObject = document.getElementById("0");
				var nextObject = document.getElementById(nextTarget);
				for (var num=0; num < dispObject.childNodes.length; num++) {
					dispList.push(dispObject.childNodes[num].id);
					nextList.push(nextObject.childNodes[num].id);
					}
				var tweenArray = [];
				for (var tnum=0; tnum < dispList.length; tnum++) {
					tweenArray.push([dispList[tnum],nextList[tnum]]);
					}
				var varArray = [];
				for (var vnum=0; vnum < tweenArray.length; vnum++) {
					varArray.push(twn(tweenArray[vnum][0],tweenArray[vnum][1]));
					}
				actualStatus += 1;
				document.getElementById("display").innerHTML = "<p>"+String(gaussValueList[actualStatus])+"</p>";
				nextStart = [];
				for(var ALO=0; ALO < varArray.length; ALO++){
					nextStart.push(varArray[ALO].start());
					}
				return nextStart;
				}
			}
		};
	
	document.getElementById('PBt').onclick = function() {
		//if (error) throw error;
		if (actualStatus >= 0) {
			var prePrev = actualStatus - 1;
			var prevTarget = String(prePrev);
			if (document.getElementById("0") && document.getElementById(prevTarget)) {
				var disppList = [];
				var prevList = [];
				var disppObject = document.getElementById("0");
				var prevObject = document.getElementById(prevTarget);
				for (var numm=0; numm < disppObject.childNodes.length; numm++) {
					disppList.push(disppObject.childNodes[numm].id);
					prevList.push(prevObject.childNodes[numm].id);
					}
				var tweennArray = [];
				for (var tnumm=0; tnumm < disppList.length; tnumm++) {
					tweennArray.push([disppList[tnumm],prevList[tnumm]]);
					}
					var varrArray = [];
				for (var vnumm=0; vnumm < tweennArray.length; vnumm++) {
					varrArray.push(twn(tweennArray[vnumm][0],tweennArray[vnumm][1]));
					}
				actualStatus -= 1;
				document.getElementById("display").innerHTML = "<p>"+String(gaussValueList[actualStatus])+"</p>";
				prevStart = [];
				for(var ALT=0; ALT < varrArray.length; ALT++){
					prevStart.push(varrArray[ALT].start());
					}		
				return prevStart;
				}
			}
		};
	
	var cnt = $('#cont');
	var head = $('#header');
	var parastory = $('#paraStory');
	var first = $('#first');
	var second = $('#second');
	var third = $('#third');
	$(window).on('scroll', function() {
	//if($(window).width() > 961) {
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
		//}
	});
	
	$(window).on("resize", function() {
		if($(window).width() <= 961) {
			parastory.css({"opacity": "1"});
			first.css({"opacity": "1"});
			second.css({"opacity": "1"});
			third.css({"opacity": "1"});
			}
	});
	
	$(".boxFrame").hover(
		function(){
			if($(window).width() > 961) {
				$(this).children(".icon").toggleClass("icon over");
			}
		},
		function(){
			if($(window).width() > 961) {
				$(this).children(".over").toggleClass("over icon");
			}
		});
		
});
