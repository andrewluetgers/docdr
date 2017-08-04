//
// var memwatch = require('memwatch-next'),
// 	heapdump = require('heapdump');
//
// memwatch.on('leak', function(info) {
// 	console.error('Memory leak detected: ', info);
//
// 	var path = __dirname +"/"+ Date.now() + '.heapsnapshot';
// 	heapdump.writeSnapshot(path, () => {
// 		console.log("Heap shot saved to: " + __dirname +"/"+ Date.now() + '.heapsnapshot');
// 	});
// });


var dv = require('dv'),
	fs = require('fs'),
	_ = require('lodash'),
	util = require('../utils');

var images = [
		// ['assets/chessboard_hires.png', 5],
		// ['assets/nick1.png', 1],
		// ['assets/nick2.png', 1],
		// ['assets/nick3.png', 1],
		// ['assets/nick4.png', 1],
		// ['assets/nick5.png', 1],
		// ['assets/OriginalImages/HW01.png', 1],
		// ['assets/OriginalImages/HW02.png', 1],
		// ['assets/OriginalImages/HW03.png', 1],
		// ['assets/OriginalImages/HW04.png', 1],
		// ['assets/OriginalImages/HW05.png', 1],
		// ['assets/OriginalImages/HW06.png', 1],
		// ['assets/OriginalImages/HW07.png', 1],
		// ['assets/OriginalImages/HW08.png', 1],
		// ['assets/OriginalImages/PR01.png', 1],
		// ['assets/OriginalImages/PR02.png', 1],
		// ['assets/OriginalImages/PR03.png', 1],
		// ['assets/OriginalImages/PR04.png', 1],
		// ['assets/OriginalImages/PR05.png', 1],
		// ['assets/OriginalImages/PR06.png', 1],
		// ['assets/OriginalImages/PR07.png', 1],
		// ['assets/OriginalImages/PR08.png', 1],
		['assets/test1.png', 12],
		// ['assets/test2.png', 8],
		// ['assets/test3.png', 8],
		['assets/test4.png', 8]
		// ['assets/test5.png', 8],
		// ['assets/a.png', 3],
		// ['assets/b.png', 3],
		// ['assets/c.png', 2],
		// ['assets/d.png', 2]
		// ['assets/textpage300.png', 10]
	];


function settingsFn(commonSettings, im, dpi) {
	var imName = im[0].split("/").pop().split(".").shift(),
		plName = commonSettings.pipelineName || "pipeline";

	return _.assign(_.cloneDeep(commonSettings), {
		imageName: 			imName,
		imagePath: 			im[0],
		docHeight: 			im[1],
		resultsPath: 		"results/" + plName + "-" + imName + "-" + dpi + "/",
		saveSteps: 			true,
		timings:			true,
	});
}

var settings = {
	pipelineName:			"pageseg",
	grayScaledCfg:			{dpi: 150},
	otsuBinarizedCfg: 		{w: 128, h: 128, sw: 16, sh: 16, score: 0.1},
	wolfBinarizedCfg: 		{w: 16, h: 16, k: 0.3},
	nickBinarizedCfg: 		{w: 16, h: 16, k: -0.2},
	reducedCfg:				{factors: [1, 0, 0, 0]},
	seedClosedCfg:			{w: 4, h: 4},
	seedReducedCfg:			{factors: [4, 4, 1, 0]},
	seedOpenedCfg:			{w: 5, h: 5},
	seedExpandedCfg:		{factor: 8},
	maskClosedCfg:			{w: 4, h: 4},

	imgMaskCfg:				{connectivity: 8, w: 8, h: 8},
	htMaskExpandedCfg:		{factor: 2},
	resultCfg:				{save: true},
	imageRegionsCfg:		{connectivity: 8},
	whitespaceMaskCfg:		{sequence: 'o80.60'},
	noThinVertLinesCfg:		{w: 5, h: 1},
	vertWhitespaceCfg:		{w: 1, h: 200},
	textlineMaskCfg:		{w: 30, h: 1},
	textlineMask2bCfg:		{w: 3, h: 3}
};


