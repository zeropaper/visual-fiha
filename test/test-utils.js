'use strict';
/*jshint node: true*/
// borrowed from
// http://stackoverflow.com/questions/6157929/how-to-simulate-a-mouse-click-using-javascript
function simulate(element, eventName) {
  var options = extend(defaultOptions, arguments[2] || {});
  var oEvent, eventType = null;

  for (var name in eventMatchers) {
    if (eventMatchers[name].test(eventName)) { eventType = name; break; }
  }

  if (!eventType) {
    throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
  }

  if (document.createEvent) {
    oEvent = document.createEvent(eventType);
    if (eventType == 'HTMLEvents') {
      oEvent.initEvent(eventName, options.bubbles, options.cancelable);
    }
    else {
      oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
      options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
      options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
    }
    element.dispatchEvent(oEvent);
  }
  else {
    options.clientX = options.pointerX;
    options.clientY = options.pointerY;
    var evt = document.createEventObject();
    oEvent = extend(evt, options);
    element.fireEvent('on' + eventName, oEvent);
  }
  return element;
}

function extend(destination, source) {
  for (var property in source) {
    destination[property] = source[property];
  }
  return destination;
}

var eventMatchers = {
  'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
  'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
};

var defaultOptions = {
  pointerX: 0,
  pointerY: 0,
  button: 0,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
  bubbles: true,
  cancelable: true
};

window.simulateEvent = simulate;


// -------------------------------

function logEvents(scope) {
  return function(evtName) {
    console.info('evt "%s" on "%s"', evtName, scope);
  };
}
window.logEvents = logEvents;


var _holders = {};
function makeHolder(name) {
  var holderHolder = (document.getElementById('holder') || document.body);
  if (_holders[name]) {
    if (!document.body.contains(_holders[name])) {
      holderHolder.appendChild(_holders[name]);
    }
    return _holders[name];
  }
  _holders[name] = document.createElement('div');
  _holders[name].style = 'max-width:max-100vw;height:100vh;position:relative;border:2px solid red;';
  _holders[name].id = name + '-test-holder';
  holderHolder.appendChild(_holders[name]);
  return _holders[name];
}


module.exports = {
  makeHolder: makeHolder,
  simulate: simulate,
  logEvents: logEvents
};

[
  'load',
  'unload',
  'abort',
  'error',
  'select',
  'change',
  'submit',
  'reset',
  'focus',
  'blur',
  'resize',
  'scroll',
  //
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'mouseover',
  'mousemove',
  'mouseout',
].forEach(function(name) {
  module.exports['do' + name] = function(element, options) {
    simulate(element, name, options || {});
  };
});