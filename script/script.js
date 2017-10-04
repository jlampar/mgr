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
	
	var lists = {
		files: ['0000','0001','0002','0003','0004','0005','0006','0007','0008','0009','0010','0011','0012','0013','0014','0015','0016','0017','0018','0019','0100','0101','0102','0103','0104','0105','0106','0107','0108','0109','0110','0111','0112','0113','0114','0115','0116','0117','0118','0119','0200','0201','0202','0203','0204','0205','0206','0207','0208','0209','0210','0211','0212','0213','0214','0215','0216','0217','0218','0219','0300','0301','0302','0303','0304','0305','0306','0307','0308','0309','0310','0311','0312','0313','0314','0315','0316','0317','0318','0319','1000','1001','1002','1003','1004','1005','1006','1007','1008','1009','1010','1011','1012','1013','1014','1015','1016','1017','1018','1019','1100','1101','1102','1103','1104','1105','1106','1107','1108','1109','1110','1111','1112','1113','1114','1115','1116','1117','1118','1119','1200','1201','1202','1203','1204','1205','1206','1207','1208','1209','1210','1211','1212','1213','1214','1215','1216','1217','1218','1219','1300','1301','1302','1303','1304','1305','1306','1307','1308','1309','1310','1311','1312','1313','1314','1315','1316','1317','1318','1319','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2100','2101','2102','2103','2104','2105','2106','2107','2108','2109','2110','2111','2112','2113','2114','2115','2116','2117','2118','2119','2200','2201','2202','2203','2204','2205','2206','2207','2208','2209','2210','2211','2212','2213','2214','2215','2216','2217','2218','2219','2300','2301','2302','2303','2304','2305','2306','2307','2308','2309','2310','2311','2312','2313','2314','2315','2316','2317','2318','2319'],
		colors: ['#f2f0f7','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#4a1486'],
		breaksAbsolute: [33852, 52710, 110498, 167292, 202605, 496489, 1416412],
		breaksRelative: [2.09,3.26,5.14,6.35,8.71,12.49,24.76]
	},
	
	h = document.getElementById("basket").offsetHeight,
	w = h,
	svg = d3.select(document.getElementById("basket"))
		.append("svg")
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox","0 0 " + w + " " + h)
		.attr("id", "SVG"),
	basket = d3.select('#basket'),
	g = svg.append("g")
		.attr("id", "container"),
	mercator = d3.geoMercator(),
	orderList = [],
	
	color = d3.scaleThreshold()
		.domain(lists.breaksAbsolute)
		.range(lists.colors),

	colorRel = d3.scaleThreshold()
		.domain(lists.breaksRelative)
		.range(lists.colors),
	
	queue = d3.queue();

	lists.files.forEach(function(file) {
		var urlJSON = "https://rawgit.com/jlampar/mgr/master/data/JSON/c" + file + ".min.topojson";
		queue.defer(d3.json, urlJSON);
		orderList.push(file);
	});

	queue.defer(d3.csv, "https://rawgit.com/jlampar/mgr/master/data/choropeth_data.csv");

	queue.awaitAll(function(error, dataSet) {
		"use strict";
		if (error) throw error;
		var widzObj = {}, wzgObj = {}, areaObj = {}, areaGraphObj = {}, aTest = {}, iteratorObj = {},
		csv = dataSet[dataSet.length - 1];
		csv.forEach(
			function(d) {
				widzObj[d.woj] = +d.widz;
				wzgObj[d.woj] = +d.wzgwidz;
				areaObj[d.woj] = +d.area;
			});

		var largestExtent = orderList.indexOf("2019");
		var initjson = topojson.feature(dataSet[largestExtent], Object.values(dataSet[largestExtent].objects)[0]);
		orderList.length = 0;
		mercator
			.scale(1)
			.translate([0,0]);
		
		var geoPathInit = d3.geoPath().projection(mercator),
		b = geoPathInit.bounds(initjson),
		s = .95 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h),
		t = [(w - s * (b[1][0] + b[0][0])) / 2, (h - s * (b[1][1] + b[0][1])) / 2];
		
		mercator
			.scale(s)
			.translate(t);
		
		for(var pth = 0; pth < dataSet.length - 1; pth++) {
			areaGraphObj[lists.files[pth]] = Object.values(dataSet[String(pth)].objects)[0].geometries;

			var geoPath = d3.geoPath().projection(mercator),
			dat = topojson.feature(dataSet[pth], Object.values(dataSet[pth].objects)[0]);
			if(pth === 0) {
				g.append("g")
					.attr("id", lists.files[pth])
					.selectAll("path")
					.data(dat.features)
					.enter()
					.append("path")
					.attr("id", function(d) {return d.properties.woj + lists.files[pth];})
					.attr("d", geoPath)
					.style("fill", function(d) {return color(widzObj[d.properties.woj]);})
					.style("stroke", "black")
					.style("stroke-width", "0.05em");
			} else {
				g.append("g")
					.attr("id", lists.files[pth])
					.attr("class", "hide")
					.selectAll("path")
					.data(dat.features)
					.enter()
					.append("path")
					.attr("id", function(d) {return d.properties.woj + lists.files[pth];})
					.attr("d", geoPath);
			}
			
			}

			for(var elem in areaGraphObj) {
				var objRow = Object.values(areaGraphObj[elem]),
				rowArray = [];
				for(var el = 0 ; el < objRow.length ; el++) {
					rowArray.push(areaGraphObj[elem][el].properties.Shape_Area);
				}
				iteratorObj[elem] = rowArray;
			}

			var h2 = 60,
			w2 = h2,
			svg2 = d3.select(document.getElementById("relativeBasket"))
				.append("svg")
				.attr("preserveAspectRatio", "xMinYMin meet")
				.attr("viewBox","0 0 " + w2 + " " + h2)
				.attr("id", "rSVG"),

			relBasket = d3.select('#relativeBasket'),

			dat2 = topojson.feature(dataSet[0], Object.values(dataSet[0].objects)[0]);

			mercator.scale(1).translate([0,0]);

			var extentPath = d3.geoPath().projection(mercator),
			b2 = extentPath.bounds(dat2),
			s2 = .95 / Math.max((b2[1][0] - b2[0][0]) / w2, (b2[1][1] - b2[0][1]) / h2),
			t2 = [(w2 - s2 * (b2[1][0] + b2[0][0])) / 2, (h2 - s2 * (b2[1][1] + b2[0][1])) / 2];
			mercator
				.scale(s2)
				.translate(t2);

			var geoPath2 = d3.geoPath().projection(mercator);

			svg2.append("g")
				.attr("id", "relCont")
				.selectAll("path")
				.data(dat2.features)
				.enter()
				.append("path")
				.attr("id", function(d) {return d.properties.woj;})
				.attr("d", geoPath2)
				.style("fill", function(d) {return colorRel(wzgObj[d.properties.woj])})
				.style("stroke", "black")
				.style("stroke-width", "0.01em");
			
			d3.select(document.getElementById("legendBasket")).append("div").style("display", "block").attr("id", "labels");
			var labelDiv = d3.select(document.getElementById("labels"));
			labelDiv.append("div").text("[%]").style("display", "inline-block").style("width", "100px").style("height", "7px").style("text-align", "right").style("margin-right", "1em").style("font-size", "small");
			labelDiv.append("div").style("width", "30px").style("height", "10px").style("display", "inline-block");
			labelDiv.append("div").text("[%]").style("display", "inline-block").style("width", "100px").style("height", "7px").style("text-align", "right").style("margin-right", "1em").style("font-size", "small");
		
			var commaFormat = d3.format(".2f");

			for(var l = lists.colors.length - 1 ; l >= 0 ; l--) {
				var targetDiv = "leg"+l;
				d3.select(document.getElementById("legendBasket")).append("div").style("display", "block").attr("id", targetDiv);
				var liDiv = d3.select(document.getElementById(targetDiv));
				liDiv.append("div").text(
					(l == lists.colors.length - 1) ? 
						"powyżej " + String(commaFormat(lists.breaksRelative[l-1])) : 
							(l == 0 ? "poniżej " + String(commaFormat(lists.breaksRelative[l+1])) : 
							commaFormat(lists.breaksRelative[l-1]) + " - " + commaFormat(lists.breaksRelative[l]))
					).style("display", "inline-block").style("width", "100px").style("height", "7px").style("text-align", "right").style("margin-right", "1em").style("font-size", "small");
				liDiv.append("div").style("background-color", lists.colors[l]).style("width", "30px").style("height", "10px").style("display", "inline-block");
				liDiv.append("div").text(
					(l == lists.colors.length - 1) ? 
						"powyżej " + String(lists.breaksAbsolute[l-1]) : 
							(l == 0 ? "poniżej " + String(lists.breaksAbsolute[l+1]) : 
							String(lists.breaksAbsolute[l-1]) + " - " + String(lists.breaksAbsolute[l]))
					).style("display", "inline-block").style("width", "100px").style("height", "7px").style("text-align", "left").style("margin-left", "1em").style("font-size", "small");
			}

		});

	var description = {
		based: ["województwa", "powiaty", "gminy"],
		gene: ["500","1000","2000","4000"],
		net: ["256","512"],
		kernel: ["151","81","61","41","21","11","7","5","3","1"]
	}
	
	var memoryStatus = null;
	var actualStatus = [0,0,0,0];

	document.getElementById("tdBase").innerHTML = description.based[actualStatus[0]];
	document.getElementById("tdGene").innerHTML = description.gene[actualStatus[1]];
	document.getElementById("tdNet").innerHTML = description.net[actualStatus[2]];
	document.getElementById("tdGauss").innerHTML = description.kernel[actualStatus[3]];

	document.getElementById('nBase').onclick = function(){pathBetweening(2,0,true)};
	document.getElementById('pBase').onclick = function(){pathBetweening(2,0,false)};
	document.getElementById('nGene').onclick = function(){pathBetweening(3,1,true)};
	document.getElementById('pGene').onclick = function(){pathBetweening(3,1,false)};
	document.getElementById('nNet').onclick = function(){pathBetweening(1,2,true)};
	document.getElementById('pNet').onclick = function(){pathBetweening(1,2,false)};
	document.getElementById('nGauss').onclick = function(){pathBetweening(9,3,true)};
	document.getElementById('pGauss').onclick = function(){pathBetweening(9,3,false)};
	
	var contentDiv = $('#cont'),
	headerDiv = $('#header'),
	paraStory = $('#paraStory'),
	first = $('#first'),
	second = $('#second'),
	third = $('#third');
	$(window).on('scroll', function() {
		var st = $(this).scrollTop();
		contentDiv.css({  
			'opacity' : 1 - st/200
			}); 
		headerDiv.css({  
			'opacity' : 1 - st/130
			}); 
		paraStory.css({
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
			paraStory.css({"opacity": "1"});
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
	}
	
	function pathParser(ID) {
		if(document.getElementById(ID)) {
			var dAttr = document.getElementById(ID).getAttribute("d"),
			strPath = '"'+String(dAttr)+'"',
			slicedPath = strPath.replace(/[MZ]/g,'').replace(/[L]/g,' ').split(' '),
			coordinatesArray = [];
			for(var h=0;h<slicedPath.length;h++) {
				coordinatesArray.push([parseFloat(((slicedPath.replace(/["]/g,'')).split(',')[0])[h]),parseFloat(((slicedPath.replace(/["]/g,'')).split(',')[1])[h])]);
				}
				return coordinatesArray;
			}
		}
	
			//function based on KUTE.js Path Morph Log best morph index from SVG Path Morph Utility for KUTE.js
	function bestIndex(IDenter,IDexit) {
		if(document.getElementById(IDenter) && document.getElementById(IDexit)) {
			enterPath = pathParser(IDenter);
			exitPath = pathParser(IDexit);
			var enterClone = clone(enterPath),
			exitClone = clone(exitPath),
			dxy = [], dx, dy;
			for(var i=0;i<exitClone.length;i++) {
				idArray = exitClone.splice(i,exitPath.length - i);
				exitClone = idArray.concat(exitClone);
				dx = Math.abs(enterClone[i][0] - exitClone[i][0]);
				dy = Math.abs(enterClone[i][1] - exitClone[i][1]);
				dxy.push(Math.sqrt(dx*dx + dy*dy));
				exitClone.length = 0; exitClone = clone(exitPath); idArray = null;
				}
			return dxy.indexOf(Math.min.apply(null,dxy));
			}
		}
			
	//function checks both paths, finds the best morph index and waits for execution
	function tweening(ID1,ID2) {
		if(document.getElementById(ID1) && document.getElementById(ID2)) {
			enterID = document.getElementById(ID1);
			exitID = document.getElementById(ID2);
			var tween = KUTE.fromTo(enterID, 
				{path: enterID},
				{path: exitID},
				{
					morphPrecision: 1,
					morphIndex: bestIndex(enterID,exitID),
					easing: 'easingElasticInOut',
					duration: 500
					});
				return tween;
			}
		}
	
	//function performs the actual inbetweening
	function pathBetweening(endSwitch,row,forward) {
		"use strict";
		var endID = forward ? 
			(actualStatus[row] !== endSwitch ? 
				actualStatus.map((value, index) => index === row ? value + 1 : value) 
				: actualStatus)
			: (actualStatus[row] !== 0 ?
				actualStatus.map((value, index) => index === row ? value - 1 : value)
				: actualStatus);
		var endCode = endID.join("");
		memoryStatus = actualStatus;
		actualStatus = endID;
		if(document.getElementById("0000") && document.getElementById(endCode) && memoryStatus.join("") !== endCode) {
			
			document.getElementById("tdBase").innerHTML = description.based[actualStatus[0]];
			document.getElementById("tdGene").innerHTML = description.gene[actualStatus[1]];
			document.getElementById("tdNet").innerHTML = description.net[actualStatus[2]];
			document.getElementById("tdGauss").innerHTML = description.kernel[actualStatus[3]];

			var startList = [], endList = [], tweenArray = [], varArray = [], startArray = [];
			for(var na=0 ; na < document.getElementById("0000").childNodes.length ; na++) {
				startList.push(document.getElementById("0000").childNodes[na].id);
				endList.push(document.getElementById(endCode).childNodes[na].id);
			}
			for(var nb=0 ; nb < startList.length ; nb++) {
				tweenArray.push([startList[nb],endList[nb]]);
			}
			for(var nc=0 ; nc < tweenArray.length ; nc++) {
				varArray.push(tweening(tweenArray[nc][0],tweenArray[nc][1]));
			}
			for(var nd=0 ; nd < varArray.length ; nd++) {
				startArray.push(varArray[nd].start());
			}
			return startArray;

			startList.length = 0; 
			endList.length = 0; 
			tweenArray.length = 0;
			varArray.length = 0;
			startArray.length = 0;
		}
		
	}
});
