let binding = require('./docdrBinding.node'),
    util = require('./util');

function pix(a, b, c, d) {
	switch(arguments.length) {
		case 1:  return new binding.Image(a);
		case 2:  return new binding.Image(a, b);
		case 3:  return new binding.Image(a, b, c);
		case 4:  return new binding.Image(a, b, c, d);
		default: throw new Error("Invalid Arguments");
	}
	
}

module.exports = {
	pix: pix,
	util: util
};
