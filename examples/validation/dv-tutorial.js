var dv = require('dv'), 
	fs = require('fs'),	
	util = require('../utils');

var save = util.saver("results/dv-tutorial/"),
	step = save.step;

var barcodes = new dv.Image('png', fs.readFileSync('assets/form2.png'));

var thin = 		step('thin', 		()=> barcodes.thin('bg', 8, 5));
var open = 		step('open', 		()=> thin.dilate(3, 3));
var openMap = 	step('openMap', 	()=> open.distanceFunction(8));
var openMask = 	step('openMask', 	()=> openMap.threshold(10).erode(22, 22));
var boxes = 	step('boxes', 		()=> openMask.invert().connectedComponents(8));

for (var i in boxes) {
	var bi = boxes[i];
	step('box-'+i, ()=> barcodes.crop(bi.x, bi.y, bi.width, bi.height));
}