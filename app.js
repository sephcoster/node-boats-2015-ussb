var five = require('johnny-five');
var Spark = require('spark-io');
var nc = require('ncurses');
var CHAR_CODES = {
  LEFT_ARROW: 260,
  RIGHT_ARROW: 261,
  UP_ARROW: 259,
  DOWN_ARROW: 258,
  Q: 113,
  CAP_Q: 81,
  A: 97,
  CAP_A: 65
};
var RUDDER_ART = {
  '-60': [
    '|       |',
    '|<\\\\    |',
    '|    --\\|',
    '|       |'
  ],
  '-30': [
    '| ^     |',
    '|  \\    |',
    '|   \\   |',
    '|    \\  |'
  ],
  '0': [
    '|   ^   |',
    '|   |   |',
    '|   |   |',
    '|   |   |'
  ],
  '30': [
    '|     ^ |',
    '|    /  |',
    '|   /   |',
    '|  /    |'
  ],
  '60': [
    '|       |',
    '|   ///>|',
    '|/--    |',
    '|       |'
  ]
};
var rudderDirection = 0;
var enginePower = 'off';

var board = new five.Board({
  io: new Spark({
    token: '7e7b3a08075e683ee3e6eacd8d7c003b83b80b98',
    deviceId: 'ussb'
  }),
  repl: false
});

board.on('ready', function() {
  var led = new five.Led('D7');
  var rudder = new five.Servo({
    pin: 'A4',
    range: [10, 170],
    startAt: 90
  });
  var motor = new five.Motor({pins: {pwm: 'A0', dir: 'D1', cdir: 'D0'}});

  rudder.center();

  function pad(charCode) {
    var charCodeStr = '' + charCode;
    while (charCodeStr.length < 3) {
      charCodeStr = ' ' + charCodeStr;
    }
    return charCodeStr;
  }

  function modifyRudderDirection(delta) {
    if (Math.abs(delta + rudderDirection) <= 80) {
      rudderDirection += delta;
      return true;
    } else {
      return false;
    }
  }

  function updateWindowGui() {
    w.erase();
    var powerChar;
    if (enginePower === 'on') {
      powerChar = 'x';
    } else if (enginePower === 'reverse') {
      powerChar = '???';
    } else {
      powerChar = ' ';
    }
    var THROTTLE_BASE_X = 10;
    var RUDDER_BASE_X = 30;
    w.insstr(0, THROTTLE_BASE_X - 'Throttle: '.length, 'Throttle: ');
    w.insstr(0, THROTTLE_BASE_X, '===');
    w.insstr(1, THROTTLE_BASE_X, '|' + powerChar + '|');
    w.insstr(2, THROTTLE_BASE_X, '|' + powerChar + '|');
    w.insstr(3, THROTTLE_BASE_X, '|' + powerChar + '|');
    w.insstr(4, THROTTLE_BASE_X, '|' + powerChar + '|');
    w.insstr(5, THROTTLE_BASE_X, '|' + powerChar + '|');
    w.insstr(6, THROTTLE_BASE_X, '===');

    w.insstr(0, RUDDER_BASE_X - 'Rudder: '.length, 'Rudder: ');
    w.insstr(1, RUDDER_BASE_X - 'Rudder: '.length, '' + rudderDirection + '°');
    var rudderArt = RUDDER_ART[rudderDirection];
    w.insstr(0, RUDDER_BASE_X, '|-------|');
    w.insstr(1, RUDDER_BASE_X, rudderArt[0]);
    w.insstr(2, RUDDER_BASE_X, rudderArt[1]);
    w.insstr(3, RUDDER_BASE_X, rudderArt[2]);
    w.insstr(4, RUDDER_BASE_X, rudderArt[3]);
    w.insstr(5, RUDDER_BASE_X, '|-------|');
    w.refresh();
  }

  function updateEngine() {
    if (enginePower === 'on') {
      motor.reverse(255);
      led.on();
    } else if (enginePower === 'off') {
      motor.stop();
      led.off()
    } else {
      motor.forward(255);
      led.blink();
    }
  }

  function updateRudder() {
    rudder.to(100 + rudderDirection); // rudderDirection between -80 and +80
  }

  var w = new nc.Window();
  w.scrollok(false);
  w.idlok(false);
  w.leaveok(true);
  w.immedok(true); // degrades performance
  w.insstr(0, 0, 'Use the arrow keys and Q and A to control the throttle and rudder');
  w.on('inputChar', function(char, charCode, isNonCharKey) {
    var changedProperties = false;
    if (charCode === CHAR_CODES.LEFT_ARROW) {
      changedProperties = modifyRudderDirection(-30);
    } else if (charCode === CHAR_CODES.RIGHT_ARROW) {
      changedProperties = modifyRudderDirection(30);
    } else if (charCode === CHAR_CODES.Q || charCode === CHAR_CODES.UP_ARROW || charCode === CHAR_CODES.CAP_Q) {
      if (enginePower !== 'on') {
        changedProperties = true;
        if (enginePower === 'off') {
          enginePower = 'on';
        } else {
          enginePower = 'off';
        }
      }
    } else if (charCode === CHAR_CODES.A || charCode === CHAR_CODES.DOWN_ARROW || charCode === CHAR_CODES.CAP_A) {
      if (enginePower !== 'reverse') {
        changedProperties = true;
        if (enginePower === 'off') {
          enginePower = 'reverse';
        } else {
          enginePower = 'off';
        }
      }
    }

    if (changedProperties) {
      updateWindowGui();
      updateEngine();
      updateRudder();
    }
  });
});