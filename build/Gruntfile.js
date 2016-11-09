module.exports = function(grunt){
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		/*----------------------------------( VERSIONING )----------------------------------*/

		now: grunt.template.today('yyyy/mm/dd @ HH:MM:ss'),

		/*----------------------------------( BOWER )----------------------------------*/

		bower: {
			install: {
				options: {
					targetDir: './files/vendor',  // A directory where you want to keep your Bower packages.
					cleanup: true,                // Will clean target and bower directories.
					copy: true,
					layout: 'byComponent',        // Folder structure type.
					verbose: true,                // Debug output.
				},
			},
		},

		/*----------------------------------( ENV )----------------------------------*/

		env: {
			dev: {
				NODE_ENV: 'DEVELOPMENT',
			},
			prod: {
				NODE_ENV: 'PRODUCTION',
			},
		},

		/*----------------------------------( CLEAN )----------------------------------*/

		clean: {
			options: {
				force: true, // Allows for deletion of folders outside current working dir (CWD). Use with caution.
			},
			dev: [
				'../dev/**/*'
			],
			prod: [
				'../prod/**/*'
			]
		},

		/*----------------------------------( LESS )----------------------------------*/

		less: {
			prod: {
				options: {
					cleancss: true,
					compress: true
				},
				files: {"../prod/assets/main.css": "files/main.less"} /* There should be some cache control here */
			}
		},

		/*----------------------------------( CSSMIN )----------------------------------*/

		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: 14
			},
			prod: {
				files: [{
					expand: true,
					cwd: './files/vendor/css/',
					src: ['*.css', '!*.min.css'],
					dest: './files/vendor/css/',
					ext: '.min.css'
				}]
			}
		},

		/*----------------------------------(    UGLIFY  )----------------------------------*/
		uglify: {
			prod: {
				files: [{
						"../prod/assets/main.js" : "files/main.js"
					},
					{
						expand: true,
						cwd: 'files/vendor/js/',
						src: '*.js',
						dest: './files/vendor/js/',
						ext:  '.min.js'
					}
				]
			}
		},

		/*----------------------------------(    PUG     )----------------------------------*/
		pug: {
			compile: {
				options: {
					pretty: '\t'
					// data: {
						// debug: false
					// }
				},
				files: {
					"./files/templates/partials/education.html" : "./files/templates/partials/education.jade",
					"./files/templates/partials/career.html"    : "./files/templates/partials/career.jade",
					"./files/templates/partials/skills.html"    : "./files/templates/partials/skills.jade",
					"./files/templates/partials/languages.html" : "./files/templates/partials/languages.jade",
					"./files/templates/partials/tools.html"     : "./files/templates/partials/tools.jade",
				}
			}
		},

		/*----------------------------------( PREPROCESS )----------------------------------*/

		preprocess: {
			options: {
				context: {
					description: '<%= pkg.description %>',
					homepage: '<%= pkg.homepage %>',
					license: '<%= _.map(pkg.licenses, "type").join(", ") %>',
					name: '<%= pkg.name %>',
					now: '<%= now %>',
					production: '<%= pkg.production %>',
					title: '<%= pkg.title %>',
					version: '<%= pkg.version %>'
				},
			},

			dev: {
				options: {
					context: {
						base_url: 'localhost/github/website/dev/'
					}
				},
				files: [
					{
						expand: true,
						cwd: './files/templates/',
						src: [
							'index.html',
							'!includes/**/*'
						],
						dest: '../dev/',
					},
				],
			},
			prod: {
				files: [
					{
						expand: true,
						cwd: './files/templates/',
						src: [
							'index.html',
							'!includes/**/*'
						],
						dest: '../prod/',
					}
				],
			},
		},

		/*----------------------------------( COPY )----------------------------------*/

		copy: {
			dev: {
				files: [
					{
						expand: true,
						cwd: './files/',
						src: [
							'img/*.*',
							'main.less',
							'main.js'
						],
						dest: '../dev/assets/'
					},
					{
						expand: true,
						flatten: true,
						cwd: './files/',
						src: [
							'misc/*',
							'misc/.htaccess'
						],
						dest: '../dev/'
					},
					{
						expand: true,
						cwd: './files/',
						src: [
							'assets/**',
							'vendor/**/*.*',
							// '!vendor/**/*.min.css'
						],
						dest: '../dev/'
					}
				],
			},
			prod: {
				files: [
					{
						expand: true,
						cwd: './files/',
						src: [
							'img/*.*',
							'vendor/**/*.min.*',
							'vendor/fonts/*'
							//'main.css' //main.css already exists in prod
						],
						dest: '../prod/assets/'
					},
					{
						expand: true,
						flatten: true,
						cwd: './files/',
						src: [
							'misc/*',
							'misc/.htaccess'
						],
						dest: '../prod/'
					}
				],
			},
		},
	});

	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-preprocess');
	grunt.loadNpmTasks('grunt-contrib-pug');
	grunt.loadNpmTasks('grunt-contrib-copy');

	//----------------------------------

	/**
	 * @see https://github.com/onehealth/grunt-preprocess/issues/7
	 * @see https://github.com/onehealth/grunt-env/issues/4
	 */

	grunt.registerTask('printenv', function () { console.log(process.env); });

	//----------------------------------

	grunt.registerTask('load_config', 'Load config files', function(name, val) {
		var stripJsonComments = require("strip-json-comments");
		var jsonlint = require("jsonlint");

		//TODO: Error checking.

		var jsonSettings = jsonlint.parse(stripJsonComments(grunt.file.read("files/config/settings.json")));
		var jsonProfile  = jsonlint.parse(stripJsonComments(grunt.file.read("files/config/profile.json")));

		//create full_name var
		jsonProfile.full_name = (jsonProfile.first_name + (jsonSettings.use_middle_name ? " "+jsonProfile.middle_name+" " : " ") + jsonProfile.last_name);

		//create age var
		var today = new Date(),
		    birthDate = new Date(jsonProfile.dateofbirth);
		var age = today.getFullYear() - birthDate.getFullYear();
		var m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
		jsonProfile.age = age;

		//create reversed email var
		jsonProfile.social.email_reversed = (jsonProfile.social.email).split('').reverse().join('');

		//make sure url doesn't end with slash
		jsonSettings.base_url = (jsonSettings.base_url.slice(-1) == '/' ? jsonSettings.base_url.substr(0, -1) : jsonSettings.base_url);

		grunt.config.set('preprocess.options.context.resumeSettings', jsonSettings);
		grunt.config.set('preprocess.options.context.resumeProfile',  jsonProfile);

		//FIXME: preprocess has extremely shoddy @foreach support, so we need to use jade instead :|
		grunt.config.set('pug.options.data.resumeSettings', jsonSettings);
		grunt.config.set('pug.options.data.resumeProfile',  jsonProfile);
	});


	grunt.registerTask('initial_setup', 'Setup', function(name, val) {
		//initial setup, or used to reset settings

		if(grunt.file.exists("files/config/profile.json") || grunt.file.exists("files/config/settings.json")) {
			grunt.warn("profile.json or settings.json already exist.\nUsing force will overwrite them.\n");
		}

		var profileBaseFile = "files/config/profile.json.default";
		if(grunt.file.exists("files/config/profile.json.custom")) {
			profileBaseFile = "files/config/profile.json.custom";
		}
		grunt.file.copy(profileBaseFile, "files/config/profile.json");

		var settingsBaseFile = "files/config/settings.json.default";
		if(grunt.file.exists("files/config/settings.json.custom")) {
			settingsBaseFile = "files/config/settings.json.custom";
		}
		grunt.file.copy(settingsBaseFile, "files/config/settings.json");

		grunt.log.writeln("\n.profile.json & settings.json are now ready to be editted.");
	});

	//main tasks
	grunt.registerTask('init', ['load_config']);
	grunt.registerTask('update', ['bower']);
	grunt.registerTask('setup', ['initial_setup', 'update']);

	grunt.registerTask('dev', ['init', 'env:dev', 'clean:dev', 'pug:compile', 'preprocess:dev', 'copy:dev']);
	grunt.registerTask('prod', ['dev', 'env:prod', 'clean:prod', 'less:prod', 'cssmin:prod', 'uglify:prod', 'preprocess:prod', 'copy:prod']);

	grunt.registerTask('default', ['dev']);
};
