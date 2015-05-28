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
  var rudder = new five.Servo('A1');

  rudder.center();

  // see https://github.com/rwaldron/johnny_five_intro/blob/master/solutions/05_keyboard_led_and_servo.js

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.setRawMode(true);

  process.stdin.on('keypress', function(ch, key) {

    if (key.name === 'left') {
      rudder.step(validateServoMove(10, rudder.position));
    }

    if (key.name === 'right') {
      rudder.step(validateServoMove(-10, rudder.position));
    }

    if (key.name === 'space') {
      console.log('...Centering Servo');
      rudder.center();
    }

    if (key.name === 'up') {
      // go forward
    }

    if (key.name === 'down') {
      // go back
    }

    this.repl.inject({
      l: function() {
        led.toggle();
      }
    });

  });

  function validateServoMove(adjustment, position) {

    var newPosition = (position + adjustment);

    if (newPosition < 1 || newPosition > 179) {
      console.log('...Servo cannot be moved further in that direction');
      adjustment = 0;
    } else {
      console.log('...Adjusting Servo to angle [' + (position += adjustment) + ']');
    }

    return adjustment;
  }

});