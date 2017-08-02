# Docdr 

Docdr is a [node.js](http://nodejs.org) library for processing and understanding the structure of scanned documents.

This project focuses on the document processing steps prior to OCR. Docdr exposes many Leptonica functions and provides extra binarization options. This project is forked off of [node-dv](https://github.com/creatale/node-dv) but does not include Tesseract or ZXing for OCR and barcode reading.

## Features

- Image loading using [jpeg-compressor](http://code.google.com/p/jpeg-compressor/), [LodePNG](http://lodev.org/lodepng/) and pixel buffers
- Image manipulation using [Leptonica](http://www.leptonica.com/) (Version 1.69) and [OpenCV](http://opencv.org/) (Version 2.4.9)
- Line Segment Detection using [LSWMS](http://sourceforge.net/projects/lswms/)

## Installation

    $ npm install docdr

## Quick Start

```javascript
var dv = require('docdr');
var fs = require('fs');
var image = new docdr('png', fs.readFileSync('textpage300.png'));

```

## License

Licensed under the [MIT License](http://creativecommons.org/licenses/MIT/). See [LICENSE](https://github.com/creatale/node-dv/blob/master/LICENSE).

External libraries are licensed under their respective licenses.
