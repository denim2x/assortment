"use strict";

Object.assign(Object, {
  * $descriptors (object, ...patterns) {
    let ingress = /.*/, coventry = /$./;
    for (let item of patterns) {
      if (item.global) {    // interpreted as if 'gainsay'
        coventry = item;
      } else {
        ingress = item;
      }
    }

    for (let key of Object.getOwnPropertyNames(object)) {
      if (ingress.test(key) && coventry.test(key) == false) {
        yield Property.from(object, key);
      }
    }
  },

  augment (target, source, ...patterns) {
    for (let prop of Object.$descriptors(source, ...patterns)) {
      if (target.hasOwnProperty(prop.name) == false) {
        prop.define(target);
      }
    }
    return target;
  },

  recast (target, source, ...patterns) {
    for (let prop of Object.$descriptors(source, ...patterns)) {
      let prev = Object.getOwnPropertyDescriptor(target, prop.name);
      if (prev != null && prev.configurable) {
        delete target[prop.name];
      }
      prop.define(target);
    }
    return target;
  }
});

Object.assign(Function, {
  augment (sources, namespace) {
    if (namespace == null) {
      namespace = global;
    }

    for (let key of Object.keys(sources)) {
      let source = sources[key], target = namespace[key];
      Object.augment(target, source);
      Object.augment(target.prototype, source.prototype);
    }
  }
});

let path = require("path");
Object.assign(process, {
  name: path.parse(process.argv[0]).name
});

class Property {
  constructor (name, descriptor) {
    final(this, "name", name);
    Object.assign(this, descriptor);
  }

  static from (object, key) {
    object = Object.getOwnPropertyDescriptor(object, key);
    return new Property(key, object);
  }

  define (object, name) {
    if (typeof name != "string") {
      name = this.name;
    }

    Object.defineProperty(object, name, this);
    return this;
  }
}

/**
 * The missing ValueError (borrowed from Python)
 */
class ValueError extends Error {
  // Nothing here...
}

/**
 * An implementation of Python's range() function
 */
function* Range (start, end, step) {
  if (Number.shuns(end)) {
    end = start;
    start = 0;
  }
  if (Number.shuns(step)) {
    step = Math.sign(end - start);
  } else if (step == 0) {
    throw new ValueError("Parameter 'step' cannot be zero");
  }

  let sign = Math.sign(step);
  for (let i = start; Math.sign(end - i) == sign; i += step) {
    yield i;
  }
}

function final (object, key, value) {
  Object.defineProperty(object, key, {
    value,
    enumerable: true,
    writable: false,
    configurable: false
  });
  return object;
}

module.exports = {
  Property,
  Range,
  ValueError,
};

require("./extras");
require("./merge_sort");

Object.assign(module.exports, {
  Cellar: require("./cellar"),
  SemVer: require("./semver"),
});
