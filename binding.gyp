{
  'includes': [ 'deps/common.gyp' ],
  'targets': [
    {
      'target_name': 'docdrBinding',
      'dependencies': [
        'deps/jpg/jpg.gyp:jpg',
        'deps/lodepng/lodepng.gyp:lodepng',
        'deps/opencv/opencv.gyp:libopencv',
        'deps/lswms/lswms.gyp:liblswms',
        'deps/binarizeAdaptive/binarizeAdaptive.gyp:libBinarizeAdaptive',
        'deps/leptonica/leptonica.gyp:liblept'
      ],
      'include_dirs': [
        "<!(node -e \"require('nan')\")",
        'deps/jpg',
        'deps/lodepng',
        'deps/leptonica/src',
        'deps/opencv/include',
        'deps/opencv/modules/core/include',
        'deps/opencv/modules/dynamicuda/include',
        'deps/opencv/modules/imgproc/include',
        'deps/lswms',
        'deps/binarizeAdaptive'
       ],
      'sources': [
        'src/image.cc',
        'src/util.cc',
        'src/module.cc',
      ],
      'conditions': [
        ['OS=="linux"',
          {
            'cflags!': [ '-w' ],
            'cflags_cc': ['-std=c++11', '-Wno-ignored-qualifiers', '-Wno-extra']
          }
        ],
        ['OS=="mac"',
          {
            'xcode_settings': {
              'OTHER_CFLAGS!': [ '-w' ]
            }
          }
        ],
        ['OS=="win"',
          {
            'defines': [
              '__MSW32__',
              '_CRT_SECURE_NO_WARNINGS',
            ],
            'configurations': {
              'Release': {
                'msvs_settings': {
                  'VCCLCompilerTool': {
                    'WarningLevel': '3',
                  },
                },
              },
            },
          }
        ],
      ],
    },
    {
      "target_name": "docdrBinding_post",
      "type": "none",
      "dependencies": [ "docdrBinding" ],
      "copies": [
        {
          "files": [ "<(PRODUCT_DIR)/docdrBinding.node" ],
          "destination": "./lib"
        }
      ],
    },
  ],
}
