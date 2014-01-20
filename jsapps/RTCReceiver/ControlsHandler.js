'use strict';
var __ = require('underscore'), $ = require('jquery-browserify');

function ControlsHandler(elementSelector, cb, options) {
  var defaults = {
    keyboard: true,
    mouse: false,
    touch: false
  };
  options = __(defaults).extend(options ||  {});

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

    if (options.keyboard) {
      that.keyHandler = new KeyboardHandler(that.el, that.send.bind(that));
    }
    if (options.mouse) {
      // Initiate mouse event handler
      // that.mouseHandler = new MouseHandler(that.el, that.send);
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
    console.log('Sending event');
    this.cb( message );
  } else {
    console.log('CB not set', message);
  }
};

function KeyboardHandler(element, cb) { // jshint ignore:line
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
  if (index === -1){
    this.keys.push(key);
  }

  var ev = this.createKeyEvent( e, 'keyDown' );
  if (!ev){
    return;
  }

  this.send( ev );
};

KeyboardHandler.prototype.keyUp = function(e){
  var key = e.keyCode ? e.keyCode : e.which;

  var index = this.keys.indexOf(key);
  if (index > -1){
    this.keys.splice(index, 1);
  }

  //Remove key from the list of all pressed keys
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
  var isTabSpaceOrBackspace = [8, 9, 32].indexOf(key) > -1;
  if ( isTabSpaceOrBackspace ){
    console.log('PreventDefault from tab, space, backspace');
    e.preventDefault();
  }

  return {
      type: 'InputKeyboard',
      action: type,
      key: '123123',//key,
      otherKeys: this.keys,
      metaKey: e.metaKey,
      altKey: e.altKey,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altGraphKey: e.altGraphKey
    };
};

KeyboardHandler.prototype.setKeyboardContext = function(event) {
  var thisOrChild = this.el == event.target || $(this.el).has(event.target).length > 0;
  if ( !thisOrChild ) {
    this.focus = false;
    return false;
  }

  console.log('Setting Keyboard context', event.target, this.el);
  this.focus = true;
};

// jshint ignore:start
function MouseHandler() {

}
// jshint ignore:end
module.exports = ControlsHandler;
