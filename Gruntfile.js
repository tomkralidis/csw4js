module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            }
        },
        qunit: {
            files: ['test/index.html']
        },
        strip : {
            main : {
                src : 'src/csw4js.js',
                dest : 'src/csw4js.built.js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-strip');

    grunt.registerTask('default', 'test task', function() {
        grunt.log.write('hi there');
    });
    grunt.registerTask('test', ['qunit', 'jshint']);
    grunt.registerTask('build', ['strip']);
};
