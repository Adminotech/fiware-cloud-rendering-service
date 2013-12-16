module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      RTCReceiver: {
        src: './RTCReceiver/main.js',
        dest: '../webservice/public/js/builds/RTCReceiver.js'
      },
      RTCSender: {
        src: './RTCSender/main.js',
        dest: '../webservice/public/js/builds/RTCSender.js'
      }
    },
    watch: {
      scripts: {
        files: ['RTC*/**/*.js'],
        tasks: ['browserify'],
        options: {
          spawn: false,
        },
      },
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('brow', ['browserify']);

  grunt.registerTask('default', 'Log some stuff.', function() {
    var message = 'Tasks: \n';
    message += "browserify: \n";
    message += "\tRTCReceiver \n";
    message += "\tRTCSender \n";
    grunt.log.write(message).ok();
  });

}



