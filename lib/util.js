
let fs = require('fs'),
    glob = require('glob'),
    randomcolor = require('randomcolor');


let now = ()=> new Date().getTime(),
    delta = (s)=> now()-s,
    events = {},
    mark = (name, sub)=> {
	    let s = events[name];
	    if (s) {
		    console.log(name, sub||"", "took:" + delta(s) + "ms");
		    !sub && (events[name] = 0);
	    } else {
		    events[name] = now();
	    }
    };

function color() {
	return randomcolor({
		luminosity: 'light',
		format: 'rgbArray'
	});
}

function _save(dir, name, input, fmt, step) {
	if (!input) return;
	
	let format = fmt,
	    objFmt = obj => (obj.images && 'concat' in obj.images)
		    ? obj.images[0].toBuffer ? 'imageArray' : 'json'
		    : (('toBuffer' in input) || Buffer.isBuffer(input)) ? 'png' : 'json';
	
	if (!fmt) {
		switch(input ? typeof input : 'none') {
			case "number":
			case "string":	format = 'txt'; 			break;
			case "object":	format = objFmt(input); 	break;
			default:		format = "png";
		}
	}
	
	dir = dir || "";
	dir && !fs.existsSync(dir) && fs.mkdirSync(dir);
	
	let fileName = dir+step+"-"+name,
	    data = input;
	
	
	if (format === 'png') {
		data = ('toBuffer' in input)
			? input.toBuffer('png')
			: input;
		
		fs.writeFileSync(fileName+"."+format, data);
		
	} else if (format === 'json') {
		data = JSON.stringify(input, null, '\t');
		fs.writeFileSync(fileName+"."+format, data);
		
	} else if (format === 'imageArray') {
		data.images.forEach((img, i) => {
			console.log(fileName+"-"+i+".png", img, ('toBuffer' in img));
			fs.writeFileSync(fileName+"-"+i+".png", img.toBuffer('png'));
		});
		let boxes = JSON.stringify(data.boxes, null, '\t');
		fs.writeFileSync(fileName+".json", boxes);
	}
	
	console.log("saved", fileName, format);
	
	return input;
}

function scale(img, sourceDpi, targetDpi) {
	let w = img.width,
	    h = img.height,
	    ratio = w / h,
	    dpi = sourceDpi || ratio <= 1 ? w/10 : h/10, // rough guesstimate
	    scale = (targetDpi || 150)/dpi;
	
	return img.scale(scale);
}


function clean(path) {
	let files = glob.sync(path+"**.*");
	if (files && files.length) {
		files.forEach(f => {
			fs.unlinkSync(f);
			console.log("Removed ", f);
		});
	}
}

function bounds(boxes, minDim) {
	let rejectMinDim = minDim || 0,
	    rx = Infinity,
	    ry = Infinity,
	    rx2 = 0,
	    ry2 = 0;
	
	boxes.forEach(b => {
		let minD = Math.min(b.width, b.height);
		
		if (minD > rejectMinDim) {
			rx = Math.min(rx, b.x);
			ry = Math.min(ry, b.y);
			rx2 = Math.max(rx2, b.width+b.x);
			ry2 = Math.max(ry2, b.height+b.y);
		}
	});
	
	return {x: rx, y: ry, width: rx2-rx, height: ry2-ry};
}

function drawBoxes(img, boxes, lineSize, opacity, _color) {
	let imgC = img.toColor();
	boxes.forEach(b => {
		if (b.width > 0 && b.height > 0) {
			let c = _color || color();
			imgC.drawBox(b, lineSize || 1, c[0], c[1], c[2], opacity || .8);
		}
	});
	return imgC;
}

function pipeline(steps) {
	return function runPipeline(obj) {
		let t = obj.timings;
		
		t && mark("pipeline");
		// console.log("obj", obj);
		let save = saver(obj.resultsPath);
		clean(obj.resultsPath);
		t && mark("pipeline", "cleaned");
		
		Object.keys(steps).forEach(key => {
			t && mark(key);
			let cfg = obj[key+"Cfg"] || {},
			    saveIt = cfg.save || (obj.saveSteps && cfg.save !== false),
			    stepFn = ()=>steps[key](obj, cfg);
			
			obj[key] = saveIt ? save.step(key, stepFn) : stepFn();
			t && mark(key);
		});
		
		t && mark("pipeline");
	};
}

function saver(dir) {
	let step = 0,
	    save = function(name, input, fmt, stp) {
		    let st = arguments.length === 4 ? stp : step++;
		    return _save(dir, name, input, fmt, st);
	    };
	
	save.step = (name, fn) => save(name, typeof fn === 'function' ? fn() : fn);
	
	return save;
}

function runVariants(pipelineDef, settingsFn, pipelineSettings, images, opts) {
	let pipelineFn = pipeline(pipelineDef);
	
	images.forEach(im => {
		opts.forEach(opt => {
			pipelineFn(settingsFn(pipelineSettings, im, opt));
		});
	});
}

module.exports = {
	
	// timing
	now: now,
	delta: delta,
	mark: mark,
	
	// color
	color: color,
	
	// boxes
	bounds: bounds,
	
	// pix
	scale: scale,
	drawBoxes: drawBoxes,
	
	// pipeline
	runVariants: runVariants,
	pipeline: pipeline,
	_save: _save,
	saver: saver,
	
	// files
	clean: clean
};
