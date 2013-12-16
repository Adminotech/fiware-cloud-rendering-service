module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    shell: {
      webservice: {
        command: 'node webservice/app.js',
        options: {
          async: true,
          execOptions: {
            detached: true
          }
        }
      },
      signaling: {
        command: 'node signalingserver/server.js',
        options: {
          async: true,
          execOptions: {
            detached: true
          }
        }
      }
    },
    hub: {
      build: {
        src: ['jsapps/Gruntfile.js'],
        tasks: ['browserify']
      },
      watch: {
        src: ['jsapps/Gruntfile.js'],
        tasks: ['watch']
      },
    }
  });

  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-hub');

  grunt.registerTask('build', [
    'hub:build'
  ]);
  grunt.registerTask('watch', [
    'hub:watch'
  ]);
  grunt.registerTask('run', [
    'shell:signaling'
  ]);
  grunt.registerTask('all', [
    'build',
    'run'
  ]);
  grunt.registerTask('dev', [
    'run',
    'watch'
  ]);
  grunt.registerTask('default', ['dev']);

};
