let dv = require('dv'),
	fs = require('fs'),
	util = require('../utils'),
	stats = require('simple-statistics');

let save = util.saver("results/content-region/"),
	step = save.step,
	color = util.color;

let img = new dv.Image('png', fs.readFileSync('assets/test1.png'));

let scaled = 		step('scale', 				()=> util.scale(img));
let thin = 			step('thin', 				()=> scaled.thin('bg', 8, 5));
let boxes,
	sName = 'draw-';

boxes = 			step('boxes', 				()=> thin.toGray().connectedComponents(8));

let drawn = [];

let x = Infinity,
	y = Infinity,
	w = 0,
	h = 0;

boxes.forEach(b => {
	let c = color(),
		min = Math.min(b.width, b.height);

	x = Math.min(x, b.x);
	y = Math.min(y, b.y);
	w = Math.min(w, b.width);
	h = Math.min(h, b.height);

	if (min > 30) {
		drawn.push(b);
		scaled.drawBox(b, 2, c[0], c[1], c[2], .8);
	}
});

sName += drawn.length+"-boxes";

drawn && step(sName, ()=> scaled);
