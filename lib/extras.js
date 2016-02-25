"use strict";
const
  Range = require('./core').Range,
  RE_COMPARE = /^(.+)Compare$/,
  RE_VAR_REF = /([^\\]?)\$\[(!?[A-Za-z_]\w*)]/g;

for (let key of Object.getOwnPropertyNames(String)) {
  let m = key.match(RE_COMPARE);
  if (m != null) {
    String[m[1] + "CaseCompare"] = function (...args) {
      return String[key](...args.map(String.toLocaleLowerCase));
    };
  }
}

Function.augment({
  Object: class {
    static* $entries (object) {
      for (let key of Object.keys(object)) {
        let value = object[key];
        yield Object.assign([key, value], {key, value});
      }
    }

    static* $values (object) {
      for (let key of Object.keys(object)) {
        yield object[key];
      }
    }

    static clone (object) {
      return Object.assign({}, object);
    }

    static const (target, ...sources) {
      for (let source of Array.$reverse(sources)) {
        for (let key of Object.keys(source)) {
          if (target.hasOwnProperty(key)) continue;
          Object.defineProperty(target, key, {
            value: source[key],
            enumerable: true,
            writable: false,
            configurable: false
          });
        }
      }
      return target;
    }

    static entries (object) {
      return Array.from(Object.$entries(object));
    }

    static morph (object, bent, ...estate) {
      let result = {};
      if (String.takes(bent)) {
        estate = Array.$concat([bent], estate);
      } else {
        for (let key of Object.keys(bent)) {
          result[key] = object[bent[key]];
        }
      }
      for (let key of estate) {
        result[key] = object[key];
      }
      return result;
    }

    static remove (object, pattern) {
      let result = [];
      for (let prop of Object.$descriptors(object, pattern)) {
        if (prop.configurable) {
          result.push(prop);
          delete object[prop.name];
        }
      }
      return result;
    }

    static spawn (prototype, ...sources) {
      return Object.assign(Object.create(prototype), ...sources);
    }

    static values (object) {
      return Array.from(Object.$values(object));
    }
  },

  Number: class {
    static distance (a, b) {
      return Number.weight(a ^ b);
    }

    static weight (n) {
      let count = 0;
      for (n >>>= 0; n > 0; count++) {
        n &= n - 1;
      }
      return count;
    }
  },

  RegExp: class {
    static from (map) {
      for (let key of Object.keys(map)) {
        let re = map[key];
        let str = re.source;
        let flags = re.toString().slice(str.length + 2);
        str = str.replace(RE_VAR_REF, (m, pre, name) => {
          return pre + map[name];
        });
        re.compile(str, flags);
      }
      return map;
    }
  },

  Function: class {
    _part (...right) {
      return (...left) => this(...left, ...right);
    }

    shuns (object) {
      return typeof object != this.name.toLowerCase();
    }

    takes (object) {
      return typeof object == this.name.toLowerCase();
    }

    part_ (...left) {
      return (...right) => this(...left, ...right);
    }
  },

  String: class {
    static capitalize (object) {
      object = String(object);
      return object[0].toLocaleUpperCase() + object.slice(1);
    }

    static localeCaseCompare (...args) {
      args = args.map(String.toLocaleLowerCase);
      return String.prototype.localeCompare.call(...args);
    }

    static localeCompare (...args) {
      return String.prototype.localeCompare.call(...args);
    }

    static toLocaleLowerCase (object) {
      return String.prototype.toLocaleLowerCase.call(object);
    }
  },

  Array: class {
    static* $concat (...arrays) {
      for (let array of arrays) {
        yield* array;
      }
    }

    static* $reverse (array) {
      for (let i = array.length - 1; i >= 0; --i) {
        yield array[i];
      }
    }

    static* $slice (array, start, end) {
      let length = array.length;
      if (Number.shuns(end)) {
        end = length;
      } else if (end < 0 && [start, end] != [-1, -1]) {
        end = length - end;
      }
      if (Number.shuns(start)) {
        start = 0;
      } else if (start < 0) {
        start = length - start;
      }
      for (let i of Range(start, end)) {
        yield array[i];
      }
    }

    static* $zip (...arrays) {
      let count = arrays[1], list;
      if (typeof count == "number") {
        let iter = Array.endless(arrays[0]);
        list = Array.moreOf(iter, count);
      } else {
        list = arrays.map(Array.endless);
      }

      let i = 0, last = list.length - 1;
      while (i >= 0) {
        if (list[i].next()) {
          if (i < last) {
            i++;
          } else {
            yield* list.map(iter => iter.value);
          }
        } else {
          i--;
        }
      }
    }

    static clear (array) {
      array.length = 0;
      return array;
    }

    static endless (array) {
      let
        item = {done: true},
        iter;

      return {
        next () {
          if (item.done) {
            iter = array[Symbol.iterator]();
          }
          item = iter.next();
          this.value = item.value;
          return this;
        },
        valueOf () {
          return item.done == false;
        }
      };
    }

    static extend (array, ...sources) {
      for (let source of sources) {
        for (let item of source) {
          array.push(item);
        }
      }
      return array;
    }

    static get (array, index) {
      if (index < 0) {
        index = array.length + index;
      }
      return array[index];
    }

    static iterator (array) {
      let
        item,
        iter = array[Symbol.iterator]();

      return {
        next () {
          if (this) {
            item = iter.next();
          }
          this.value = item.value;
          return this;
        },
        valueOf () {
          return item.done == false;
        }
      };
    }

    static moreOf (value, count) {
      return new Array(count).fill(value);
    }

    static power (array) {
      return array.reduce((array, a) => {
        return array.concat(array.map(b => b.concat([a])));
      }, [[]]);
    }

    static shift (array) {
      return Array.prototype.shift.call(array);
    }

    static slice (...args) {
      return Array.from(Array.$slice(...args));
    }

    static sort (...args) {
      return Array.prototype.sort.call(...args);
    }

    static zip (...arrays) {
      return Array.from(Array.$zip(...arrays));
    }
  },

  Set: class {
    static from (array, cutback) {
      let result = new Set(array);
      if (cutback != null) {
        for (let item of cutback) {
          result.delete(item);
        }
      }
      return result;
    }
  },

  Map: class {
    static from (keys, values) {
      if (Array.isArray(keys) == false) {
        keys = Object.$entries(keys);
      } else if (Array.isArray(values)) {
        keys = Array.$zip(keys, values);
      }
      return new Map(keys);
    }

    poke (key, fallback) {
      if (this.has(key)) {
        return this.get(key);
      }
      if (arguments.length == 2) {
        return fallback;
      }
      return key;
    }
  }
});
