"use strict";
let Range = require("./core").Range;

Object.assign(Array, {
  merge_sort (array, comparison) {
    if (Function.shuns(comparison)) {
      comparison = COMPARISON;
    }
    return sort(Array.from(array));

    function sort (array) {
      let length = array.length;
      if (length <= MAX_NATIVE_SIZE) {
        return array.sort(comparison);
      }

      let middle = length >> 1;
      let left = sort(array.slice(0, middle));
      let right = sort(array.slice(middle));

      // If last(left) <= first(last) then there's no
      // need for merging, just join them and return
      if (comparison(left[middle - 1], right[0]) <= 0) {
        return left.concat(right);
      }

      array = [];
      let i = 0, j = 0;
      while (i < middle && j < length - middle) {
        if (comparison(left[i], right[j]) <= 0) {
          array.push(left[i++]);
        } else {
          array.push(right[j++]);
        }
      }

      for (i of Range(i, middle)) {
        array.push(left[i]);
      }

      for (j of Range(j, length - middle)) {
        array.push(right[j]);
      }

      return array;
    }
  }
});


const
  COMPARISON = (a, b) => a == b ? 0 : (a < b ? -1 : 1),

// This is the maximum length of an array which is
// sorted using insertion sort by Array.prototype.sort
  MAX_NATIVE_SIZE = 10;
