"use strict";

function Cellar (...functions) {
  const cellars = new Map();

  return Object.const(snoop, {
    put (object) {
      let cellar = cellars.get(object.constructor);

      let value = {};
      for (let prop of cellar.secret) {
        if (Function.takes(prop.value)) {
          prop.value = prop.value.bind(object);
        }
        prop.define(value, prop.name.slice(1));
      }

      cellar.set(object, value);
      return value;
    },

    store (...functions) {
      for (let func of functions) {
        let secret = Object.remove(func.prototype, /^_/);
        let cellar = Object.const(new WeakMap(), {secret});
        cellars.set(func, cellar);
      }
      return this;
    }
  }).store(...functions);

  function snoop (object) {
    return cellars.get(object.constructor).get(object);
  }
}

module.exports = Cellar;
