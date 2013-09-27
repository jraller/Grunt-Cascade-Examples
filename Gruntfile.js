/*jslint node:true */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Task configuration.
		cascade: {
			server: 'http://csuc13.cascadeserver.com', // within the quotes put the full url of your cascade server
			ws: '/ws/services/AssetOperationService?wsdl', // this is the extension that gets added to your cascade server url
			site: 'GruntExample' // change this if for some reason you have or want a site by this name
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
	grunt.loadTasks('tasks/listSites');
	grunt.loadTasks('tasks/read');
	grunt.loadTasks('tasks/listMessages');
	grunt.loadTasks('tasks/markMessage');
	grunt.loadTasks('tasks/deleteMessage');
	grunt.loadTasks('tasks/sendMessage');
	grunt.loadTasks('tasks/delete');
	grunt.loadTasks('tasks/publish');
	grunt.loadTasks('tasks/edit');
	grunt.loadTasks('tasks/batch');
	grunt.loadTasks('tasks/copy');
	grunt.loadTasks('tasks/move');
	grunt.loadTasks('tasks/search');
	grunt.loadTasks('tasks/siteCopy');
	grunt.loadTasks('tasks/checkIn');
	grunt.loadTasks('tasks/checkOut');
	grunt.loadTasks('tasks/create');
	grunt.loadTasks('tasks/readAccessRights');
	grunt.loadTasks('tasks/editAccessRights');
	grunt.loadTasks('tasks/editWorkflowSettings');
	grunt.loadTasks('tasks/listSubscribers');
	grunt.loadTasks('tasks/performWorkflowTransition');
	grunt.loadTasks('tasks/readAudits');
	grunt.loadTasks('tasks/readWorkflowInformation');
	grunt.loadTasks('tasks/readWorkflowSettings');

    // Default task.
    grunt.registerTask('default', ['jshint:all']); //, 'nodeunit'
};