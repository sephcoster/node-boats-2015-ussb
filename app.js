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
  this.repl.inject({
    l: function() {
      led.toggle();
    }
  });

  var rudder = new five.Servo('A1');

});