// see http://tpgit.github.io/Leptonica/livre__pageseg_8c_source.html
var pipeline = {
	// (1) is a reduced representation of the original image; we produced it with a
	// sequence of level 2 threshold reductions to give a good visual appearance
	img: 					s => new dv.Image('png', fs.readFileSync(s.imagePath)),
	gray: 					s => s.img.toGray(),

	// pick an thresholding method
	// otsuBinarized: 		(s, cfg) => s.gray.otsuAdaptiveThreshold(cfg.w, cfg.h, cfg.sw, cfg.sh, cfg.score).image,
	// binarized:			(s, c) => s.otsuBinarized,

	// nickBinarized: 		(s, cfg) => s.gray.nickAdaptiveThreshold(cfg.w, cfg.h, cfg.k),
	// binarized:			(s, c) => s.nickBinarized,

	wolfBinarized: 			(s, c) => s.gray.wolfAdaptiveThreshold(c.w, c.h, c.k),
	binarized:				(s, c) => s.wolfBinarized,

	// Reduce to 150 ppi
	reduced:				(s, c) => s.binarized.reduceRankBinaryCascade(...c.factors),


	// Get seed for halftone parts
	// Get mask for connected regions
	holeFilledInv:			(s, c) => s.reduced.invert().holeFill(),
	holeFilled:				(s, c) => s.reduced.holeFill(),
	seedClosed:				(s, c) => s.reduced.closeSafe(c.w, c.h),
	seedReduced:			(s, c) => s.seedClosed.reduceRankBinaryCascade(...c.factors),
	seedOpened: 			(s, c) => s.seedReduced.open(c.w, c.h),
	seedExpanded:			(s, c) => s.seedOpened.expandBinaryPower2(c.factor),

	// Get mask for connected regions
	maskClosed:				(s, c) => s.reduced.closeSafe(c.w, c.h),

	// Fill seed into mask to get halftone mask
	imgMask:				(s, c) => s.seedExpanded.seedFill(s.maskClosed, c.connectivity).dilate(c.w, c.h),
	imgMask2:				(s, c) => s.imgMask.expandBinaryPower2(2),

	// Extract halftone stuff
	imageAreas:				(s, c) => s.imgMask.and(s.reduced),


	// experimental halftone stuff: --------------------------------------------------
	// outputs the image area bounding rects. Useful if you can assume image regions
	// are actually rectangular, not always a safe assumption. Will capture more detail
	// than ANDing the htMask, leading to a cleaner whitespaceMask.

	// removes the bounding rect area of all imageRegions
	// imageRegions:		(s, c) => s.imgMask.connectedComponents(c.connectivity),
	// nonImageAreas :		s => {
	// 						var im = new dv.Image(s.reduced);
	// 						s.imageRegions.forEach(b => im.clearBox(b));
	// 						return im;
	// 					},
	// ----------------------------------------------------------------------------


	// subtracts pixels of htMask, will leave some smaller disconnected portions of images
	// but will not risk removing text regions overlapping the image bounding rect
	nonImageAreasSafe:		(s,c) => s.reduced.subtract(s.imgMask),

	// Extract non-halftone stuff
	nonImageAreas:			(s,c) => s.imageAreas.xor(s.reduced),

	// Get bit-inverted image
	textInverted: 			s => s.nonImageAreas.invert(),

	/* The whitespace mask will break text lines where there is a large amount of white space
	below or above. We can prevent this by identifying regions of the inverted image that
	have large horizontal (bigger than the separation between columns) and significant
	vertical extent (bigger than the separation between text lines), and subtracting this from
	the whitespace mask. */
	whitespaceMask:			(s, c) => {
								var im = s.textInverted.morphCompSequence(c.sequence, 0);
								return s.textInverted.subtract(im);
							},


	// Identify vertical whitespace by opening inverted image
	noThinVertLines:		(s, c) => s.whitespaceMask.open(c.w, c.h), // removes thin vertical lines
	vertWhitespace:			(s, c) => s.noThinVertLines.open(c.w, c.h), // gets long vertical lines

	// Get proto (early processed) text line mask.
	// First close the characters and words in the textlines
	textlineMask:			(s, c) => s.nonImageAreas.closeSafe(c.w, c.h),

	// Next open back up the vertical whitespace corridors
	textlineMask2a:			(s, c) => s.textlineMask.subtract(s.vertWhitespace),

	// Do a small opening to remove noise
	textlineMask2b:			(s, c) => s.textlineMask2a.open(c.w, c.h),
	textlineMask3:			(s, c) => s.textlineMask2b.expandBinaryPower2(2),

	// Join pixels vertically to make text block mask
	txtBlockMask:			(s, c) => s.textlineMask2b.morphSequence("c1.10 + o4.1", 0),

	/* Solidify the textblock mask and remove noise:
	 *  (1) For each c.c., close the blocks and dilate slightly to form a solid mask.
	 *  (2) Small horizontal closing between components
	 *  (3) Open the white space between columns, again
	 *  (4) Remove small components */
	txtBlocks:				(s, c) => s.txtBlockMask
										.morphSequenceByComponent("c30.30 + d3.3", 8, 0, 0)
										.closeSafe(10, 1)
										.subtract(s.vertWhitespace),

	txtSelect:				(s, c) => s.txtBlocks.selectBySize(25, 5, 8, 'both', 'gte').expandBinaryPower2(2),

	// Identify the outlines of each textblock
	// not implemented

	// Fill line mask (as seed) into the original
	textlineMask4a:			(s, c) => s.textlineMask3.seedFill(s.binarized, 8),
	textlineMask4b:			(s, c) => s.textlineMask3.or(s.textlineMask4a),

	// Fill halftone mask (as seed) into the original
	imgAreasMasked1: 		(s, c) => s.imgMask2.seedFill(s.binarized, 8),
	imgAreasMasked2: 		(s, c) => s.imgMask2.or(s.imgAreasMasked1),

	// Find objects that are neither text nor halftones
	non1:					(s, c) => s.binarized.subtract(s.textlineMask4b),  /* remove text pixels */
	non2:					(s, c) => s.non1.subtract(s.imgAreasMasked2),  /* remove halftone pixels */

	textMaskBoxes:			(s, c) => s.textlineMask4b.connectedComponents(4),
	imageMaskBoxes:			(s, c) => s.imgAreasMasked2.connectedComponents(8),

	textBoxes:				(s, c) => util.drawBoxes(s.img, s.textMaskBoxes, 4, .8),
	imageBoxes:				(s, c) => util.drawBoxes(s.img, s.imageMaskBoxes, 4, .8, [255, 0, 0]),

	// regions:				(s, c) => s.reduced.regions(),
	// regionsI:				(s, c) => s.regions.images,
	// regionsL:				(s, c) => s.regions.lines,
	// regionsP:				(s, c) => s.regions.paragraphs
	whiteBlocks:			(s, c) => s.txtSelect.expandBinaryPower2(2).whiteBlocks(),
	wbOutlines:				(s, c) => util.drawBoxes(s.txtSelect, s.whiteBlocks, 4, .8),
	components:				(s, c) => s.textlineMask4b.connectedComponentImages(8)
};


util.runVariants(pipeline, settingsFn, settings, images, [150]);
