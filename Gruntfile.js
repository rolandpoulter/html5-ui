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
					'src/obj.js',
					'src/dom.js',
					'src/menu.js',
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
		},

		watch: {
			dist: {
				files: './src/**/*.js',
				options: {interrupt: true, atBegin: true, spawn: true},
				tasks: ['dist']
			},
      test: {
        files: './test/specs/**/*.js',
        options: {interrupt: true, atBegin: true, spawn: true},
        tasks: ['clean:test', 'concat:test']
      }
    }
	});

	this.loadNpmTasks('grunt-contrib-clean');
	this.loadNpmTasks('grunt-contrib-concat');
	this.loadNpmTasks('grunt-contrib-watch');

	this.loadTasks('tasks');

	this.registerTask('dist', ['clean:dist', 'concat:dist']);
	this.registerTask('test', ['clean:test', 'concat:test', 'test_runner']);

	this.registerTask('default', ['dist', 'test']);

};
