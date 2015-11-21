'use strict';
var __ = require('underscore'), $ = require('jquery-browserify');

function ControlsHandler(elementSelector, cb, options) {
  var defaults = {
    keyboard: true,
    mouse: true,
    touch: false
  };
  options = __(defaults).extend(options || {});

  this.cb = cb;
  this.send.bind( this );

  this.selector = elementSelector;
  this.el = false;

  var that = this;

  $(document).ready(function() {
    that.el = $(elementSelector)[0];
    if (that.el === undefined){
      throw 'NoSuchElementError';
    }

    // Disable right click
    $(that.el).bind('contextmenu', function() {
      return false;
    });

    if (options.keyboard) {
      that.keyHandler = new KeyboardHandler(that.el, that.send.bind(that));
    }

    if (options.mouse) {
      that.mouseHandler = new MouseHandler(that.el, that.send.bind(that));
    }

    if (options.touch) {
      // Init touch event handler
      // that.touchHandler = new TouchHandler(that.el, that.send);
    }

  });

}

ControlsHandler.prototype.setCallback = function( cb ){
  this.cb = cb;
};

ControlsHandler.prototype.send = function( message ) {
  if (this.cb){
    //console.log('Sending event', message);
    window.me = message;
    this.cb( message );
  } else {
    console.log('CB not set', message);
  }
};

function MouseHandler(element, cb) { // jshint ignore:line
  // this.send = cb;
  this.send = __.throttle(cb, 50);
  this.el = element;
  this.buttons = [false, false, false, false];

  $(this.el).mousedown( this.mousedown.bind(this) );
  $(this.el).dblclick( this.dblclick.bind(this) );
  $(document).mouseup( this.mouseup.bind(this) );
  $(this.el).on("wheel", this.mousewheel.bind(this));

  this.setUnits();
  $(window).resize( this.setUnits.bind(this) );
};

MouseHandler.prototype.setUnits = function(){
  this.offset = $(this.el).offset();
  this.height = $(this.el).height();
  this.width = $(this.el).width();
};

MouseHandler.prototype.mousedown = function( event ) {
  console.log('Button', event.which, event.button, event);
  this.buttons[ event.which ] = true;
  $(this.el).mousemove( this.mousemove.bind(this) );

  this.send( this.buildMessage( 'press', event ) );
};

MouseHandler.prototype.mouseup = function( event ) {
  this.buttons[ event.which ] = false;

  this.send( this.buildMessage( 'release', event ) );

  //Unbind move binding if no buttons are pressed;
  if ( this.buttons.indexOf( true ) === -1 ) {
    $(this.el).unbind('mousemove');
  }
};

MouseHandler.prototype.dblclick = function( event ) {
  this.send( this.buildMessage( 'doublepress', event ) );
};

MouseHandler.prototype.mousemove = function( event ) {
  this.send( this.buildMessage( 'move', event ) );
};

MouseHandler.prototype.mousewheel = function( event ) {
  this.send( this.buildMessage( 'wheel', event.originalEvent ) );
  //inhibit scrolling
  return false;
};

MouseHandler.prototype.buildMessage = function( action, event ) {
  var x, y;
  x = (event.pageX - this.offset.left ) / this.width;
  y = (event.pageY - this.offset.top ) / $(this.el).height();//this.height

  var msg = {
    type: 'InputMouse',
    action: action,
    altKey:  event.altKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
    button: event.button,
    which: event.which,
    leftButton: this.buttons[1],
    rightButton: this.buttons[3],
    middleButton: this.buttons[2],
    x: x,
    y: y
  };
  
  if (event.type == "wheel") {
    msg['deltaX'] = event.deltaX;
    msg['deltaY'] = event.deltaY;
  }
  return msg;
};

function KeyboardHandler(element, cb) { // jslint ignore:line
  this.send = cb;
  this.el = element;
  this.focus = false;
  this.keys = [];

  window.addEventListener('click', this.setKeyboardContext.bind(this));

  window.onkeyup = this.keyUp.bind(this);
  window.onkeydown = this.keyDown.bind(this);
}

KeyboardHandler.prototype.keyDown = function(e){
  var key = e.keyCode ? e.keyCode : e.which;

  //Add key to the list of all pressed keys
  var index = this.keys.indexOf(key);
  if (index !== -1){
    return;
  }
  this.keys.push(key);

  var ev = this.createKeyEvent( e, 'keyDown' );
  if (!ev){
    return;
  }

  this.send( ev );
};

KeyboardHandler.prototype.keyUp = function(e){
  var key = e.keyCode ? e.keyCode : e.which;

  //Remove key from the list of all pressed keys
  var index = this.keys.indexOf(key);
  if (index > -1){
    this.keys.splice(index, 1);
  }

  var ev = this.createKeyEvent( e, 'keyUp' );
  if (!ev){
    return;
  }

  this.send( ev );
};

KeyboardHandler.prototype.createKeyEvent = function(e, type){
  if (!this.focus) {
    return false;
  }

  var key = e.keyCode ? e.keyCode : e.which;

  //PreventDefault from tab, space and backspace
  var isArrowTabSpaceOrBackspace = [8, 9, 32, 37, 38, 39, 40].indexOf(key) > -1;
  if ( isArrowTabSpaceOrBackspace ){
    console.log('PreventDefault from tab, space, backspace');
    e.preventDefault();
  }
  e.preventDefault();

  return {
      type: 'InputKeyboard',
      action: type,
      key: key,
      otherKeys: this.keys,
      metaKey: e.metaKey,
      altKey: e.altKey,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altGraphKey: e.altGraphKey
    };
};

KeyboardHandler.prototype.setKeyboardContext = function(event) {
  var thisOrChild = this.el === event.target || $(this.el).has(event.target).length > 0;
  if ( !thisOrChild ) {
    this.focus = false;
    return false;
  }
  this.focus = true;
};

module.exports = ControlsHandler;
