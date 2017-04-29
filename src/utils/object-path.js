'use strict';

function isCollectionOfParent(o, p) {
  if (!p || !p._collections) return;
  for (var name in p._collections) {
    if (p[name] === o.collection) return name + '.' + o.getId();
  }
}

function isChildOfParent(o, p) {
  if (!p || !p._children) return;
  for (var name in p._children) {
    if (p[name] === o) return name;
  }
}

function isPropOfParent(o, p) {
  if (!p) return;
  for (var name in p) {
    if (p[name] === o) return name;
  }
}

var _paths = {};
function objectPath(state) {
  if (!state) return null;
  if (_paths[state.cid]) return _paths[state.cid];
  var parts = [];


  function up(instance) {
    var collectionName = instance.collection ?
                          isCollectionOfParent(instance, instance.collection.parent) :
                          null;
    if (collectionName) {
      parts.unshift(collectionName);
      return up(instance.collection.parent);
    }

    var childName = isChildOfParent(instance, instance.parent);
    if (childName) {
      parts.unshift(childName);
      return up(instance.parent);
    }


    var propName = isPropOfParent(instance, instance.parent);
    if (propName) {
      parts.unshift(propName);
      return up(instance.parent);
    }

    if (instance.parent) up(instance.parent);
  }

  up(state);

  _paths[state.cid] = parts.join('.');
  return _paths[state.cid];
}

module.exports = objectPath;