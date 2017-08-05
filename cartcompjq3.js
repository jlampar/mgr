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
	console.log("Version 3.0");
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

	var fileList = ['0000','0001','0002','0003','0004','0005','0006','0007','0008','0009','0010','0011','0012','0013','0014','0015','0016','0017','0018','0019','0100','0101','0102','0103','0104','0105','0106','0107','0108','0109','0110','0111','0112','0113','0114','0115','0116','0117','0118','0119','0200','0201','0202','0203','0204','0205','0206','0207','0208','0209','0210','0211','0212','0213','0214','0215','0216','0217','0218','0219','0300','0301','0302','0303','0304','0305','0306','0307','0308','0309','0310','0311','0312','0313','0314','0315','0316','0317','0318','0319','1000','1001','1002','1003','1004','1005','1006','1007','1008','1009','1010','1011','1012','1013','1014','1015','1016','1017','1018','1019','1100','1101','1102','1103','1104','1105','1106','1107','1108','1109','1110','1111','1112','1113','1114','1115','1116','1117','1118','1119','1200','1201','1202','1203','1204','1205','1206','1207','1208','1209','1210','1211','1212','1213','1214','1215','1216','1217','1218','1219','1300','1301','1302','1303','1304','1305','1306','1307','1308','1309','1310','1311','1312','1313','1314','1315','1316','1317','1318','1319','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2100','2101','2102','2103','2104','2105','2106','2107','2108','2109','2110','2111','2112','2113','2114','2115','2116','2117','2118','2119','2200','2201','2202','2203','2204','2205','2206','2207','2208','2209','2210','2211','2212','2213','2214','2215','2216','2217','2218','2219','2300','2301','2302','2303','2304','2305','2306','2307','2308','2309','2310','2311','2312','2313','2314','2315','2316','2317','2318','2319'];
	
	var queue = d3.queue();
	fileList.forEach(function(file) {
		var urlJSON = "https://rawgit.com/jlampar/mgr/master/jsonfile/cJSON/c" + file + ".min.topojson";
		queue.defer(d3.json, urlJSON);
	});

	queue.awaitAll(function(error, topology) {
		if (error) throw error;
		var initjson = topojson.feature(topology[199], Object.values(topology[199].objects)[0]);
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

		for(var pth = 0; pth < topology.length; pth++) {
			var geoPath = d3.geoPath().projection(mercator);
			var dat = topojson.feature(topology[pth], Object.values(topology[pth].objects)[0]);
			if(pth === 0) {
				g.append("g")
					.attr("id", fileList[pth])
					.selectAll("path")
					.data(dat.features)
					.enter()
					.append("path")
					.attr("id", function(d) {return d.properties.woj + fileList[pth];})
					.attr("d", geoPath)
					.style("fill", "#dee2ed")
					.style("stroke", "black")
					.style("stroke-width", "0.05em");
			} else {
				g.append("g")
					.attr("id", fileList[pth])
					.attr("class", "hide")
					.selectAll("path")
					.data(dat.features)
					.enter()
					.append("path")
					.attr("id", function(d) {return d.properties.woj + fileList[pth];})
					.attr("d", geoPath);
			}
			
			}
		});
	
	var actualStatus = [0,0,0,0];

	document.getElementById('nBase').onclick = function(){pathBetweening(3,0,true)};
	document.getElementById('pBase').onclick = function(){pathBetweening(3,0,false)};
	document.getElementById('nGene').onclick = function(){pathBetweening(4,1,true)};
	document.getElementById('pGene').onclick = function(){pathBetweening(4,1,false)};
	document.getElementById('nNet').onclick = function(){pathBetweening(2,2,true)};
	document.getElementById('pNet').onclick = function(){pathBetweening(2,2,false)};
	document.getElementById('nGauss').onclick = function(){pathBetweening(10,3,true)};
	document.getElementById('pGauss').onclick = function(){pathBetweening(10,3,false)};
	
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

	//clone function taken from SVG Path Morph Utility for KUTE.js
	function clone(a) {
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
	
	function pathParser(ID) {
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
	function bestIndex(IDenter,IDexit) {
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
	function twn(ID1,ID2) {
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
	
	function pathBetweening(endSwith,row,forward) {
		"use strict";
		if(actualStatus[row] >= 0 && actualStatus[row] <= endSwith - 1) {
			var endID = forward ? actualStatus.map((value, index) => index === row ? value + 1 : value) : actualStatus.map((value, index) => index === row ? value - 1 : value);
			var endCode = endID.join("");
			actualStatus = actualStatus[row] == endSwith - 1 ? actualStatus : endID;
			console.log(actualStatus);
			if(document.getElementById("0000") && document.getElementById(endCode)) {
				var startList = [], endList = [], tweenArray = [], varArray = [], startArray = [];
				for(var na=0 ; na < document.getElementById("0000").childNodes.length ; na++) {
					startList.push(document.getElementById("0000").childNodes[na].id);
					endList.push(document.getElementById(endCode).childNodes[na].id);
				}
				for(var nb=0 ; nb < startList.length ; nb++) {
					tweenArray.push([startList[nb],endList[nb]]);
				}
				for(var nc=0 ; nc < tweenArray.length ; nc++) {
					varArray.push(twn(tweenArray[nc][0],tweenArray[nc][1]));
				}
				for(var nd=0 ; nd < varArray.length ; nd++) {
					startArray.push(varArray[nd].start());
				}
				return startArray;
			}
		}
	}


	
		
});
