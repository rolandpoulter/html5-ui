"use strict";


module.exports = function (grunt) {

	this.initConfig({
		package: grunt.file.readJSON('package.json'),

		clean: {
			dist: ['dist'],
			test: ['test/static/specs.js']
		},

		concat: {
			dist: {
				src: [
					'src/index.js',
					'src/utils.js',
					'src/button.js',
					'src/menu.js',
					'src/nested_menu.js',
					'src/context_menu.js',
					'src/**/*.js'
				],
      	dest: 'dist/<%= package.name %>-<%= package.version %>.js',
			},
			test: {
				src: 'test/specs/**/*.js',
				dest: 'test/static/specs.js'
			}
		},

		test_runner: {
			server: 'test/server'
		}
	});

	this.loadNpmTasks('grunt-contrib-clean');
	this.loadNpmTasks('grunt-contrib-concat');

	this.loadTasks('tasks');

	this.registerTask('dist', ['clean:dist', 'concat:dist']);
	this.registerTask('test', ['clean:test', 'concat:test', 'test_runner']);

	this.registerTask('default', ['dist', 'test']);

};
