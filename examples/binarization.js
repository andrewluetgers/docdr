let docdr = require('../lib/docdr'),
    fs = require('fs'),
    _ = require('lodash');

let pix = docdr.pix,
    util = docdr.util,
    images = [
	     ['assets/nick1.png', 1],
	     ['assets/nick2.png', 1],
	     ['assets/nick3.png', 1],
	     ['assets/nick4.png', 1],
	     ['assets/nick5.png', 1],
	     ['assets/OriginalImages/HW01.png', 1],
	     ['assets/OriginalImages/HW02.png', 1],
	     ['assets/OriginalImages/HW03.png', 1],
	     ['assets/OriginalImages/HW04.png', 1],
	     ['assets/OriginalImages/HW05.png', 1],
	     ['assets/OriginalImages/HW06.png', 1],
	     ['assets/OriginalImages/HW07.png', 1],
	     ['assets/OriginalImages/HW08.png', 1],
	     ['assets/OriginalImages/PR01.png', 1],
	     ['assets/OriginalImages/PR02.png', 1],
	     ['assets/OriginalImages/PR03.png', 1],
	     ['assets/OriginalImages/PR04.png', 1],
	     ['assets/OriginalImages/PR05.png', 1],
	     ['assets/OriginalImages/PR06.png', 1],
	     ['assets/OriginalImages/PR07.png', 1],
	     ['assets/OriginalImages/PR08.png', 1],
	    ['assets/test1.png', 12],
	    ['assets/test2.png', 8],
	    ['assets/test3.png', 8],
	    ['assets/test4.png', 8],
	    ['assets/test5.png', 8],
	     ['assets/a.png', 3],
	     ['assets/b.png', 3],
	     ['assets/c.png', 2],
	     ['assets/d.png', 2]
	    // ['assets/textpage300.png', 10]
    ],
    windowSizes = [
	    5,
	    9,
	    15,
	    19,
	    25,
	    55,
	    99
    ],
    connections = 8;



function settingsFn(commonSettings, im, windowSize) {
	let imName = im[0].split("/").pop().split(".").shift(),
	    plName = commonSettings.pipelineName || "pipeline";
	
	let w = windowSize,
		settings = {
			pipelineName:			"binarization",
			otsuBinarizedCfg: 		{w: 128, h: 128, sw: w, sh: w, score: 0.1},
			wolfBinarizedCfg: 		{w: w, h: w, k: 0.3},
			nickBinarizedCfg: 		{w: w, h: w, k: -0.2},
			niblackBinarizedCfg: 	{w: w, h: w, k: -0.2},
			sauvolaBinarizedCfg: 	{w: w, h: w, k: 0.2}
		};
	
	return _.assign(settings, {
		imageName: 			imName,
		imagePath: 			im[0],
		docHeight: 			im[1],
		resultsPath: 		"results/" + plName + "-" + imName + "-" + w +"/",
		saveSteps: 			true,
		timings:			true,
	});
}

let settings = {
	pipelineName:			"binarization",
};

// see http://www.leptonica.com/papers/texred.pdf
let pipeline = {
	// (1) is a reduced representation of the original image; we produced it with a
	// sequence of level 2 threshold reductions to give a good visual appearance
	img: 					s => pix('png', fs.readFileSync(s.imagePath)),
	gray: 					s => s.img.toGray(),
	
	otsuBinarized: 			(s, c) => s.gray.otsuAdaptiveThreshold(c.w, c.h, c.sw, c.sh, c.score).image,

	nickBinarized: 			(s, c) => s.gray.nickAdaptiveThreshold(c.w, c.h, c.k),

	niblackBinarized: 		(s, c) => s.gray.niblackAdaptiveThreshold(c.w, c.h, c.k),

	sauvolaBinarized: 	    (s, c) => s.gray.sauvolaAdaptiveThreshold(c.w, c.h, c.k),
	
	wolfBinarized: 			(s, c) => s.gray.wolfAdaptiveThreshold(c.w, c.h, c.k),
};


util.runVariants(pipeline, settingsFn, settings, images, windowSizes);






