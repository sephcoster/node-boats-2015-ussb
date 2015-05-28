var five = require('johnny-five');
var Spark = require('spark-io');
var board = new five.Board({
  io: new Spark({
    token: '7e7b3a08075e683ee3e6eacd8d7c003b83b80b98',
    deviceId: 'ussb'
  })
});

board.on('ready', function() {
  var led = new five.Led('D7');
  var bindKeys = function(ch, key) {
    if (key && key.alt) {
      if (key.name === 'l') {
        console.log('lights');
        led.toggle();
      } else if (key.name === 'w') {
        console.log('forward');
      } else if (key.name === 's') {
        console.log('back');
      } else if (key.name === 'a') {
        console.log('left');
      } else if (key.name === 'd') {
        console.log('right');
      }
    }
    if (key && key.ctrl && key.name === 'c') {
      process.stdin.pause();
      process.exit();
    }
  };
  this.repl.inject({
    l: function() {
      led.toggle();
    }
  });

  var rudder = new five.Servo('A1');
  process.stdin.on('keypress', bindKeys);


});
