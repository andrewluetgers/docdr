{
	'target_defaults': {
		'conditions': [
			['OS=="linux"', {
				'cflags_cc!': [ '-fno-exceptions' ],
				'cflags': [ '-O3', '-march=native', '-w' ],
			}],
			['OS=="mac"', {
				'xcode_settings': {
					'OTHER_CFLAGS': [ '-O3', '-march=native', '-w' ],
					'GCC_ENABLE_CPP_RTTI': "YES",
					'GCC_ENABLE_CPP_EXCEPTIONS': "YES",
					'OTHER_CPLUSPLUSFLAGS' : [
						'-Wno-c++11-narrowing',
						'-std=c++11',
						'-stdlib=libc++',
						'-mmacosx-version-min=10.7'
					]
				}
			}],
			['OS=="win"', {
				'configurations': {
					'Debug': {
						'msvs_settings': {
							'VCCLCompilerTool': {
								'ExceptionHandling': '1',
							},
						},
					},
					'Release': {
						'msvs_settings': {
							'VCCLCompilerTool': {
								'WarningLevel': '0',
								'ExceptionHandling': '1',
							},
						},
					},
				},
			}]
		]
	}
}
