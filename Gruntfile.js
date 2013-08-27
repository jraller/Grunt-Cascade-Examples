'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Task configuration.
		cascade: {
			server: 'http://conference.cascadeserver.com', // within the quotes put the full url of your cascade server
			ws: '/ws/services/AssetOperationService?wsdl' // this is the extension that gets added to your cascade server url
		},
        jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js'
			],
            gruntfile: {
                src: 'Gruntfile.js'
            },
            options: {
				jshintrc: '.jshintrc'
            }
        },
        nodeunit: {
            files: ['test/**/*_test.js']
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.loadTasks('tasks');

    // Default task.
    grunt.registerTask('default', ['jshint:all']); //, 'nodeunit'
};