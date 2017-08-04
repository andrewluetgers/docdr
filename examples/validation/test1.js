var dv = require('dv'),
	fs = require('fs'),
	util = require('../utils'),
	stats = require('simple-statistics');

var save = util.saver("results/test4/"),
	step = save.step,
	color = util.color;

var img = new dv.Image('png', fs.readFileSync('assets/test4.png'));

var scaled = 		step('scale', 				()=> util.scale(img));
var scaled2 =		new dv.Image(scaled);

// content-region ------------------------------------------------------------------
var thresholded = 		step('thresholded', 		()=> scaled.toGray().wolfAdaptiveThreshold(10, 10, .4));
// var eroded = 			step('region-erode', 		()=> thresholded.erode(15, 15));
var openMask = 			step('region-dilate', 		()=> thresholded.open(1, 2));
// var thin = 			step('region-thin', 		()=> openMask.thin(1'bg', 8, 4));
var regionBoxes = 		step('region-boxes', 		()=> openMask.connectedComponents(8));

var rx = Infinity,
	ry = Infinity,
	rx2 = 0,
	ry2 = 0;

regionBoxes.shift();
regionBoxes.forEach(b => {
	var min = Math.min(b.width, b.height),
		c = color();
	if (min > 5) {
		rx = Math.min(rx, b.x);
		ry = Math.min(ry, b.y);
		rx2 = Math.max(rx2, b.width+b.x);
		ry2 = Math.max(ry2, b.height+b.y);
		scaled2.drawBox(b, 4, c[0], c[1], c[2], .9)
	}
});

var contentBox = {x: rx, y: ry, width: rx2-rx, height: ry2-ry};
step("contentBox",  ()=> scaled2.drawBox(contentBox, 4, 255, 0, 0, .9));
console.log(contentBox);

// mask non-content regions of the image ---------------
var mask = new dv.Image(scaled2),
	imgBox = {x: 0, y: 0, width: mask.width, height: mask.height};

mask = 				step("mask", 				()=> mask.threshold(10).clearBox(imgBox).invert());
mask = 				step("mask2",				()=> mask.clearBox(contentBox));


// var thin = 		step('thin', 							()=> scaled.thin('bg', 8, 6));
// var open = 		step('open', 							()=> thin.dilate(2, 2));
// var eroded = 	step('erode', 							()=> img.toGray().erode(1, 1));
// var openMask = 	step('open', 							()=> eroded.dilate(1, 1));
// var openMap = 	step('openMap', 						()=> open.distanceFunction(8));

// otsu thrshold
// var otsu = openMap.otsuAdaptiveThreshold(200, 200, 0, 0, 0.06);

// var threshold = 			step('thresholdImg', 		()=> otsu.image);
// var thresholdValues = 	step('thresholdValues', 	()=> otsu.thresholdValues);

// simple threshold
// var threshold = 		step('threshold', 				()=> open.threshold(10));

// var openMask = 			step('openMask', 			()=> threshold.erode(2, 2));
// var openMask = 		step('open2', 						()=> open.dilate(2, 2));
// var openMask = 		step('open2', 					()=> thin.dilate(2, 2));
// var openMask = 	threshold;


var boxes,
	sName = 'draw-';

// boxes = scaled.toGray().connectedComponents(8);
boxes = 			step('boxes', 				()=> scaled.toGray().connectedComponents(8));

var drawn = [],
	areas = boxes.map(b => b.width * b.height),
	groups = stats.ckmeans(areas, 20),
	breaks = groups.map(g => Math.max.apply(null, g));


console.log(breaks);
var colors = breaks.map(()=> color());

boxes.forEach(b => {
	var c,
		min = Math.min(b.width, b.height);


	if (min > 3) {
		var area = b.width * b.height;
		for (var i in breaks) {
			var g = breaks[i];
			if (area < g) {
				c = colors[i];
				break;
			}
		}


		// step('box-'+i, ()=> img.crop(bi.x, bi.y, bi.width, bi.height));
		// tblrBoxes.push([bi.y, bi.y+bi.height, bi.x, bi.x+bi.width]);

		if (c) {
			drawn.push(b);
			scaled.drawBox(b, 2, c[0], c[1], c[2], .8);
		}
	}
});

sName += drawn.length+"-boxes";

drawn && step(sName, ()=> scaled);
