"use strict";
let Range = require("./core").Range;

class SemVer {
  constructor (version) {
    if (version instanceof SemVer) {
      version = version.version;
    } else if (String.shuns(version)) {
      throw new TypeError('Invalid Version: ' + version);
    }

    if (version.length > MAX_LENGTH) {
      throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
    }

    let m = version.trim().match(RE.full);

    if (m == null) {
      throw new TypeError('Invalid Version: ' + version);
    }

    this.raw = version;

    let parts = ["major", "minor", "patch"];
    for (let i of Range(parts.length)) {
      let part = +m[i + 1], name = parts[i];
      if (Number.MAX_SAFE_INTEGER < part || part < 0) {
        throw new TypeError(`Invalid ${name} version`);
      }
      this[name] = part;
    }

    // numberify any prerelease numeric ids
    if (!m[4]) {
      this.prerelease = [];
    } else {
      this.prerelease = m[4].split('.').map(id => {
        if (/^[0-9]+$/.test(id)) {
          let num = +id;
          if (0 <= num && num < Number.MAX_SAFE_INTEGER) {
            return num;
          }
        }
        return id;
      });
    }

    this.build = m[5] ? m[5].split('.') : [];
    this.format();
  }

  static test (version) {
    return RE.full.test(version);
  }

  format () {
    let version = [this.major, this.minor, this.patch].join(".");
    if (this.prerelease.length) {
      version += '-' + this.prerelease.join('.');
    }
    return (this.version = version);
  }
}

Object.const(SemVer, {
  SPEC_VERSION: '2.0.0'
});

const
  MAX_LENGTH = 256,
  RE = RegExp.from({
    alnum: /[a-zA-Z0-9-]/,
    num: /0|[1-9]\d*/,
    "!num": /\d*[a-zA-Z-]$[alnum]*/,

    preID: /(?:$[num]|$[!num])/,
    buildID: /$[alnum]+/,

    main: /(($[num]\.){2}$[num])/,
    pre: /(?:-($[preID](?:\.$[preID])*))/,
    build: /(?:\+($[buildID](?:\.$[buildID])*))/,

    full: /^v?$[main]$[pre]?$[build]?$/
  });

module.exports = SemVer;
