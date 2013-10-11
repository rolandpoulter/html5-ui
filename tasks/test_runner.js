"use strict";


var path = require('path');


module.exports = function (grunt) {

  grunt.registerMultiTask('test_runner', test_runner_task);


  function test_runner_task () {

    require('../test/server');

    // TODO: use mocha-phantomjs to run the tests in the command line

  }

};
