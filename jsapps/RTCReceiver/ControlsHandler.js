'use strict';
var __ = require('underscore');
var $ = require('jquery-browserify');

function ControlsHandler(elementSelector, cb, options) {
  var defaults = {
    keyboard: true,
    mouse: false,
    touch: false
  };
  options = __(defaults).extend(options ||  {});

  this.cb = false;

  this.selector = elementSelector;
  this.el = false;

  var that = this;
  $(document).ready(function() {
    that.el = $(elementSelector)[0];
    if (that.el === undefined){
      throw 'NoSuchElementError';
    }

    if (options.keyboard) {
      that.keyHandler = new KeyboardHandler(that.el, that.send);
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

};

ControlsHandler.prototype.setCallback = function( cb ){
  this.cb = cb;
};

ControlsHandler.prototype.send = function(message) {
  if (this.cb){
    this.cb(message);
  } else {
    console.log('CB not set', message);
  }
};

function KeyboardHandler(element, cb) {
  this.send = cb;
  this.el = element;
  this.focus = false;
  this.keys = [];

  window.addEventListener('click', this.setKeyboardContext.bind(this));

  window.onkeyup = this.keyUp.bind(this);
  window.onkeydown = this.keyDown.bind(this);
}

KeyboardHandler.prototype.keyDown = function(e){
  var ev = this.createKeyEvent( e, 'keyDown' );
  if (!ev){
    return;
  }

  var index = this.keys.indexOf(ev.key);
  if (index === -1){
    this.keys.push(ev.key);
  }

  this.send( JSON.stringify(ev) );
};

KeyboardHandler.prototype.keyUp = function(e){
  var ev = this.createKeyEvent( e, 'keyUp' );
  if (!ev){
    return;
  }

  var index = this.keys.indexOf(ev.key);
  if (index > -1){
    this.keys.splice(index, 1);
  }

  this.send( JSON.stringify(ev) );
};

KeyboardHandler.prototype.createKeyEvent = function(e, type){
  if (!this.focus) {
    return false;
  }

  var key = e.keyCode ? e.keyCode : e.which;
  console.log(e);

  //PreventDefault from tab, space and backspace
  var isTabSpaceOrBackspace = [8, 9, 32].indexOf(key) > -1;
  if ( isTabSpaceOrBackspace ){
    console.log('PreventDefault from tab, space, backspace');
    e.preventDefault();
  }

  return {
    type        : type,
    key         : key,
    otherKeys   : this.keys,
    metaKey     : e.metaKey,
    altKey      : e.altKey,
    shiftKey    : e.shiftKey,
    ctrlKey     : e.ctrlKey,
    altGraphKey : e.altGraphKey
  };
};

KeyboardHandler.prototype.setKeyboardContext = function(event) {
  if (event.target !== this.el) {
    this.focus = false;
    return false;
  }

  console.log('Setting Keyboard context', event.target, this.el);
  this.focus = true;
};

function MouseHandler(element) {

}

module.exports = ControlsHandler;
