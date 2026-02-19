import { createRequire } from 'module';const require = createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/adm-zip/util/constants.js
var require_constants = __commonJS({
  "node_modules/adm-zip/util/constants.js"(exports, module) {
    module.exports = {
      /* The local file header */
      LOCHDR: 30,
      // LOC header size
      LOCSIG: 67324752,
      // "PK\003\004"
      LOCVER: 4,
      // version needed to extract
      LOCFLG: 6,
      // general purpose bit flag
      LOCHOW: 8,
      // compression method
      LOCTIM: 10,
      // modification time (2 bytes time, 2 bytes date)
      LOCCRC: 14,
      // uncompressed file crc-32 value
      LOCSIZ: 18,
      // compressed size
      LOCLEN: 22,
      // uncompressed size
      LOCNAM: 26,
      // filename length
      LOCEXT: 28,
      // extra field length
      /* The Data descriptor */
      EXTSIG: 134695760,
      // "PK\007\008"
      EXTHDR: 16,
      // EXT header size
      EXTCRC: 4,
      // uncompressed file crc-32 value
      EXTSIZ: 8,
      // compressed size
      EXTLEN: 12,
      // uncompressed size
      /* The central directory file header */
      CENHDR: 46,
      // CEN header size
      CENSIG: 33639248,
      // "PK\001\002"
      CENVEM: 4,
      // version made by
      CENVER: 6,
      // version needed to extract
      CENFLG: 8,
      // encrypt, decrypt flags
      CENHOW: 10,
      // compression method
      CENTIM: 12,
      // modification time (2 bytes time, 2 bytes date)
      CENCRC: 16,
      // uncompressed file crc-32 value
      CENSIZ: 20,
      // compressed size
      CENLEN: 24,
      // uncompressed size
      CENNAM: 28,
      // filename length
      CENEXT: 30,
      // extra field length
      CENCOM: 32,
      // file comment length
      CENDSK: 34,
      // volume number start
      CENATT: 36,
      // internal file attributes
      CENATX: 38,
      // external file attributes (host system dependent)
      CENOFF: 42,
      // LOC header offset
      /* The entries in the end of central directory */
      ENDHDR: 22,
      // END header size
      ENDSIG: 101010256,
      // "PK\005\006"
      ENDSUB: 8,
      // number of entries on this disk
      ENDTOT: 10,
      // total number of entries
      ENDSIZ: 12,
      // central directory size in bytes
      ENDOFF: 16,
      // offset of first CEN header
      ENDCOM: 20,
      // zip file comment length
      END64HDR: 20,
      // zip64 END header size
      END64SIG: 117853008,
      // zip64 Locator signature, "PK\006\007"
      END64START: 4,
      // number of the disk with the start of the zip64
      END64OFF: 8,
      // relative offset of the zip64 end of central directory
      END64NUMDISKS: 16,
      // total number of disks
      ZIP64SIG: 101075792,
      // zip64 signature, "PK\006\006"
      ZIP64HDR: 56,
      // zip64 record minimum size
      ZIP64LEAD: 12,
      // leading bytes at the start of the record, not counted by the value stored in ZIP64SIZE
      ZIP64SIZE: 4,
      // zip64 size of the central directory record
      ZIP64VEM: 12,
      // zip64 version made by
      ZIP64VER: 14,
      // zip64 version needed to extract
      ZIP64DSK: 16,
      // zip64 number of this disk
      ZIP64DSKDIR: 20,
      // number of the disk with the start of the record directory
      ZIP64SUB: 24,
      // number of entries on this disk
      ZIP64TOT: 32,
      // total number of entries
      ZIP64SIZB: 40,
      // zip64 central directory size in bytes
      ZIP64OFF: 48,
      // offset of start of central directory with respect to the starting disk number
      ZIP64EXTRA: 56,
      // extensible data sector
      /* Compression methods */
      STORED: 0,
      // no compression
      SHRUNK: 1,
      // shrunk
      REDUCED1: 2,
      // reduced with compression factor 1
      REDUCED2: 3,
      // reduced with compression factor 2
      REDUCED3: 4,
      // reduced with compression factor 3
      REDUCED4: 5,
      // reduced with compression factor 4
      IMPLODED: 6,
      // imploded
      // 7 reserved for Tokenizing compression algorithm
      DEFLATED: 8,
      // deflated
      ENHANCED_DEFLATED: 9,
      // enhanced deflated
      PKWARE: 10,
      // PKWare DCL imploded
      // 11 reserved by PKWARE
      BZIP2: 12,
      //  compressed using BZIP2
      // 13 reserved by PKWARE
      LZMA: 14,
      // LZMA
      // 15-17 reserved by PKWARE
      IBM_TERSE: 18,
      // compressed using IBM TERSE
      IBM_LZ77: 19,
      // IBM LZ77 z
      AES_ENCRYPT: 99,
      // WinZIP AES encryption method
      /* General purpose bit flag */
      // values can obtained with expression 2**bitnr
      FLG_ENC: 1,
      // Bit 0: encrypted file
      FLG_COMP1: 2,
      // Bit 1, compression option
      FLG_COMP2: 4,
      // Bit 2, compression option
      FLG_DESC: 8,
      // Bit 3, data descriptor
      FLG_ENH: 16,
      // Bit 4, enhanced deflating
      FLG_PATCH: 32,
      // Bit 5, indicates that the file is compressed patched data.
      FLG_STR: 64,
      // Bit 6, strong encryption (patented)
      // Bits 7-10: Currently unused.
      FLG_EFS: 2048,
      // Bit 11: Language encoding flag (EFS)
      // Bit 12: Reserved by PKWARE for enhanced compression.
      // Bit 13: encrypted the Central Directory (patented).
      // Bits 14-15: Reserved by PKWARE.
      FLG_MSK: 4096,
      // mask header values
      /* Load type */
      FILE: 2,
      BUFFER: 1,
      NONE: 0,
      /* 4.5 Extensible data fields */
      EF_ID: 0,
      EF_SIZE: 2,
      /* Header IDs */
      ID_ZIP64: 1,
      ID_AVINFO: 7,
      ID_PFS: 8,
      ID_OS2: 9,
      ID_NTFS: 10,
      ID_OPENVMS: 12,
      ID_UNIX: 13,
      ID_FORK: 14,
      ID_PATCH: 15,
      ID_X509_PKCS7: 20,
      ID_X509_CERTID_F: 21,
      ID_X509_CERTID_C: 22,
      ID_STRONGENC: 23,
      ID_RECORD_MGT: 24,
      ID_X509_PKCS7_RL: 25,
      ID_IBM1: 101,
      ID_IBM2: 102,
      ID_POSZIP: 18064,
      EF_ZIP64_OR_32: 4294967295,
      EF_ZIP64_OR_16: 65535,
      EF_ZIP64_SUNCOMP: 0,
      EF_ZIP64_SCOMP: 8,
      EF_ZIP64_RHO: 16,
      EF_ZIP64_DSN: 24
    };
  }
});

// node_modules/adm-zip/util/errors.js
var require_errors = __commonJS({
  "node_modules/adm-zip/util/errors.js"(exports) {
    var errors = {
      /* Header error messages */
      INVALID_LOC: "Invalid LOC header (bad signature)",
      INVALID_CEN: "Invalid CEN header (bad signature)",
      INVALID_END: "Invalid END header (bad signature)",
      /* Descriptor */
      DESCRIPTOR_NOT_EXIST: "No descriptor present",
      DESCRIPTOR_UNKNOWN: "Unknown descriptor format",
      DESCRIPTOR_FAULTY: "Descriptor data is malformed",
      /* ZipEntry error messages*/
      NO_DATA: "Nothing to decompress",
      BAD_CRC: "CRC32 checksum failed {0}",
      FILE_IN_THE_WAY: "There is a file in the way: {0}",
      UNKNOWN_METHOD: "Invalid/unsupported compression method",
      /* Inflater error messages */
      AVAIL_DATA: "inflate::Available inflate data did not terminate",
      INVALID_DISTANCE: "inflate::Invalid literal/length or distance code in fixed or dynamic block",
      TO_MANY_CODES: "inflate::Dynamic block code description: too many length or distance codes",
      INVALID_REPEAT_LEN: "inflate::Dynamic block code description: repeat more than specified lengths",
      INVALID_REPEAT_FIRST: "inflate::Dynamic block code description: repeat lengths with no first length",
      INCOMPLETE_CODES: "inflate::Dynamic block code description: code lengths codes incomplete",
      INVALID_DYN_DISTANCE: "inflate::Dynamic block code description: invalid distance code lengths",
      INVALID_CODES_LEN: "inflate::Dynamic block code description: invalid literal/length code lengths",
      INVALID_STORE_BLOCK: "inflate::Stored block length did not match one's complement",
      INVALID_BLOCK_TYPE: "inflate::Invalid block type (type == 3)",
      /* ADM-ZIP error messages */
      CANT_EXTRACT_FILE: "Could not extract the file",
      CANT_OVERRIDE: "Target file already exists",
      DISK_ENTRY_TOO_LARGE: "Number of disk entries is too large",
      NO_ZIP: "No zip file was loaded",
      NO_ENTRY: "Entry doesn't exist",
      DIRECTORY_CONTENT_ERROR: "A directory cannot have content",
      FILE_NOT_FOUND: 'File not found: "{0}"',
      NOT_IMPLEMENTED: "Not implemented",
      INVALID_FILENAME: "Invalid filename",
      INVALID_FORMAT: "Invalid or unsupported zip format. No END header found",
      INVALID_PASS_PARAM: "Incompatible password parameter",
      WRONG_PASSWORD: "Wrong Password",
      /* ADM-ZIP */
      COMMENT_TOO_LONG: "Comment is too long",
      // Comment can be max 65535 bytes long (NOTE: some non-US characters may take more space)
      EXTRA_FIELD_PARSE_ERROR: "Extra field parsing error"
    };
    function E(message) {
      return function(...args) {
        if (args.length) {
          message = message.replace(/\{(\d)\}/g, (_, n) => args[n] || "");
        }
        return new Error("ADM-ZIP: " + message);
      };
    }
    for (const msg of Object.keys(errors)) {
      exports[msg] = E(errors[msg]);
    }
  }
});

// node_modules/adm-zip/util/utils.js
var require_utils = __commonJS({
  "node_modules/adm-zip/util/utils.js"(exports, module) {
    var fsystem = __require("fs");
    var pth = __require("path");
    var Constants = require_constants();
    var Errors = require_errors();
    var isWin = typeof process === "object" && "win32" === process.platform;
    var is_Obj = (obj) => typeof obj === "object" && obj !== null;
    var crcTable = new Uint32Array(256).map((t, c) => {
      for (let k = 0; k < 8; k++) {
        if ((c & 1) !== 0) {
          c = 3988292384 ^ c >>> 1;
        } else {
          c >>>= 1;
        }
      }
      return c >>> 0;
    });
    function Utils(opts) {
      this.sep = pth.sep;
      this.fs = fsystem;
      if (is_Obj(opts)) {
        if (is_Obj(opts.fs) && typeof opts.fs.statSync === "function") {
          this.fs = opts.fs;
        }
      }
    }
    module.exports = Utils;
    Utils.prototype.makeDir = function(folder) {
      const self = this;
      function mkdirSync5(fpath) {
        let resolvedPath = fpath.split(self.sep)[0];
        fpath.split(self.sep).forEach(function(name) {
          if (!name || name.substr(-1, 1) === ":") return;
          resolvedPath += self.sep + name;
          var stat;
          try {
            stat = self.fs.statSync(resolvedPath);
          } catch (e) {
            self.fs.mkdirSync(resolvedPath);
          }
          if (stat && stat.isFile()) throw Errors.FILE_IN_THE_WAY(`"${resolvedPath}"`);
        });
      }
      mkdirSync5(folder);
    };
    Utils.prototype.writeFileTo = function(path6, content, overwrite, attr) {
      const self = this;
      if (self.fs.existsSync(path6)) {
        if (!overwrite) return false;
        var stat = self.fs.statSync(path6);
        if (stat.isDirectory()) {
          return false;
        }
      }
      var folder = pth.dirname(path6);
      if (!self.fs.existsSync(folder)) {
        self.makeDir(folder);
      }
      var fd;
      try {
        fd = self.fs.openSync(path6, "w", 438);
      } catch (e) {
        self.fs.chmodSync(path6, 438);
        fd = self.fs.openSync(path6, "w", 438);
      }
      if (fd) {
        try {
          self.fs.writeSync(fd, content, 0, content.length, 0);
        } finally {
          self.fs.closeSync(fd);
        }
      }
      self.fs.chmodSync(path6, attr || 438);
      return true;
    };
    Utils.prototype.writeFileToAsync = function(path6, content, overwrite, attr, callback) {
      if (typeof attr === "function") {
        callback = attr;
        attr = void 0;
      }
      const self = this;
      self.fs.exists(path6, function(exist) {
        if (exist && !overwrite) return callback(false);
        self.fs.stat(path6, function(err, stat) {
          if (exist && stat.isDirectory()) {
            return callback(false);
          }
          var folder = pth.dirname(path6);
          self.fs.exists(folder, function(exists) {
            if (!exists) self.makeDir(folder);
            self.fs.open(path6, "w", 438, function(err2, fd) {
              if (err2) {
                self.fs.chmod(path6, 438, function() {
                  self.fs.open(path6, "w", 438, function(err3, fd2) {
                    self.fs.write(fd2, content, 0, content.length, 0, function() {
                      self.fs.close(fd2, function() {
                        self.fs.chmod(path6, attr || 438, function() {
                          callback(true);
                        });
                      });
                    });
                  });
                });
              } else if (fd) {
                self.fs.write(fd, content, 0, content.length, 0, function() {
                  self.fs.close(fd, function() {
                    self.fs.chmod(path6, attr || 438, function() {
                      callback(true);
                    });
                  });
                });
              } else {
                self.fs.chmod(path6, attr || 438, function() {
                  callback(true);
                });
              }
            });
          });
        });
      });
    };
    Utils.prototype.findFiles = function(path6) {
      const self = this;
      function findSync(dir, pattern, recursive) {
        if (typeof pattern === "boolean") {
          recursive = pattern;
          pattern = void 0;
        }
        let files = [];
        self.fs.readdirSync(dir).forEach(function(file) {
          const path7 = pth.join(dir, file);
          const stat = self.fs.statSync(path7);
          if (!pattern || pattern.test(path7)) {
            files.push(pth.normalize(path7) + (stat.isDirectory() ? self.sep : ""));
          }
          if (stat.isDirectory() && recursive) files = files.concat(findSync(path7, pattern, recursive));
        });
        return files;
      }
      return findSync(path6, void 0, true);
    };
    Utils.prototype.findFilesAsync = function(dir, cb) {
      const self = this;
      let results = [];
      self.fs.readdir(dir, function(err, list) {
        if (err) return cb(err);
        let list_length = list.length;
        if (!list_length) return cb(null, results);
        list.forEach(function(file) {
          file = pth.join(dir, file);
          self.fs.stat(file, function(err2, stat) {
            if (err2) return cb(err2);
            if (stat) {
              results.push(pth.normalize(file) + (stat.isDirectory() ? self.sep : ""));
              if (stat.isDirectory()) {
                self.findFilesAsync(file, function(err3, res) {
                  if (err3) return cb(err3);
                  results = results.concat(res);
                  if (!--list_length) cb(null, results);
                });
              } else {
                if (!--list_length) cb(null, results);
              }
            }
          });
        });
      });
    };
    Utils.prototype.getAttributes = function() {
    };
    Utils.prototype.setAttributes = function() {
    };
    Utils.crc32update = function(crc, byte) {
      return crcTable[(crc ^ byte) & 255] ^ crc >>> 8;
    };
    Utils.crc32 = function(buf) {
      if (typeof buf === "string") {
        buf = Buffer.from(buf, "utf8");
      }
      let len = buf.length;
      let crc = ~0;
      for (let off = 0; off < len; ) crc = Utils.crc32update(crc, buf[off++]);
      return ~crc >>> 0;
    };
    Utils.methodToString = function(method) {
      switch (method) {
        case Constants.STORED:
          return "STORED (" + method + ")";
        case Constants.DEFLATED:
          return "DEFLATED (" + method + ")";
        default:
          return "UNSUPPORTED (" + method + ")";
      }
    };
    Utils.canonical = function(path6) {
      if (!path6) return "";
      const safeSuffix = pth.posix.normalize("/" + path6.split("\\").join("/"));
      return pth.join(".", safeSuffix);
    };
    Utils.zipnamefix = function(path6) {
      if (!path6) return "";
      const safeSuffix = pth.posix.normalize("/" + path6.split("\\").join("/"));
      return pth.posix.join(".", safeSuffix);
    };
    Utils.findLast = function(arr, callback) {
      if (!Array.isArray(arr)) throw new TypeError("arr is not array");
      const len = arr.length >>> 0;
      for (let i = len - 1; i >= 0; i--) {
        if (callback(arr[i], i, arr)) {
          return arr[i];
        }
      }
      return void 0;
    };
    Utils.sanitize = function(prefix, name) {
      prefix = pth.resolve(pth.normalize(prefix));
      var parts = name.split("/");
      for (var i = 0, l = parts.length; i < l; i++) {
        var path6 = pth.normalize(pth.join(prefix, parts.slice(i, l).join(pth.sep)));
        if (path6.indexOf(prefix) === 0) {
          return path6;
        }
      }
      return pth.normalize(pth.join(prefix, pth.basename(name)));
    };
    Utils.toBuffer = function toBuffer(input, encoder) {
      if (Buffer.isBuffer(input)) {
        return input;
      } else if (input instanceof Uint8Array) {
        return Buffer.from(input);
      } else {
        return typeof input === "string" ? encoder(input) : Buffer.alloc(0);
      }
    };
    Utils.readBigUInt64LE = function(buffer, index) {
      var slice = Buffer.from(buffer.slice(index, index + 8));
      slice.swap64();
      return parseInt(`0x${slice.toString("hex")}`);
    };
    Utils.fromDOS2Date = function(val) {
      return new Date((val >> 25 & 127) + 1980, Math.max((val >> 21 & 15) - 1, 0), Math.max(val >> 16 & 31, 1), val >> 11 & 31, val >> 5 & 63, (val & 31) << 1);
    };
    Utils.fromDate2DOS = function(val) {
      let date = 0;
      let time = 0;
      if (val.getFullYear() > 1979) {
        date = (val.getFullYear() - 1980 & 127) << 9 | val.getMonth() + 1 << 5 | val.getDate();
        time = val.getHours() << 11 | val.getMinutes() << 5 | val.getSeconds() >> 1;
      }
      return date << 16 | time;
    };
    Utils.isWin = isWin;
    Utils.crcTable = crcTable;
  }
});

// node_modules/adm-zip/util/fattr.js
var require_fattr = __commonJS({
  "node_modules/adm-zip/util/fattr.js"(exports, module) {
    var pth = __require("path");
    module.exports = function(path6, { fs: fs5 }) {
      var _path = path6 || "", _obj = newAttr(), _stat = null;
      function newAttr() {
        return {
          directory: false,
          readonly: false,
          hidden: false,
          executable: false,
          mtime: 0,
          atime: 0
        };
      }
      if (_path && fs5.existsSync(_path)) {
        _stat = fs5.statSync(_path);
        _obj.directory = _stat.isDirectory();
        _obj.mtime = _stat.mtime;
        _obj.atime = _stat.atime;
        _obj.executable = (73 & _stat.mode) !== 0;
        _obj.readonly = (128 & _stat.mode) === 0;
        _obj.hidden = pth.basename(_path)[0] === ".";
      } else {
        console.warn("Invalid path: " + _path);
      }
      return {
        get directory() {
          return _obj.directory;
        },
        get readOnly() {
          return _obj.readonly;
        },
        get hidden() {
          return _obj.hidden;
        },
        get mtime() {
          return _obj.mtime;
        },
        get atime() {
          return _obj.atime;
        },
        get executable() {
          return _obj.executable;
        },
        decodeAttributes: function() {
        },
        encodeAttributes: function() {
        },
        toJSON: function() {
          return {
            path: _path,
            isDirectory: _obj.directory,
            isReadOnly: _obj.readonly,
            isHidden: _obj.hidden,
            isExecutable: _obj.executable,
            mTime: _obj.mtime,
            aTime: _obj.atime
          };
        },
        toString: function() {
          return JSON.stringify(this.toJSON(), null, "	");
        }
      };
    };
  }
});

// node_modules/adm-zip/util/decoder.js
var require_decoder = __commonJS({
  "node_modules/adm-zip/util/decoder.js"(exports, module) {
    module.exports = {
      efs: true,
      encode: (data) => Buffer.from(data, "utf8"),
      decode: (data) => data.toString("utf8")
    };
  }
});

// node_modules/adm-zip/util/index.js
var require_util = __commonJS({
  "node_modules/adm-zip/util/index.js"(exports, module) {
    module.exports = require_utils();
    module.exports.Constants = require_constants();
    module.exports.Errors = require_errors();
    module.exports.FileAttr = require_fattr();
    module.exports.decoder = require_decoder();
  }
});

// node_modules/adm-zip/headers/entryHeader.js
var require_entryHeader = __commonJS({
  "node_modules/adm-zip/headers/entryHeader.js"(exports, module) {
    var Utils = require_util();
    var Constants = Utils.Constants;
    module.exports = function() {
      var _verMade = 20, _version = 10, _flags = 0, _method = 0, _time = 0, _crc = 0, _compressedSize = 0, _size = 0, _fnameLen = 0, _extraLen = 0, _comLen = 0, _diskStart = 0, _inattr = 0, _attr = 0, _offset = 0;
      _verMade |= Utils.isWin ? 2560 : 768;
      _flags |= Constants.FLG_EFS;
      const _localHeader = {
        extraLen: 0
      };
      const uint32 = (val) => Math.max(0, val) >>> 0;
      const uint16 = (val) => Math.max(0, val) & 65535;
      const uint8 = (val) => Math.max(0, val) & 255;
      _time = Utils.fromDate2DOS(/* @__PURE__ */ new Date());
      return {
        get made() {
          return _verMade;
        },
        set made(val) {
          _verMade = val;
        },
        get version() {
          return _version;
        },
        set version(val) {
          _version = val;
        },
        get flags() {
          return _flags;
        },
        set flags(val) {
          _flags = val;
        },
        get flags_efs() {
          return (_flags & Constants.FLG_EFS) > 0;
        },
        set flags_efs(val) {
          if (val) {
            _flags |= Constants.FLG_EFS;
          } else {
            _flags &= ~Constants.FLG_EFS;
          }
        },
        get flags_desc() {
          return (_flags & Constants.FLG_DESC) > 0;
        },
        set flags_desc(val) {
          if (val) {
            _flags |= Constants.FLG_DESC;
          } else {
            _flags &= ~Constants.FLG_DESC;
          }
        },
        get method() {
          return _method;
        },
        set method(val) {
          switch (val) {
            case Constants.STORED:
              this.version = 10;
            case Constants.DEFLATED:
            default:
              this.version = 20;
          }
          _method = val;
        },
        get time() {
          return Utils.fromDOS2Date(this.timeval);
        },
        set time(val) {
          this.timeval = Utils.fromDate2DOS(val);
        },
        get timeval() {
          return _time;
        },
        set timeval(val) {
          _time = uint32(val);
        },
        get timeHighByte() {
          return uint8(_time >>> 8);
        },
        get crc() {
          return _crc;
        },
        set crc(val) {
          _crc = uint32(val);
        },
        get compressedSize() {
          return _compressedSize;
        },
        set compressedSize(val) {
          _compressedSize = uint32(val);
        },
        get size() {
          return _size;
        },
        set size(val) {
          _size = uint32(val);
        },
        get fileNameLength() {
          return _fnameLen;
        },
        set fileNameLength(val) {
          _fnameLen = val;
        },
        get extraLength() {
          return _extraLen;
        },
        set extraLength(val) {
          _extraLen = val;
        },
        get extraLocalLength() {
          return _localHeader.extraLen;
        },
        set extraLocalLength(val) {
          _localHeader.extraLen = val;
        },
        get commentLength() {
          return _comLen;
        },
        set commentLength(val) {
          _comLen = val;
        },
        get diskNumStart() {
          return _diskStart;
        },
        set diskNumStart(val) {
          _diskStart = uint32(val);
        },
        get inAttr() {
          return _inattr;
        },
        set inAttr(val) {
          _inattr = uint32(val);
        },
        get attr() {
          return _attr;
        },
        set attr(val) {
          _attr = uint32(val);
        },
        // get Unix file permissions
        get fileAttr() {
          return (_attr || 0) >> 16 & 4095;
        },
        get offset() {
          return _offset;
        },
        set offset(val) {
          _offset = uint32(val);
        },
        get encrypted() {
          return (_flags & Constants.FLG_ENC) === Constants.FLG_ENC;
        },
        get centralHeaderSize() {
          return Constants.CENHDR + _fnameLen + _extraLen + _comLen;
        },
        get realDataOffset() {
          return _offset + Constants.LOCHDR + _localHeader.fnameLen + _localHeader.extraLen;
        },
        get localHeader() {
          return _localHeader;
        },
        loadLocalHeaderFromBinary: function(input) {
          var data = input.slice(_offset, _offset + Constants.LOCHDR);
          if (data.readUInt32LE(0) !== Constants.LOCSIG) {
            throw Utils.Errors.INVALID_LOC();
          }
          _localHeader.version = data.readUInt16LE(Constants.LOCVER);
          _localHeader.flags = data.readUInt16LE(Constants.LOCFLG);
          _localHeader.method = data.readUInt16LE(Constants.LOCHOW);
          _localHeader.time = data.readUInt32LE(Constants.LOCTIM);
          _localHeader.crc = data.readUInt32LE(Constants.LOCCRC);
          _localHeader.compressedSize = data.readUInt32LE(Constants.LOCSIZ);
          _localHeader.size = data.readUInt32LE(Constants.LOCLEN);
          _localHeader.fnameLen = data.readUInt16LE(Constants.LOCNAM);
          _localHeader.extraLen = data.readUInt16LE(Constants.LOCEXT);
          const extraStart = _offset + Constants.LOCHDR + _localHeader.fnameLen;
          const extraEnd = extraStart + _localHeader.extraLen;
          return input.slice(extraStart, extraEnd);
        },
        loadFromBinary: function(data) {
          if (data.length !== Constants.CENHDR || data.readUInt32LE(0) !== Constants.CENSIG) {
            throw Utils.Errors.INVALID_CEN();
          }
          _verMade = data.readUInt16LE(Constants.CENVEM);
          _version = data.readUInt16LE(Constants.CENVER);
          _flags = data.readUInt16LE(Constants.CENFLG);
          _method = data.readUInt16LE(Constants.CENHOW);
          _time = data.readUInt32LE(Constants.CENTIM);
          _crc = data.readUInt32LE(Constants.CENCRC);
          _compressedSize = data.readUInt32LE(Constants.CENSIZ);
          _size = data.readUInt32LE(Constants.CENLEN);
          _fnameLen = data.readUInt16LE(Constants.CENNAM);
          _extraLen = data.readUInt16LE(Constants.CENEXT);
          _comLen = data.readUInt16LE(Constants.CENCOM);
          _diskStart = data.readUInt16LE(Constants.CENDSK);
          _inattr = data.readUInt16LE(Constants.CENATT);
          _attr = data.readUInt32LE(Constants.CENATX);
          _offset = data.readUInt32LE(Constants.CENOFF);
        },
        localHeaderToBinary: function() {
          var data = Buffer.alloc(Constants.LOCHDR);
          data.writeUInt32LE(Constants.LOCSIG, 0);
          data.writeUInt16LE(_version, Constants.LOCVER);
          data.writeUInt16LE(_flags, Constants.LOCFLG);
          data.writeUInt16LE(_method, Constants.LOCHOW);
          data.writeUInt32LE(_time, Constants.LOCTIM);
          data.writeUInt32LE(_crc, Constants.LOCCRC);
          data.writeUInt32LE(_compressedSize, Constants.LOCSIZ);
          data.writeUInt32LE(_size, Constants.LOCLEN);
          data.writeUInt16LE(_fnameLen, Constants.LOCNAM);
          data.writeUInt16LE(_localHeader.extraLen, Constants.LOCEXT);
          return data;
        },
        centralHeaderToBinary: function() {
          var data = Buffer.alloc(Constants.CENHDR + _fnameLen + _extraLen + _comLen);
          data.writeUInt32LE(Constants.CENSIG, 0);
          data.writeUInt16LE(_verMade, Constants.CENVEM);
          data.writeUInt16LE(_version, Constants.CENVER);
          data.writeUInt16LE(_flags, Constants.CENFLG);
          data.writeUInt16LE(_method, Constants.CENHOW);
          data.writeUInt32LE(_time, Constants.CENTIM);
          data.writeUInt32LE(_crc, Constants.CENCRC);
          data.writeUInt32LE(_compressedSize, Constants.CENSIZ);
          data.writeUInt32LE(_size, Constants.CENLEN);
          data.writeUInt16LE(_fnameLen, Constants.CENNAM);
          data.writeUInt16LE(_extraLen, Constants.CENEXT);
          data.writeUInt16LE(_comLen, Constants.CENCOM);
          data.writeUInt16LE(_diskStart, Constants.CENDSK);
          data.writeUInt16LE(_inattr, Constants.CENATT);
          data.writeUInt32LE(_attr, Constants.CENATX);
          data.writeUInt32LE(_offset, Constants.CENOFF);
          return data;
        },
        toJSON: function() {
          const bytes = function(nr) {
            return nr + " bytes";
          };
          return {
            made: _verMade,
            version: _version,
            flags: _flags,
            method: Utils.methodToString(_method),
            time: this.time,
            crc: "0x" + _crc.toString(16).toUpperCase(),
            compressedSize: bytes(_compressedSize),
            size: bytes(_size),
            fileNameLength: bytes(_fnameLen),
            extraLength: bytes(_extraLen),
            commentLength: bytes(_comLen),
            diskNumStart: _diskStart,
            inAttr: _inattr,
            attr: _attr,
            offset: _offset,
            centralHeaderSize: bytes(Constants.CENHDR + _fnameLen + _extraLen + _comLen)
          };
        },
        toString: function() {
          return JSON.stringify(this.toJSON(), null, "	");
        }
      };
    };
  }
});

// node_modules/adm-zip/headers/mainHeader.js
var require_mainHeader = __commonJS({
  "node_modules/adm-zip/headers/mainHeader.js"(exports, module) {
    var Utils = require_util();
    var Constants = Utils.Constants;
    module.exports = function() {
      var _volumeEntries = 0, _totalEntries = 0, _size = 0, _offset = 0, _commentLength = 0;
      return {
        get diskEntries() {
          return _volumeEntries;
        },
        set diskEntries(val) {
          _volumeEntries = _totalEntries = val;
        },
        get totalEntries() {
          return _totalEntries;
        },
        set totalEntries(val) {
          _totalEntries = _volumeEntries = val;
        },
        get size() {
          return _size;
        },
        set size(val) {
          _size = val;
        },
        get offset() {
          return _offset;
        },
        set offset(val) {
          _offset = val;
        },
        get commentLength() {
          return _commentLength;
        },
        set commentLength(val) {
          _commentLength = val;
        },
        get mainHeaderSize() {
          return Constants.ENDHDR + _commentLength;
        },
        loadFromBinary: function(data) {
          if ((data.length !== Constants.ENDHDR || data.readUInt32LE(0) !== Constants.ENDSIG) && (data.length < Constants.ZIP64HDR || data.readUInt32LE(0) !== Constants.ZIP64SIG)) {
            throw Utils.Errors.INVALID_END();
          }
          if (data.readUInt32LE(0) === Constants.ENDSIG) {
            _volumeEntries = data.readUInt16LE(Constants.ENDSUB);
            _totalEntries = data.readUInt16LE(Constants.ENDTOT);
            _size = data.readUInt32LE(Constants.ENDSIZ);
            _offset = data.readUInt32LE(Constants.ENDOFF);
            _commentLength = data.readUInt16LE(Constants.ENDCOM);
          } else {
            _volumeEntries = Utils.readBigUInt64LE(data, Constants.ZIP64SUB);
            _totalEntries = Utils.readBigUInt64LE(data, Constants.ZIP64TOT);
            _size = Utils.readBigUInt64LE(data, Constants.ZIP64SIZE);
            _offset = Utils.readBigUInt64LE(data, Constants.ZIP64OFF);
            _commentLength = 0;
          }
        },
        toBinary: function() {
          var b = Buffer.alloc(Constants.ENDHDR + _commentLength);
          b.writeUInt32LE(Constants.ENDSIG, 0);
          b.writeUInt32LE(0, 4);
          b.writeUInt16LE(_volumeEntries, Constants.ENDSUB);
          b.writeUInt16LE(_totalEntries, Constants.ENDTOT);
          b.writeUInt32LE(_size, Constants.ENDSIZ);
          b.writeUInt32LE(_offset, Constants.ENDOFF);
          b.writeUInt16LE(_commentLength, Constants.ENDCOM);
          b.fill(" ", Constants.ENDHDR);
          return b;
        },
        toJSON: function() {
          const offset = function(nr, len) {
            let offs = nr.toString(16).toUpperCase();
            while (offs.length < len) offs = "0" + offs;
            return "0x" + offs;
          };
          return {
            diskEntries: _volumeEntries,
            totalEntries: _totalEntries,
            size: _size + " bytes",
            offset: offset(_offset, 4),
            commentLength: _commentLength
          };
        },
        toString: function() {
          return JSON.stringify(this.toJSON(), null, "	");
        }
      };
    };
  }
});

// node_modules/adm-zip/headers/index.js
var require_headers = __commonJS({
  "node_modules/adm-zip/headers/index.js"(exports) {
    exports.EntryHeader = require_entryHeader();
    exports.MainHeader = require_mainHeader();
  }
});

// node_modules/adm-zip/methods/deflater.js
var require_deflater = __commonJS({
  "node_modules/adm-zip/methods/deflater.js"(exports, module) {
    module.exports = function(inbuf) {
      var zlib = __require("zlib");
      var opts = { chunkSize: (parseInt(inbuf.length / 1024) + 1) * 1024 };
      return {
        deflate: function() {
          return zlib.deflateRawSync(inbuf, opts);
        },
        deflateAsync: function(callback) {
          var tmp = zlib.createDeflateRaw(opts), parts = [], total = 0;
          tmp.on("data", function(data) {
            parts.push(data);
            total += data.length;
          });
          tmp.on("end", function() {
            var buf = Buffer.alloc(total), written = 0;
            buf.fill(0);
            for (var i = 0; i < parts.length; i++) {
              var part = parts[i];
              part.copy(buf, written);
              written += part.length;
            }
            callback && callback(buf);
          });
          tmp.end(inbuf);
        }
      };
    };
  }
});

// node_modules/adm-zip/methods/inflater.js
var require_inflater = __commonJS({
  "node_modules/adm-zip/methods/inflater.js"(exports, module) {
    var version = +(process.versions ? process.versions.node : "").split(".")[0] || 0;
    module.exports = function(inbuf, expectedLength) {
      var zlib = __require("zlib");
      const option = version >= 15 && expectedLength > 0 ? { maxOutputLength: expectedLength } : {};
      return {
        inflate: function() {
          return zlib.inflateRawSync(inbuf, option);
        },
        inflateAsync: function(callback) {
          var tmp = zlib.createInflateRaw(option), parts = [], total = 0;
          tmp.on("data", function(data) {
            parts.push(data);
            total += data.length;
          });
          tmp.on("end", function() {
            var buf = Buffer.alloc(total), written = 0;
            buf.fill(0);
            for (var i = 0; i < parts.length; i++) {
              var part = parts[i];
              part.copy(buf, written);
              written += part.length;
            }
            callback && callback(buf);
          });
          tmp.end(inbuf);
        }
      };
    };
  }
});

// node_modules/adm-zip/methods/zipcrypto.js
var require_zipcrypto = __commonJS({
  "node_modules/adm-zip/methods/zipcrypto.js"(exports, module) {
    "use strict";
    var { randomFillSync } = __require("crypto");
    var Errors = require_errors();
    var crctable = new Uint32Array(256).map((t, crc) => {
      for (let j = 0; j < 8; j++) {
        if (0 !== (crc & 1)) {
          crc = crc >>> 1 ^ 3988292384;
        } else {
          crc >>>= 1;
        }
      }
      return crc >>> 0;
    });
    var uMul = (a, b) => Math.imul(a, b) >>> 0;
    var crc32update = (pCrc32, bval) => {
      return crctable[(pCrc32 ^ bval) & 255] ^ pCrc32 >>> 8;
    };
    var genSalt = () => {
      if ("function" === typeof randomFillSync) {
        return randomFillSync(Buffer.alloc(12));
      } else {
        return genSalt.node();
      }
    };
    genSalt.node = () => {
      const salt = Buffer.alloc(12);
      const len = salt.length;
      for (let i = 0; i < len; i++) salt[i] = Math.random() * 256 & 255;
      return salt;
    };
    var config = {
      genSalt
    };
    function Initkeys(pw) {
      const pass = Buffer.isBuffer(pw) ? pw : Buffer.from(pw);
      this.keys = new Uint32Array([305419896, 591751049, 878082192]);
      for (let i = 0; i < pass.length; i++) {
        this.updateKeys(pass[i]);
      }
    }
    Initkeys.prototype.updateKeys = function(byteValue) {
      const keys = this.keys;
      keys[0] = crc32update(keys[0], byteValue);
      keys[1] += keys[0] & 255;
      keys[1] = uMul(keys[1], 134775813) + 1;
      keys[2] = crc32update(keys[2], keys[1] >>> 24);
      return byteValue;
    };
    Initkeys.prototype.next = function() {
      const k = (this.keys[2] | 2) >>> 0;
      return uMul(k, k ^ 1) >> 8 & 255;
    };
    function make_decrypter(pwd) {
      const keys = new Initkeys(pwd);
      return function(data) {
        const result = Buffer.alloc(data.length);
        let pos = 0;
        for (let c of data) {
          result[pos++] = keys.updateKeys(c ^ keys.next());
        }
        return result;
      };
    }
    function make_encrypter(pwd) {
      const keys = new Initkeys(pwd);
      return function(data, result, pos = 0) {
        if (!result) result = Buffer.alloc(data.length);
        for (let c of data) {
          const k = keys.next();
          result[pos++] = c ^ k;
          keys.updateKeys(c);
        }
        return result;
      };
    }
    function decrypt(data, header, pwd) {
      if (!data || !Buffer.isBuffer(data) || data.length < 12) {
        return Buffer.alloc(0);
      }
      const decrypter = make_decrypter(pwd);
      const salt = decrypter(data.slice(0, 12));
      const verifyByte = (header.flags & 8) === 8 ? header.timeHighByte : header.crc >>> 24;
      if (salt[11] !== verifyByte) {
        throw Errors.WRONG_PASSWORD();
      }
      return decrypter(data.slice(12));
    }
    function _salter(data) {
      if (Buffer.isBuffer(data) && data.length >= 12) {
        config.genSalt = function() {
          return data.slice(0, 12);
        };
      } else if (data === "node") {
        config.genSalt = genSalt.node;
      } else {
        config.genSalt = genSalt;
      }
    }
    function encrypt(data, header, pwd, oldlike = false) {
      if (data == null) data = Buffer.alloc(0);
      if (!Buffer.isBuffer(data)) data = Buffer.from(data.toString());
      const encrypter = make_encrypter(pwd);
      const salt = config.genSalt();
      salt[11] = header.crc >>> 24 & 255;
      if (oldlike) salt[10] = header.crc >>> 16 & 255;
      const result = Buffer.alloc(data.length + 12);
      encrypter(salt, result);
      return encrypter(data, result, 12);
    }
    module.exports = { decrypt, encrypt, _salter };
  }
});

// node_modules/adm-zip/methods/index.js
var require_methods = __commonJS({
  "node_modules/adm-zip/methods/index.js"(exports) {
    exports.Deflater = require_deflater();
    exports.Inflater = require_inflater();
    exports.ZipCrypto = require_zipcrypto();
  }
});

// node_modules/adm-zip/zipEntry.js
var require_zipEntry = __commonJS({
  "node_modules/adm-zip/zipEntry.js"(exports, module) {
    var Utils = require_util();
    var Headers = require_headers();
    var Constants = Utils.Constants;
    var Methods = require_methods();
    module.exports = function(options, input) {
      var _centralHeader = new Headers.EntryHeader(), _entryName = Buffer.alloc(0), _comment = Buffer.alloc(0), _isDirectory = false, uncompressedData = null, _extra = Buffer.alloc(0), _extralocal = Buffer.alloc(0), _efs = true;
      const opts = options;
      const decoder = typeof opts.decoder === "object" ? opts.decoder : Utils.decoder;
      _efs = decoder.hasOwnProperty("efs") ? decoder.efs : false;
      function getCompressedDataFromZip() {
        if (!input || !(input instanceof Uint8Array)) {
          return Buffer.alloc(0);
        }
        _extralocal = _centralHeader.loadLocalHeaderFromBinary(input);
        return input.slice(_centralHeader.realDataOffset, _centralHeader.realDataOffset + _centralHeader.compressedSize);
      }
      function crc32OK(data) {
        if (!_centralHeader.flags_desc) {
          if (Utils.crc32(data) !== _centralHeader.localHeader.crc) {
            return false;
          }
        } else {
          const descriptor = {};
          const dataEndOffset = _centralHeader.realDataOffset + _centralHeader.compressedSize;
          if (input.readUInt32LE(dataEndOffset) == Constants.LOCSIG || input.readUInt32LE(dataEndOffset) == Constants.CENSIG) {
            throw Utils.Errors.DESCRIPTOR_NOT_EXIST();
          }
          if (input.readUInt32LE(dataEndOffset) == Constants.EXTSIG) {
            descriptor.crc = input.readUInt32LE(dataEndOffset + Constants.EXTCRC);
            descriptor.compressedSize = input.readUInt32LE(dataEndOffset + Constants.EXTSIZ);
            descriptor.size = input.readUInt32LE(dataEndOffset + Constants.EXTLEN);
          } else if (input.readUInt16LE(dataEndOffset + 12) === 19280) {
            descriptor.crc = input.readUInt32LE(dataEndOffset + Constants.EXTCRC - 4);
            descriptor.compressedSize = input.readUInt32LE(dataEndOffset + Constants.EXTSIZ - 4);
            descriptor.size = input.readUInt32LE(dataEndOffset + Constants.EXTLEN - 4);
          } else {
            throw Utils.Errors.DESCRIPTOR_UNKNOWN();
          }
          if (descriptor.compressedSize !== _centralHeader.compressedSize || descriptor.size !== _centralHeader.size || descriptor.crc !== _centralHeader.crc) {
            throw Utils.Errors.DESCRIPTOR_FAULTY();
          }
          if (Utils.crc32(data) !== descriptor.crc) {
            return false;
          }
        }
        return true;
      }
      function decompress(async, callback, pass) {
        if (typeof callback === "undefined" && typeof async === "string") {
          pass = async;
          async = void 0;
        }
        if (_isDirectory) {
          if (async && callback) {
            callback(Buffer.alloc(0), Utils.Errors.DIRECTORY_CONTENT_ERROR());
          }
          return Buffer.alloc(0);
        }
        var compressedData = getCompressedDataFromZip();
        if (compressedData.length === 0) {
          if (async && callback) callback(compressedData);
          return compressedData;
        }
        if (_centralHeader.encrypted) {
          if ("string" !== typeof pass && !Buffer.isBuffer(pass)) {
            throw Utils.Errors.INVALID_PASS_PARAM();
          }
          compressedData = Methods.ZipCrypto.decrypt(compressedData, _centralHeader, pass);
        }
        var data = Buffer.alloc(_centralHeader.size);
        switch (_centralHeader.method) {
          case Utils.Constants.STORED:
            compressedData.copy(data);
            if (!crc32OK(data)) {
              if (async && callback) callback(data, Utils.Errors.BAD_CRC());
              throw Utils.Errors.BAD_CRC();
            } else {
              if (async && callback) callback(data);
              return data;
            }
          case Utils.Constants.DEFLATED:
            var inflater = new Methods.Inflater(compressedData, _centralHeader.size);
            if (!async) {
              const result = inflater.inflate(data);
              result.copy(data, 0);
              if (!crc32OK(data)) {
                throw Utils.Errors.BAD_CRC(`"${decoder.decode(_entryName)}"`);
              }
              return data;
            } else {
              inflater.inflateAsync(function(result) {
                result.copy(result, 0);
                if (callback) {
                  if (!crc32OK(result)) {
                    callback(result, Utils.Errors.BAD_CRC());
                  } else {
                    callback(result);
                  }
                }
              });
            }
            break;
          default:
            if (async && callback) callback(Buffer.alloc(0), Utils.Errors.UNKNOWN_METHOD());
            throw Utils.Errors.UNKNOWN_METHOD();
        }
      }
      function compress(async, callback) {
        if ((!uncompressedData || !uncompressedData.length) && Buffer.isBuffer(input)) {
          if (async && callback) callback(getCompressedDataFromZip());
          return getCompressedDataFromZip();
        }
        if (uncompressedData.length && !_isDirectory) {
          var compressedData;
          switch (_centralHeader.method) {
            case Utils.Constants.STORED:
              _centralHeader.compressedSize = _centralHeader.size;
              compressedData = Buffer.alloc(uncompressedData.length);
              uncompressedData.copy(compressedData);
              if (async && callback) callback(compressedData);
              return compressedData;
            default:
            case Utils.Constants.DEFLATED:
              var deflater = new Methods.Deflater(uncompressedData);
              if (!async) {
                var deflated = deflater.deflate();
                _centralHeader.compressedSize = deflated.length;
                return deflated;
              } else {
                deflater.deflateAsync(function(data) {
                  compressedData = Buffer.alloc(data.length);
                  _centralHeader.compressedSize = data.length;
                  data.copy(compressedData);
                  callback && callback(compressedData);
                });
              }
              deflater = null;
              break;
          }
        } else if (async && callback) {
          callback(Buffer.alloc(0));
        } else {
          return Buffer.alloc(0);
        }
      }
      function readUInt64LE(buffer, offset) {
        return (buffer.readUInt32LE(offset + 4) << 4) + buffer.readUInt32LE(offset);
      }
      function parseExtra(data) {
        try {
          var offset = 0;
          var signature, size, part;
          while (offset + 4 < data.length) {
            signature = data.readUInt16LE(offset);
            offset += 2;
            size = data.readUInt16LE(offset);
            offset += 2;
            part = data.slice(offset, offset + size);
            offset += size;
            if (Constants.ID_ZIP64 === signature) {
              parseZip64ExtendedInformation(part);
            }
          }
        } catch (error) {
          throw Utils.Errors.EXTRA_FIELD_PARSE_ERROR();
        }
      }
      function parseZip64ExtendedInformation(data) {
        var size, compressedSize, offset, diskNumStart;
        if (data.length >= Constants.EF_ZIP64_SCOMP) {
          size = readUInt64LE(data, Constants.EF_ZIP64_SUNCOMP);
          if (_centralHeader.size === Constants.EF_ZIP64_OR_32) {
            _centralHeader.size = size;
          }
        }
        if (data.length >= Constants.EF_ZIP64_RHO) {
          compressedSize = readUInt64LE(data, Constants.EF_ZIP64_SCOMP);
          if (_centralHeader.compressedSize === Constants.EF_ZIP64_OR_32) {
            _centralHeader.compressedSize = compressedSize;
          }
        }
        if (data.length >= Constants.EF_ZIP64_DSN) {
          offset = readUInt64LE(data, Constants.EF_ZIP64_RHO);
          if (_centralHeader.offset === Constants.EF_ZIP64_OR_32) {
            _centralHeader.offset = offset;
          }
        }
        if (data.length >= Constants.EF_ZIP64_DSN + 4) {
          diskNumStart = data.readUInt32LE(Constants.EF_ZIP64_DSN);
          if (_centralHeader.diskNumStart === Constants.EF_ZIP64_OR_16) {
            _centralHeader.diskNumStart = diskNumStart;
          }
        }
      }
      return {
        get entryName() {
          return decoder.decode(_entryName);
        },
        get rawEntryName() {
          return _entryName;
        },
        set entryName(val) {
          _entryName = Utils.toBuffer(val, decoder.encode);
          var lastChar = _entryName[_entryName.length - 1];
          _isDirectory = lastChar === 47 || lastChar === 92;
          _centralHeader.fileNameLength = _entryName.length;
        },
        get efs() {
          if (typeof _efs === "function") {
            return _efs(this.entryName);
          } else {
            return _efs;
          }
        },
        get extra() {
          return _extra;
        },
        set extra(val) {
          _extra = val;
          _centralHeader.extraLength = val.length;
          parseExtra(val);
        },
        get comment() {
          return decoder.decode(_comment);
        },
        set comment(val) {
          _comment = Utils.toBuffer(val, decoder.encode);
          _centralHeader.commentLength = _comment.length;
          if (_comment.length > 65535) throw Utils.Errors.COMMENT_TOO_LONG();
        },
        get name() {
          var n = decoder.decode(_entryName);
          return _isDirectory ? n.substr(n.length - 1).split("/").pop() : n.split("/").pop();
        },
        get isDirectory() {
          return _isDirectory;
        },
        getCompressedData: function() {
          return compress(false, null);
        },
        getCompressedDataAsync: function(callback) {
          compress(true, callback);
        },
        setData: function(value) {
          uncompressedData = Utils.toBuffer(value, Utils.decoder.encode);
          if (!_isDirectory && uncompressedData.length) {
            _centralHeader.size = uncompressedData.length;
            _centralHeader.method = Utils.Constants.DEFLATED;
            _centralHeader.crc = Utils.crc32(value);
            _centralHeader.changed = true;
          } else {
            _centralHeader.method = Utils.Constants.STORED;
          }
        },
        getData: function(pass) {
          if (_centralHeader.changed) {
            return uncompressedData;
          } else {
            return decompress(false, null, pass);
          }
        },
        getDataAsync: function(callback, pass) {
          if (_centralHeader.changed) {
            callback(uncompressedData);
          } else {
            decompress(true, callback, pass);
          }
        },
        set attr(attr) {
          _centralHeader.attr = attr;
        },
        get attr() {
          return _centralHeader.attr;
        },
        set header(data) {
          _centralHeader.loadFromBinary(data);
        },
        get header() {
          return _centralHeader;
        },
        packCentralHeader: function() {
          _centralHeader.flags_efs = this.efs;
          _centralHeader.extraLength = _extra.length;
          var header = _centralHeader.centralHeaderToBinary();
          var addpos = Utils.Constants.CENHDR;
          _entryName.copy(header, addpos);
          addpos += _entryName.length;
          _extra.copy(header, addpos);
          addpos += _centralHeader.extraLength;
          _comment.copy(header, addpos);
          return header;
        },
        packLocalHeader: function() {
          let addpos = 0;
          _centralHeader.flags_efs = this.efs;
          _centralHeader.extraLocalLength = _extralocal.length;
          const localHeaderBuf = _centralHeader.localHeaderToBinary();
          const localHeader = Buffer.alloc(localHeaderBuf.length + _entryName.length + _centralHeader.extraLocalLength);
          localHeaderBuf.copy(localHeader, addpos);
          addpos += localHeaderBuf.length;
          _entryName.copy(localHeader, addpos);
          addpos += _entryName.length;
          _extralocal.copy(localHeader, addpos);
          addpos += _extralocal.length;
          return localHeader;
        },
        toJSON: function() {
          const bytes = function(nr) {
            return "<" + (nr && nr.length + " bytes buffer" || "null") + ">";
          };
          return {
            entryName: this.entryName,
            name: this.name,
            comment: this.comment,
            isDirectory: this.isDirectory,
            header: _centralHeader.toJSON(),
            compressedData: bytes(input),
            data: bytes(uncompressedData)
          };
        },
        toString: function() {
          return JSON.stringify(this.toJSON(), null, "	");
        }
      };
    };
  }
});

// node_modules/adm-zip/zipFile.js
var require_zipFile = __commonJS({
  "node_modules/adm-zip/zipFile.js"(exports, module) {
    var ZipEntry = require_zipEntry();
    var Headers = require_headers();
    var Utils = require_util();
    module.exports = function(inBuffer, options) {
      var entryList = [], entryTable = {}, _comment = Buffer.alloc(0), mainHeader = new Headers.MainHeader(), loadedEntries = false;
      var password = null;
      const temporary = /* @__PURE__ */ new Set();
      const opts = options;
      const { noSort, decoder } = opts;
      if (inBuffer) {
        readMainHeader(opts.readEntries);
      } else {
        loadedEntries = true;
      }
      function makeTemporaryFolders() {
        const foldersList = /* @__PURE__ */ new Set();
        for (const elem of Object.keys(entryTable)) {
          const elements = elem.split("/");
          elements.pop();
          if (!elements.length) continue;
          for (let i = 0; i < elements.length; i++) {
            const sub = elements.slice(0, i + 1).join("/") + "/";
            foldersList.add(sub);
          }
        }
        for (const elem of foldersList) {
          if (!(elem in entryTable)) {
            const tempfolder = new ZipEntry(opts);
            tempfolder.entryName = elem;
            tempfolder.attr = 16;
            tempfolder.temporary = true;
            entryList.push(tempfolder);
            entryTable[tempfolder.entryName] = tempfolder;
            temporary.add(tempfolder);
          }
        }
      }
      function readEntries() {
        loadedEntries = true;
        entryTable = {};
        if (mainHeader.diskEntries > (inBuffer.length - mainHeader.offset) / Utils.Constants.CENHDR) {
          throw Utils.Errors.DISK_ENTRY_TOO_LARGE();
        }
        entryList = new Array(mainHeader.diskEntries);
        var index = mainHeader.offset;
        for (var i = 0; i < entryList.length; i++) {
          var tmp = index, entry = new ZipEntry(opts, inBuffer);
          entry.header = inBuffer.slice(tmp, tmp += Utils.Constants.CENHDR);
          entry.entryName = inBuffer.slice(tmp, tmp += entry.header.fileNameLength);
          if (entry.header.extraLength) {
            entry.extra = inBuffer.slice(tmp, tmp += entry.header.extraLength);
          }
          if (entry.header.commentLength) entry.comment = inBuffer.slice(tmp, tmp + entry.header.commentLength);
          index += entry.header.centralHeaderSize;
          entryList[i] = entry;
          entryTable[entry.entryName] = entry;
        }
        temporary.clear();
        makeTemporaryFolders();
      }
      function readMainHeader(readNow) {
        var i = inBuffer.length - Utils.Constants.ENDHDR, max = Math.max(0, i - 65535), n = max, endStart = inBuffer.length, endOffset = -1, commentEnd = 0;
        const trailingSpace = typeof opts.trailingSpace === "boolean" ? opts.trailingSpace : false;
        if (trailingSpace) max = 0;
        for (i; i >= n; i--) {
          if (inBuffer[i] !== 80) continue;
          if (inBuffer.readUInt32LE(i) === Utils.Constants.ENDSIG) {
            endOffset = i;
            commentEnd = i;
            endStart = i + Utils.Constants.ENDHDR;
            n = i - Utils.Constants.END64HDR;
            continue;
          }
          if (inBuffer.readUInt32LE(i) === Utils.Constants.END64SIG) {
            n = max;
            continue;
          }
          if (inBuffer.readUInt32LE(i) === Utils.Constants.ZIP64SIG) {
            endOffset = i;
            endStart = i + Utils.readBigUInt64LE(inBuffer, i + Utils.Constants.ZIP64SIZE) + Utils.Constants.ZIP64LEAD;
            break;
          }
        }
        if (endOffset == -1) throw Utils.Errors.INVALID_FORMAT();
        mainHeader.loadFromBinary(inBuffer.slice(endOffset, endStart));
        if (mainHeader.commentLength) {
          _comment = inBuffer.slice(commentEnd + Utils.Constants.ENDHDR);
        }
        if (readNow) readEntries();
      }
      function sortEntries() {
        if (entryList.length > 1 && !noSort) {
          entryList.sort((a, b) => a.entryName.toLowerCase().localeCompare(b.entryName.toLowerCase()));
        }
      }
      return {
        /**
         * Returns an array of ZipEntry objects existent in the current opened archive
         * @return Array
         */
        get entries() {
          if (!loadedEntries) {
            readEntries();
          }
          return entryList.filter((e) => !temporary.has(e));
        },
        /**
         * Archive comment
         * @return {String}
         */
        get comment() {
          return decoder.decode(_comment);
        },
        set comment(val) {
          _comment = Utils.toBuffer(val, decoder.encode);
          mainHeader.commentLength = _comment.length;
        },
        getEntryCount: function() {
          if (!loadedEntries) {
            return mainHeader.diskEntries;
          }
          return entryList.length;
        },
        forEach: function(callback) {
          this.entries.forEach(callback);
        },
        /**
         * Returns a reference to the entry with the given name or null if entry is inexistent
         *
         * @param entryName
         * @return ZipEntry
         */
        getEntry: function(entryName) {
          if (!loadedEntries) {
            readEntries();
          }
          return entryTable[entryName] || null;
        },
        /**
         * Adds the given entry to the entry list
         *
         * @param entry
         */
        setEntry: function(entry) {
          if (!loadedEntries) {
            readEntries();
          }
          entryList.push(entry);
          entryTable[entry.entryName] = entry;
          mainHeader.totalEntries = entryList.length;
        },
        /**
         * Removes the file with the given name from the entry list.
         *
         * If the entry is a directory, then all nested files and directories will be removed
         * @param entryName
         * @returns {void}
         */
        deleteFile: function(entryName, withsubfolders = true) {
          if (!loadedEntries) {
            readEntries();
          }
          const entry = entryTable[entryName];
          const list = this.getEntryChildren(entry, withsubfolders).map((child) => child.entryName);
          list.forEach(this.deleteEntry);
        },
        /**
         * Removes the entry with the given name from the entry list.
         *
         * @param {string} entryName
         * @returns {void}
         */
        deleteEntry: function(entryName) {
          if (!loadedEntries) {
            readEntries();
          }
          const entry = entryTable[entryName];
          const index = entryList.indexOf(entry);
          if (index >= 0) {
            entryList.splice(index, 1);
            delete entryTable[entryName];
            mainHeader.totalEntries = entryList.length;
          }
        },
        /**
         *  Iterates and returns all nested files and directories of the given entry
         *
         * @param entry
         * @return Array
         */
        getEntryChildren: function(entry, subfolders = true) {
          if (!loadedEntries) {
            readEntries();
          }
          if (typeof entry === "object") {
            if (entry.isDirectory && subfolders) {
              const list = [];
              const name = entry.entryName;
              for (const zipEntry of entryList) {
                if (zipEntry.entryName.startsWith(name)) {
                  list.push(zipEntry);
                }
              }
              return list;
            } else {
              return [entry];
            }
          }
          return [];
        },
        /**
         *  How many child elements entry has
         *
         * @param {ZipEntry} entry
         * @return {integer}
         */
        getChildCount: function(entry) {
          if (entry && entry.isDirectory) {
            const list = this.getEntryChildren(entry);
            return list.includes(entry) ? list.length - 1 : list.length;
          }
          return 0;
        },
        /**
         * Returns the zip file
         *
         * @return Buffer
         */
        compressToBuffer: function() {
          if (!loadedEntries) {
            readEntries();
          }
          sortEntries();
          const dataBlock = [];
          const headerBlocks = [];
          let totalSize = 0;
          let dindex = 0;
          mainHeader.size = 0;
          mainHeader.offset = 0;
          let totalEntries = 0;
          for (const entry of this.entries) {
            const compressedData = entry.getCompressedData();
            entry.header.offset = dindex;
            const localHeader = entry.packLocalHeader();
            const dataLength = localHeader.length + compressedData.length;
            dindex += dataLength;
            dataBlock.push(localHeader);
            dataBlock.push(compressedData);
            const centralHeader = entry.packCentralHeader();
            headerBlocks.push(centralHeader);
            mainHeader.size += centralHeader.length;
            totalSize += dataLength + centralHeader.length;
            totalEntries++;
          }
          totalSize += mainHeader.mainHeaderSize;
          mainHeader.offset = dindex;
          mainHeader.totalEntries = totalEntries;
          dindex = 0;
          const outBuffer = Buffer.alloc(totalSize);
          for (const content of dataBlock) {
            content.copy(outBuffer, dindex);
            dindex += content.length;
          }
          for (const content of headerBlocks) {
            content.copy(outBuffer, dindex);
            dindex += content.length;
          }
          const mh = mainHeader.toBinary();
          if (_comment) {
            _comment.copy(mh, Utils.Constants.ENDHDR);
          }
          mh.copy(outBuffer, dindex);
          inBuffer = outBuffer;
          loadedEntries = false;
          return outBuffer;
        },
        toAsyncBuffer: function(onSuccess, onFail, onItemStart, onItemEnd) {
          try {
            if (!loadedEntries) {
              readEntries();
            }
            sortEntries();
            const dataBlock = [];
            const centralHeaders = [];
            let totalSize = 0;
            let dindex = 0;
            let totalEntries = 0;
            mainHeader.size = 0;
            mainHeader.offset = 0;
            const compress2Buffer = function(entryLists) {
              if (entryLists.length > 0) {
                const entry = entryLists.shift();
                const name = entry.entryName + entry.extra.toString();
                if (onItemStart) onItemStart(name);
                entry.getCompressedDataAsync(function(compressedData) {
                  if (onItemEnd) onItemEnd(name);
                  entry.header.offset = dindex;
                  const localHeader = entry.packLocalHeader();
                  const dataLength = localHeader.length + compressedData.length;
                  dindex += dataLength;
                  dataBlock.push(localHeader);
                  dataBlock.push(compressedData);
                  const centalHeader = entry.packCentralHeader();
                  centralHeaders.push(centalHeader);
                  mainHeader.size += centalHeader.length;
                  totalSize += dataLength + centalHeader.length;
                  totalEntries++;
                  compress2Buffer(entryLists);
                });
              } else {
                totalSize += mainHeader.mainHeaderSize;
                mainHeader.offset = dindex;
                mainHeader.totalEntries = totalEntries;
                dindex = 0;
                const outBuffer = Buffer.alloc(totalSize);
                dataBlock.forEach(function(content) {
                  content.copy(outBuffer, dindex);
                  dindex += content.length;
                });
                centralHeaders.forEach(function(content) {
                  content.copy(outBuffer, dindex);
                  dindex += content.length;
                });
                const mh = mainHeader.toBinary();
                if (_comment) {
                  _comment.copy(mh, Utils.Constants.ENDHDR);
                }
                mh.copy(outBuffer, dindex);
                inBuffer = outBuffer;
                loadedEntries = false;
                onSuccess(outBuffer);
              }
            };
            compress2Buffer(Array.from(this.entries));
          } catch (e) {
            onFail(e);
          }
        }
      };
    };
  }
});

// node_modules/adm-zip/adm-zip.js
var require_adm_zip = __commonJS({
  "node_modules/adm-zip/adm-zip.js"(exports, module) {
    var Utils = require_util();
    var pth = __require("path");
    var ZipEntry = require_zipEntry();
    var ZipFile = require_zipFile();
    var get_Bool = (...val) => Utils.findLast(val, (c) => typeof c === "boolean");
    var get_Str = (...val) => Utils.findLast(val, (c) => typeof c === "string");
    var get_Fun = (...val) => Utils.findLast(val, (c) => typeof c === "function");
    var defaultOptions = {
      // option "noSort" : if true it disables files sorting
      noSort: false,
      // read entries during load (initial loading may be slower)
      readEntries: false,
      // default method is none
      method: Utils.Constants.NONE,
      // file system
      fs: null
    };
    module.exports = function(input, options) {
      let inBuffer = null;
      const opts = Object.assign(/* @__PURE__ */ Object.create(null), defaultOptions);
      if (input && "object" === typeof input) {
        if (!(input instanceof Uint8Array)) {
          Object.assign(opts, input);
          input = opts.input ? opts.input : void 0;
          if (opts.input) delete opts.input;
        }
        if (Buffer.isBuffer(input)) {
          inBuffer = input;
          opts.method = Utils.Constants.BUFFER;
          input = void 0;
        }
      }
      Object.assign(opts, options);
      const filetools = new Utils(opts);
      if (typeof opts.decoder !== "object" || typeof opts.decoder.encode !== "function" || typeof opts.decoder.decode !== "function") {
        opts.decoder = Utils.decoder;
      }
      if (input && "string" === typeof input) {
        if (filetools.fs.existsSync(input)) {
          opts.method = Utils.Constants.FILE;
          opts.filename = input;
          inBuffer = filetools.fs.readFileSync(input);
        } else {
          throw Utils.Errors.INVALID_FILENAME();
        }
      }
      const _zip = new ZipFile(inBuffer, opts);
      const { canonical, sanitize, zipnamefix } = Utils;
      function getEntry(entry) {
        if (entry && _zip) {
          var item;
          if (typeof entry === "string") item = _zip.getEntry(pth.posix.normalize(entry));
          if (typeof entry === "object" && typeof entry.entryName !== "undefined" && typeof entry.header !== "undefined") item = _zip.getEntry(entry.entryName);
          if (item) {
            return item;
          }
        }
        return null;
      }
      function fixPath(zipPath) {
        const { join: join6, normalize, sep } = pth.posix;
        return join6(".", normalize(sep + zipPath.split("\\").join(sep) + sep));
      }
      function filenameFilter(filterfn) {
        if (filterfn instanceof RegExp) {
          return /* @__PURE__ */ (function(rx) {
            return function(filename) {
              return rx.test(filename);
            };
          })(filterfn);
        } else if ("function" !== typeof filterfn) {
          return () => true;
        }
        return filterfn;
      }
      const relativePath = (local, entry) => {
        let lastChar = entry.slice(-1);
        lastChar = lastChar === filetools.sep ? filetools.sep : "";
        return pth.relative(local, entry) + lastChar;
      };
      return {
        /**
         * Extracts the given entry from the archive and returns the content as a Buffer object
         * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
         * @param {Buffer|string} [pass] - password
         * @return Buffer or Null in case of error
         */
        readFile: function(entry, pass) {
          var item = getEntry(entry);
          return item && item.getData(pass) || null;
        },
        /**
         * Returns how many child elements has on entry (directories) on files it is always 0
         * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
         * @returns {integer}
         */
        childCount: function(entry) {
          const item = getEntry(entry);
          if (item) {
            return _zip.getChildCount(item);
          }
        },
        /**
         * Asynchronous readFile
         * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
         * @param {callback} callback
         *
         * @return Buffer or Null in case of error
         */
        readFileAsync: function(entry, callback) {
          var item = getEntry(entry);
          if (item) {
            item.getDataAsync(callback);
          } else {
            callback(null, "getEntry failed for:" + entry);
          }
        },
        /**
         * Extracts the given entry from the archive and returns the content as plain text in the given encoding
         * @param {ZipEntry|string} entry - ZipEntry object or String with the full path of the entry
         * @param {string} encoding - Optional. If no encoding is specified utf8 is used
         *
         * @return String
         */
        readAsText: function(entry, encoding) {
          var item = getEntry(entry);
          if (item) {
            var data = item.getData();
            if (data && data.length) {
              return data.toString(encoding || "utf8");
            }
          }
          return "";
        },
        /**
         * Asynchronous readAsText
         * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
         * @param {callback} callback
         * @param {string} [encoding] - Optional. If no encoding is specified utf8 is used
         *
         * @return String
         */
        readAsTextAsync: function(entry, callback, encoding) {
          var item = getEntry(entry);
          if (item) {
            item.getDataAsync(function(data, err) {
              if (err) {
                callback(data, err);
                return;
              }
              if (data && data.length) {
                callback(data.toString(encoding || "utf8"));
              } else {
                callback("");
              }
            });
          } else {
            callback("");
          }
        },
        /**
         * Remove the entry from the file or the entry and all it's nested directories and files if the given entry is a directory
         *
         * @param {ZipEntry|string} entry
         * @returns {void}
         */
        deleteFile: function(entry, withsubfolders = true) {
          var item = getEntry(entry);
          if (item) {
            _zip.deleteFile(item.entryName, withsubfolders);
          }
        },
        /**
         * Remove the entry from the file or directory without affecting any nested entries
         *
         * @param {ZipEntry|string} entry
         * @returns {void}
         */
        deleteEntry: function(entry) {
          var item = getEntry(entry);
          if (item) {
            _zip.deleteEntry(item.entryName);
          }
        },
        /**
         * Adds a comment to the zip. The zip must be rewritten after adding the comment.
         *
         * @param {string} comment
         */
        addZipComment: function(comment) {
          _zip.comment = comment;
        },
        /**
         * Returns the zip comment
         *
         * @return String
         */
        getZipComment: function() {
          return _zip.comment || "";
        },
        /**
         * Adds a comment to a specified zipEntry. The zip must be rewritten after adding the comment
         * The comment cannot exceed 65535 characters in length
         *
         * @param {ZipEntry} entry
         * @param {string} comment
         */
        addZipEntryComment: function(entry, comment) {
          var item = getEntry(entry);
          if (item) {
            item.comment = comment;
          }
        },
        /**
         * Returns the comment of the specified entry
         *
         * @param {ZipEntry} entry
         * @return String
         */
        getZipEntryComment: function(entry) {
          var item = getEntry(entry);
          if (item) {
            return item.comment || "";
          }
          return "";
        },
        /**
         * Updates the content of an existing entry inside the archive. The zip must be rewritten after updating the content
         *
         * @param {ZipEntry} entry
         * @param {Buffer} content
         */
        updateFile: function(entry, content) {
          var item = getEntry(entry);
          if (item) {
            item.setData(content);
          }
        },
        /**
         * Adds a file from the disk to the archive
         *
         * @param {string} localPath File to add to zip
         * @param {string} [zipPath] Optional path inside the zip
         * @param {string} [zipName] Optional name for the file
         * @param {string} [comment] Optional file comment
         */
        addLocalFile: function(localPath2, zipPath, zipName, comment) {
          if (filetools.fs.existsSync(localPath2)) {
            zipPath = zipPath ? fixPath(zipPath) : "";
            const p = pth.win32.basename(pth.win32.normalize(localPath2));
            zipPath += zipName ? zipName : p;
            const _attr = filetools.fs.statSync(localPath2);
            const data = _attr.isFile() ? filetools.fs.readFileSync(localPath2) : Buffer.alloc(0);
            if (_attr.isDirectory()) zipPath += filetools.sep;
            this.addFile(zipPath, data, comment, _attr);
          } else {
            throw Utils.Errors.FILE_NOT_FOUND(localPath2);
          }
        },
        /**
         * Callback for showing if everything was done.
         *
         * @callback doneCallback
         * @param {Error} err - Error object
         * @param {boolean} done - was request fully completed
         */
        /**
         * Adds a file from the disk to the archive
         *
         * @param {(object|string)} options - options object, if it is string it us used as localPath.
         * @param {string} options.localPath - Local path to the file.
         * @param {string} [options.comment] - Optional file comment.
         * @param {string} [options.zipPath] - Optional path inside the zip
         * @param {string} [options.zipName] - Optional name for the file
         * @param {doneCallback} callback - The callback that handles the response.
         */
        addLocalFileAsync: function(options2, callback) {
          options2 = typeof options2 === "object" ? options2 : { localPath: options2 };
          const localPath2 = pth.resolve(options2.localPath);
          const { comment } = options2;
          let { zipPath, zipName } = options2;
          const self = this;
          filetools.fs.stat(localPath2, function(err, stats) {
            if (err) return callback(err, false);
            zipPath = zipPath ? fixPath(zipPath) : "";
            const p = pth.win32.basename(pth.win32.normalize(localPath2));
            zipPath += zipName ? zipName : p;
            if (stats.isFile()) {
              filetools.fs.readFile(localPath2, function(err2, data) {
                if (err2) return callback(err2, false);
                self.addFile(zipPath, data, comment, stats);
                return setImmediate(callback, void 0, true);
              });
            } else if (stats.isDirectory()) {
              zipPath += filetools.sep;
              self.addFile(zipPath, Buffer.alloc(0), comment, stats);
              return setImmediate(callback, void 0, true);
            }
          });
        },
        /**
         * Adds a local directory and all its nested files and directories to the archive
         *
         * @param {string} localPath - local path to the folder
         * @param {string} [zipPath] - optional path inside zip
         * @param {(RegExp|function)} [filter] - optional RegExp or Function if files match will be included.
         */
        addLocalFolder: function(localPath2, zipPath, filter) {
          filter = filenameFilter(filter);
          zipPath = zipPath ? fixPath(zipPath) : "";
          localPath2 = pth.normalize(localPath2);
          if (filetools.fs.existsSync(localPath2)) {
            const items = filetools.findFiles(localPath2);
            const self = this;
            if (items.length) {
              for (const filepath of items) {
                const p = pth.join(zipPath, relativePath(localPath2, filepath));
                if (filter(p)) {
                  self.addLocalFile(filepath, pth.dirname(p));
                }
              }
            }
          } else {
            throw Utils.Errors.FILE_NOT_FOUND(localPath2);
          }
        },
        /**
         * Asynchronous addLocalFolder
         * @param {string} localPath
         * @param {callback} callback
         * @param {string} [zipPath] optional path inside zip
         * @param {RegExp|function} [filter] optional RegExp or Function if files match will
         *               be included.
         */
        addLocalFolderAsync: function(localPath2, callback, zipPath, filter) {
          filter = filenameFilter(filter);
          zipPath = zipPath ? fixPath(zipPath) : "";
          localPath2 = pth.normalize(localPath2);
          var self = this;
          filetools.fs.open(localPath2, "r", function(err) {
            if (err && err.code === "ENOENT") {
              callback(void 0, Utils.Errors.FILE_NOT_FOUND(localPath2));
            } else if (err) {
              callback(void 0, err);
            } else {
              var items = filetools.findFiles(localPath2);
              var i = -1;
              var next = function() {
                i += 1;
                if (i < items.length) {
                  var filepath = items[i];
                  var p = relativePath(localPath2, filepath).split("\\").join("/");
                  p = p.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
                  if (filter(p)) {
                    filetools.fs.stat(filepath, function(er0, stats) {
                      if (er0) callback(void 0, er0);
                      if (stats.isFile()) {
                        filetools.fs.readFile(filepath, function(er1, data) {
                          if (er1) {
                            callback(void 0, er1);
                          } else {
                            self.addFile(zipPath + p, data, "", stats);
                            next();
                          }
                        });
                      } else {
                        self.addFile(zipPath + p + "/", Buffer.alloc(0), "", stats);
                        next();
                      }
                    });
                  } else {
                    process.nextTick(() => {
                      next();
                    });
                  }
                } else {
                  callback(true, void 0);
                }
              };
              next();
            }
          });
        },
        /**
         * Adds a local directory and all its nested files and directories to the archive
         *
         * @param {object | string} options - options object, if it is string it us used as localPath.
         * @param {string} options.localPath - Local path to the folder.
         * @param {string} [options.zipPath] - optional path inside zip.
         * @param {RegExp|function} [options.filter] - optional RegExp or Function if files match will be included.
         * @param {function|string} [options.namefix] - optional function to help fix filename
         * @param {doneCallback} callback - The callback that handles the response.
         *
         */
        addLocalFolderAsync2: function(options2, callback) {
          const self = this;
          options2 = typeof options2 === "object" ? options2 : { localPath: options2 };
          localPath = pth.resolve(fixPath(options2.localPath));
          let { zipPath, filter, namefix } = options2;
          if (filter instanceof RegExp) {
            filter = /* @__PURE__ */ (function(rx) {
              return function(filename) {
                return rx.test(filename);
              };
            })(filter);
          } else if ("function" !== typeof filter) {
            filter = function() {
              return true;
            };
          }
          zipPath = zipPath ? fixPath(zipPath) : "";
          if (namefix == "latin1") {
            namefix = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
          }
          if (typeof namefix !== "function") namefix = (str) => str;
          const relPathFix = (entry) => pth.join(zipPath, namefix(relativePath(localPath, entry)));
          const fileNameFix = (entry) => pth.win32.basename(pth.win32.normalize(namefix(entry)));
          filetools.fs.open(localPath, "r", function(err) {
            if (err && err.code === "ENOENT") {
              callback(void 0, Utils.Errors.FILE_NOT_FOUND(localPath));
            } else if (err) {
              callback(void 0, err);
            } else {
              filetools.findFilesAsync(localPath, function(err2, fileEntries) {
                if (err2) return callback(err2);
                fileEntries = fileEntries.filter((dir) => filter(relPathFix(dir)));
                if (!fileEntries.length) callback(void 0, false);
                setImmediate(
                  fileEntries.reverse().reduce(function(next, entry) {
                    return function(err3, done) {
                      if (err3 || done === false) return setImmediate(next, err3, false);
                      self.addLocalFileAsync(
                        {
                          localPath: entry,
                          zipPath: pth.dirname(relPathFix(entry)),
                          zipName: fileNameFix(entry)
                        },
                        next
                      );
                    };
                  }, callback)
                );
              });
            }
          });
        },
        /**
         * Adds a local directory and all its nested files and directories to the archive
         *
         * @param {string} localPath - path where files will be extracted
         * @param {object} props - optional properties
         * @param {string} [props.zipPath] - optional path inside zip
         * @param {RegExp|function} [props.filter] - optional RegExp or Function if files match will be included.
         * @param {function|string} [props.namefix] - optional function to help fix filename
         */
        addLocalFolderPromise: function(localPath2, props) {
          return new Promise((resolve, reject) => {
            this.addLocalFolderAsync2(Object.assign({ localPath: localPath2 }, props), (err, done) => {
              if (err) reject(err);
              if (done) resolve(this);
            });
          });
        },
        /**
         * Allows you to create a entry (file or directory) in the zip file.
         * If you want to create a directory the entryName must end in / and a null buffer should be provided.
         * Comment and attributes are optional
         *
         * @param {string} entryName
         * @param {Buffer | string} content - file content as buffer or utf8 coded string
         * @param {string} [comment] - file comment
         * @param {number | object} [attr] - number as unix file permissions, object as filesystem Stats object
         */
        addFile: function(entryName, content, comment, attr) {
          entryName = zipnamefix(entryName);
          let entry = getEntry(entryName);
          const update = entry != null;
          if (!update) {
            entry = new ZipEntry(opts);
            entry.entryName = entryName;
          }
          entry.comment = comment || "";
          const isStat = "object" === typeof attr && attr instanceof filetools.fs.Stats;
          if (isStat) {
            entry.header.time = attr.mtime;
          }
          var fileattr = entry.isDirectory ? 16 : 0;
          let unix = entry.isDirectory ? 16384 : 32768;
          if (isStat) {
            unix |= 4095 & attr.mode;
          } else if ("number" === typeof attr) {
            unix |= 4095 & attr;
          } else {
            unix |= entry.isDirectory ? 493 : 420;
          }
          fileattr = (fileattr | unix << 16) >>> 0;
          entry.attr = fileattr;
          entry.setData(content);
          if (!update) _zip.setEntry(entry);
          return entry;
        },
        /**
         * Returns an array of ZipEntry objects representing the files and folders inside the archive
         *
         * @param {string} [password]
         * @returns Array
         */
        getEntries: function(password) {
          _zip.password = password;
          return _zip ? _zip.entries : [];
        },
        /**
         * Returns a ZipEntry object representing the file or folder specified by ``name``.
         *
         * @param {string} name
         * @return ZipEntry
         */
        getEntry: function(name) {
          return getEntry(name);
        },
        getEntryCount: function() {
          return _zip.getEntryCount();
        },
        forEach: function(callback) {
          return _zip.forEach(callback);
        },
        /**
         * Extracts the given entry to the given targetPath
         * If the entry is a directory inside the archive, the entire directory and it's subdirectories will be extracted
         *
         * @param {string|ZipEntry} entry - ZipEntry object or String with the full path of the entry
         * @param {string} targetPath - Target folder where to write the file
         * @param {boolean} [maintainEntryPath=true] - If maintainEntryPath is true and the entry is inside a folder, the entry folder will be created in targetPath as well. Default is TRUE
         * @param {boolean} [overwrite=false] - If the file already exists at the target path, the file will be overwriten if this is true.
         * @param {boolean} [keepOriginalPermission=false] - The file will be set as the permission from the entry if this is true.
         * @param {string} [outFileName] - String If set will override the filename of the extracted file (Only works if the entry is a file)
         *
         * @return Boolean
         */
        extractEntryTo: function(entry, targetPath, maintainEntryPath, overwrite, keepOriginalPermission, outFileName) {
          overwrite = get_Bool(false, overwrite);
          keepOriginalPermission = get_Bool(false, keepOriginalPermission);
          maintainEntryPath = get_Bool(true, maintainEntryPath);
          outFileName = get_Str(keepOriginalPermission, outFileName);
          var item = getEntry(entry);
          if (!item) {
            throw Utils.Errors.NO_ENTRY();
          }
          var entryName = canonical(item.entryName);
          var target = sanitize(targetPath, outFileName && !item.isDirectory ? outFileName : maintainEntryPath ? entryName : pth.basename(entryName));
          if (item.isDirectory) {
            var children = _zip.getEntryChildren(item);
            children.forEach(function(child) {
              if (child.isDirectory) return;
              var content2 = child.getData();
              if (!content2) {
                throw Utils.Errors.CANT_EXTRACT_FILE();
              }
              var name = canonical(child.entryName);
              var childName = sanitize(targetPath, maintainEntryPath ? name : pth.basename(name));
              const fileAttr2 = keepOriginalPermission ? child.header.fileAttr : void 0;
              filetools.writeFileTo(childName, content2, overwrite, fileAttr2);
            });
            return true;
          }
          var content = item.getData(_zip.password);
          if (!content) throw Utils.Errors.CANT_EXTRACT_FILE();
          if (filetools.fs.existsSync(target) && !overwrite) {
            throw Utils.Errors.CANT_OVERRIDE();
          }
          const fileAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
          filetools.writeFileTo(target, content, overwrite, fileAttr);
          return true;
        },
        /**
         * Test the archive
         * @param {string} [pass]
         */
        test: function(pass) {
          if (!_zip) {
            return false;
          }
          for (var entry in _zip.entries) {
            try {
              if (entry.isDirectory) {
                continue;
              }
              var content = _zip.entries[entry].getData(pass);
              if (!content) {
                return false;
              }
            } catch (err) {
              return false;
            }
          }
          return true;
        },
        /**
         * Extracts the entire archive to the given location
         *
         * @param {string} targetPath Target location
         * @param {boolean} [overwrite=false] If the file already exists at the target path, the file will be overwriten if this is true.
         *                  Default is FALSE
         * @param {boolean} [keepOriginalPermission=false] The file will be set as the permission from the entry if this is true.
         *                  Default is FALSE
         * @param {string|Buffer} [pass] password
         */
        extractAllTo: function(targetPath, overwrite, keepOriginalPermission, pass) {
          keepOriginalPermission = get_Bool(false, keepOriginalPermission);
          pass = get_Str(keepOriginalPermission, pass);
          overwrite = get_Bool(false, overwrite);
          if (!_zip) throw Utils.Errors.NO_ZIP();
          _zip.entries.forEach(function(entry) {
            var entryName = sanitize(targetPath, canonical(entry.entryName));
            if (entry.isDirectory) {
              filetools.makeDir(entryName);
              return;
            }
            var content = entry.getData(pass);
            if (!content) {
              throw Utils.Errors.CANT_EXTRACT_FILE();
            }
            const fileAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
            filetools.writeFileTo(entryName, content, overwrite, fileAttr);
            try {
              filetools.fs.utimesSync(entryName, entry.header.time, entry.header.time);
            } catch (err) {
              throw Utils.Errors.CANT_EXTRACT_FILE();
            }
          });
        },
        /**
         * Asynchronous extractAllTo
         *
         * @param {string} targetPath Target location
         * @param {boolean} [overwrite=false] If the file already exists at the target path, the file will be overwriten if this is true.
         *                  Default is FALSE
         * @param {boolean} [keepOriginalPermission=false] The file will be set as the permission from the entry if this is true.
         *                  Default is FALSE
         * @param {function} callback The callback will be executed when all entries are extracted successfully or any error is thrown.
         */
        extractAllToAsync: function(targetPath, overwrite, keepOriginalPermission, callback) {
          callback = get_Fun(overwrite, keepOriginalPermission, callback);
          keepOriginalPermission = get_Bool(false, keepOriginalPermission);
          overwrite = get_Bool(false, overwrite);
          if (!callback) {
            return new Promise((resolve, reject) => {
              this.extractAllToAsync(targetPath, overwrite, keepOriginalPermission, function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve(this);
                }
              });
            });
          }
          if (!_zip) {
            callback(Utils.Errors.NO_ZIP());
            return;
          }
          targetPath = pth.resolve(targetPath);
          const getPath = (entry) => sanitize(targetPath, pth.normalize(canonical(entry.entryName)));
          const getError = (msg, file) => new Error(msg + ': "' + file + '"');
          const dirEntries = [];
          const fileEntries = [];
          _zip.entries.forEach((e) => {
            if (e.isDirectory) {
              dirEntries.push(e);
            } else {
              fileEntries.push(e);
            }
          });
          for (const entry of dirEntries) {
            const dirPath = getPath(entry);
            const dirAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
            try {
              filetools.makeDir(dirPath);
              if (dirAttr) filetools.fs.chmodSync(dirPath, dirAttr);
              filetools.fs.utimesSync(dirPath, entry.header.time, entry.header.time);
            } catch (er) {
              callback(getError("Unable to create folder", dirPath));
            }
          }
          fileEntries.reverse().reduce(function(next, entry) {
            return function(err) {
              if (err) {
                next(err);
              } else {
                const entryName = pth.normalize(canonical(entry.entryName));
                const filePath = sanitize(targetPath, entryName);
                entry.getDataAsync(function(content, err_1) {
                  if (err_1) {
                    next(err_1);
                  } else if (!content) {
                    next(Utils.Errors.CANT_EXTRACT_FILE());
                  } else {
                    const fileAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
                    filetools.writeFileToAsync(filePath, content, overwrite, fileAttr, function(succ) {
                      if (!succ) {
                        next(getError("Unable to write file", filePath));
                      }
                      filetools.fs.utimes(filePath, entry.header.time, entry.header.time, function(err_2) {
                        if (err_2) {
                          next(getError("Unable to set times", filePath));
                        } else {
                          next();
                        }
                      });
                    });
                  }
                });
              }
            };
          }, callback)();
        },
        /**
         * Writes the newly created zip file to disk at the specified location or if a zip was opened and no ``targetFileName`` is provided, it will overwrite the opened zip
         *
         * @param {string} targetFileName
         * @param {function} callback
         */
        writeZip: function(targetFileName, callback) {
          if (arguments.length === 1) {
            if (typeof targetFileName === "function") {
              callback = targetFileName;
              targetFileName = "";
            }
          }
          if (!targetFileName && opts.filename) {
            targetFileName = opts.filename;
          }
          if (!targetFileName) return;
          var zipData = _zip.compressToBuffer();
          if (zipData) {
            var ok = filetools.writeFileTo(targetFileName, zipData, true);
            if (typeof callback === "function") callback(!ok ? new Error("failed") : null, "");
          }
        },
        /**
                 *
                 * @param {string} targetFileName
                 * @param {object} [props]
                 * @param {boolean} [props.overwrite=true] If the file already exists at the target path, the file will be overwriten if this is true.
                 * @param {boolean} [props.perm] The file will be set as the permission from the entry if this is true.
        
                 * @returns {Promise<void>}
                 */
        writeZipPromise: function(targetFileName, props) {
          const { overwrite, perm } = Object.assign({ overwrite: true }, props);
          return new Promise((resolve, reject) => {
            if (!targetFileName && opts.filename) targetFileName = opts.filename;
            if (!targetFileName) reject("ADM-ZIP: ZIP File Name Missing");
            this.toBufferPromise().then((zipData) => {
              const ret = (done) => done ? resolve(done) : reject("ADM-ZIP: Wasn't able to write zip file");
              filetools.writeFileToAsync(targetFileName, zipData, overwrite, perm, ret);
            }, reject);
          });
        },
        /**
         * @returns {Promise<Buffer>} A promise to the Buffer.
         */
        toBufferPromise: function() {
          return new Promise((resolve, reject) => {
            _zip.toAsyncBuffer(resolve, reject);
          });
        },
        /**
         * Returns the content of the entire zip file as a Buffer object
         *
         * @prop {function} [onSuccess]
         * @prop {function} [onFail]
         * @prop {function} [onItemStart]
         * @prop {function} [onItemEnd]
         * @returns {Buffer}
         */
        toBuffer: function(onSuccess, onFail, onItemStart, onItemEnd) {
          if (typeof onSuccess === "function") {
            _zip.toAsyncBuffer(onSuccess, onFail, onItemStart, onItemEnd);
            return null;
          }
          return _zip.compressToBuffer();
        }
      };
    };
  }
});

// electron/main.ts
import { app as app3, BrowserWindow, dialog, ipcMain, shell } from "electron";
import * as path5 from "path";
import { fileURLToPath } from "url";

// electron/services/local-runner.ts
import { spawn } from "child_process";
import * as fs3 from "fs";
import * as path3 from "path";

// electron/services/logger.ts
import * as fs from "fs";
import * as path from "path";
import { app } from "electron";
var ANSI = {
  reset: "\x1B[0m",
  bold: "\x1B[1m",
  dim: "\x1B[2m",
  italic: "\x1B[3m",
  underline: "\x1B[4m",
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m",
  gray: "\x1B[90m",
  bgBlack: "\x1B[40m",
  bgRed: "\x1B[41m",
  bgGreen: "\x1B[42m",
  bgYellow: "\x1B[43m",
  bgBlue: "\x1B[44m",
  bgMagenta: "\x1B[45m",
  bgCyan: "\x1B[46m",
  bgWhite: "\x1B[47m",
  brightRed: "\x1B[91m",
  brightGreen: "\x1B[92m",
  brightYellow: "\x1B[93m",
  brightBlue: "\x1B[94m",
  brightMagenta: "\x1B[95m",
  brightCyan: "\x1B[96m"
};
var LEVEL_COLORS = {
  debug: { icon: "\u2500", color: ANSI.gray, label: "DBG" },
  info: { icon: "\u25CF", color: ANSI.brightBlue, label: "INF" },
  success: { icon: "\u2714", color: ANSI.brightGreen, label: "OK " },
  warn: { icon: "\u26A0", color: ANSI.brightYellow, label: "WRN" },
  error: { icon: "\u2718", color: ANSI.brightRed, label: "ERR" }
};
var CATEGORY_COLORS = {
  "App": ANSI.brightCyan,
  "IPC": ANSI.cyan,
  "Runner": ANSI.brightBlue,
  "Project": ANSI.blue,
  "Logger": ANSI.gray,
  "Process": ANSI.white,
  "Renderer": ANSI.magenta,
  "WebContainer": ANSI.brightMagenta,
  "PreWarm": ANSI.brightCyan,
  "NPM": ANSI.yellow,
  "DevServer": ANSI.brightGreen,
  "FileSystem": ANSI.gray,
  "Pipeline": ANSI.brightMagenta,
  "AutoRunner": ANSI.brightBlue,
  "CodeGen": ANSI.brightMagenta,
  "Validator": ANSI.green,
  "ErrorFix": ANSI.brightRed,
  "Cache": ANSI.brightCyan,
  "npm": ANSI.yellow
};
var ElectronLogger = class {
  logDir;
  logFile;
  listeners = [];
  buffer = [];
  maxBufferSize = 1e3;
  minLevel = "debug";
  timers = /* @__PURE__ */ new Map();
  levelPriority = {
    debug: 0,
    info: 1,
    success: 2,
    warn: 3,
    error: 4
  };
  constructor() {
    try {
      this.logDir = path.join(app.getPath("userData"), "logs");
    } catch {
      this.logDir = path.join(process.cwd(), "logs");
    }
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    this.logFile = path.join(this.logDir, `autocoder-${date}.log`);
    this.info("Logger", "Logger initialized", { logFile: this.logFile });
  }
  shouldLog(level) {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }
  formatTime() {
    const d = /* @__PURE__ */ new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${d.getMilliseconds().toString().padStart(3, "0")}`;
  }
  formatFileEntry(entry) {
    const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : "";
    const durStr = entry.duration != null ? ` (${entry.duration}ms)` : "";
    return `[${entry.timestamp}] [${entry.level.toUpperCase().padEnd(7)}] [${entry.category.padEnd(12)}] ${entry.message}${durStr}${dataStr}`;
  }
  log(level, category, message, data, duration) {
    if (!this.shouldLog(level)) return;
    const entry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      category,
      message,
      data,
      duration
    };
    const lvl = LEVEL_COLORS[level];
    const catColor = CATEGORY_COLORS[category] || ANSI.white;
    const timeStr = this.formatTime();
    const durStr = duration != null ? ` ${ANSI.dim}(${duration}ms)${ANSI.reset}` : "";
    const catPad = category.padEnd(12);
    const line = `${ANSI.gray}${timeStr}${ANSI.reset} ${lvl.color}${lvl.icon} ${lvl.label}${ANSI.reset} ${catColor}${ANSI.bold}[${catPad}]${ANSI.reset} ${message}${durStr}`;
    switch (level) {
      case "error":
        console.error(line);
        break;
      case "warn":
        console.warn(line);
        break;
      default:
        console.log(line);
    }
    if (data && typeof data === "object" && Object.keys(data).length > 0) {
      for (const [key, value] of Object.entries(data)) {
        const val = typeof value === "object" ? JSON.stringify(value) : String(value);
        console.log(`${ANSI.gray}                          \u2514 ${key}: ${val}${ANSI.reset}`);
      }
    }
    try {
      fs.appendFileSync(this.logFile, this.formatFileEntry(entry) + "\n");
    } catch (err) {
      console.error("Failed to write log:", err);
    }
    this.buffer.push(entry);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }
    this.listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch (err) {
        console.error("Log listener error:", err);
      }
    });
  }
  debug(category, message, data) {
    this.log("debug", category, message, data);
  }
  info(category, message, data) {
    this.log("info", category, message, data);
  }
  success(category, message, data, duration) {
    this.log("success", category, message, data, duration);
  }
  warn(category, message, data, duration) {
    this.log("warn", category, message, data, duration);
  }
  error(category, message, data, duration) {
    this.log("error", category, message, data, duration);
  }
  ipc(channel, direction, data) {
    const arrow = direction === "in" ? ">>>" : "<<<";
    this.debug("IPC", `${arrow} ${channel}`, data);
  }
  process(source, output) {
    const lines = output.split("\n").filter(Boolean);
    lines.forEach((line) => {
      if (line.toLowerCase().includes("error") || line.toLowerCase().includes("err!")) {
        this.error(source, line);
      } else if (line.toLowerCase().includes("warn")) {
        this.warn(source, line);
      } else {
        this.info(source, line);
      }
    });
  }
  startTimer(label) {
    this.timers.set(label, Date.now());
  }
  endTimer(label) {
    const start = this.timers.get(label);
    if (start == null) return 0;
    this.timers.delete(label);
    return Date.now() - start;
  }
  separator(label) {
    const line = label ? `\u2500\u2500\u2500 ${label} ${"\u2500".repeat(Math.max(0, 50 - label.length))}` : "\u2500".repeat(60);
    console.log(`${ANSI.gray}${line}${ANSI.reset}`);
    try {
      fs.appendFileSync(this.logFile, line + "\n");
    } catch {
    }
  }
  group(category, title) {
    const catColor = CATEGORY_COLORS[category] || ANSI.white;
    console.log(`${catColor}${ANSI.bold}\u25BC [${category}] ${title}${ANSI.reset}`);
  }
  groupEnd() {
    console.log(`${ANSI.gray}\u25B2 end${ANSI.reset}`);
  }
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }
  getRecentLogs(count = 100) {
    return this.buffer.slice(-count);
  }
  getLogsByLevel(level) {
    return this.buffer.filter((e) => e.level === level);
  }
  getLogsByCategory(category) {
    return this.buffer.filter((e) => e.category === category);
  }
  setMinLevel(level) {
    this.minLevel = level;
    this.info("Logger", `Log level set to ${level}`);
  }
  getLogFilePath() {
    return this.logFile;
  }
  clearBuffer() {
    this.buffer = [];
    this.info("Logger", "Log buffer cleared");
  }
  rotateLogs() {
    try {
      const files = fs.readdirSync(this.logDir).filter((f) => f.startsWith("autocoder-") && f.endsWith(".log")).sort();
      while (files.length > 7) {
        const oldest = files.shift();
        if (oldest) {
          fs.unlinkSync(path.join(this.logDir, oldest));
          this.info("Logger", `Deleted old log: ${oldest}`);
        }
      }
    } catch (err) {
      this.error("Logger", "Failed to rotate logs", { error: String(err) });
    }
  }
};
var logger = new ElectronLogger();

// electron/services/npm-cache.ts
import * as fs2 from "fs";
import * as path2 from "path";
import * as crypto from "crypto";
import { app as app2 } from "electron";
var import_adm_zip = __toESM(require_adm_zip(), 1);
var CACHE_READY_FILE = ".cache-unpacked";
var NpmCacheManager = class {
  cacheDir;
  nodeModulesDir;
  zipSourceDir;
  isReady = false;
  constructor() {
    const userDataPath = app2.getPath("userData");
    this.cacheDir = path2.join(userDataPath, "npm-offline-cache");
    this.nodeModulesDir = path2.join(this.cacheDir, "node_modules");
    const resourcesPath = app2.isPackaged ? path2.join(process.resourcesPath, "npm-cache") : path2.join(path2.dirname(app2.getAppPath()), "electron", "npm-cache");
    this.zipSourceDir = resourcesPath;
  }
  get cachePath() {
    return this.nodeModulesDir;
  }
  get ready() {
    return this.isReady;
  }
  async initialize() {
    try {
      logger.info("NpmCache", `Cache directory: ${this.cacheDir}`);
      logger.info("NpmCache", `Zip source directory: ${this.zipSourceDir}`);
      if (!fs2.existsSync(this.zipSourceDir)) {
        logger.warn("NpmCache", `Zip source directory not found: ${this.zipSourceDir}`);
        return false;
      }
      const readyFile = path2.join(this.cacheDir, CACHE_READY_FILE);
      if (fs2.existsSync(readyFile) && fs2.existsSync(this.nodeModulesDir)) {
        const manifest = this.readManifest();
        if (manifest) {
          logger.info("NpmCache", `Cache already unpacked: ${manifest.totalPackages} packages`);
          this.isReady = true;
          return true;
        }
      }
      logger.info("NpmCache", "Unpacking offline npm cache (first run)...");
      return await this.unpackCache();
    } catch (err) {
      logger.error("NpmCache", `Failed to initialize cache: ${err}`);
      return false;
    }
  }
  async unpackCache() {
    try {
      if (fs2.existsSync(this.cacheDir)) {
        fs2.rmSync(this.cacheDir, { recursive: true });
      }
      fs2.mkdirSync(this.cacheDir, { recursive: true });
      fs2.mkdirSync(this.nodeModulesDir, { recursive: true });
      const zipFiles = fs2.readdirSync(this.zipSourceDir).filter((f) => f.startsWith("cache-part-") && f.endsWith(".zip")).sort();
      if (zipFiles.length === 0) {
        logger.warn("NpmCache", "No cache zip files found");
        return false;
      }
      const manifest = this.readSourceManifest();
      const checksums = manifest?.chunkChecksums || {};
      logger.info("NpmCache", `Found ${zipFiles.length} cache chunks to unpack`);
      for (const zipFile of zipFiles) {
        const zipPath = path2.join(this.zipSourceDir, zipFile);
        logger.info("NpmCache", `Unpacking ${zipFile}...`);
        if (checksums[zipFile]) {
          const actualHash = await this.computeFileHash(zipPath);
          if (actualHash !== checksums[zipFile]) {
            logger.error("NpmCache", `Integrity check failed for ${zipFile}: expected ${checksums[zipFile].slice(0, 16)}..., got ${actualHash.slice(0, 16)}...`);
            return false;
          }
          logger.info("NpmCache", `\u2713 ${zipFile} integrity verified`);
        }
        try {
          const zip = new import_adm_zip.default(zipPath);
          zip.extractAllTo(this.nodeModulesDir, true);
        } catch (err) {
          logger.error("NpmCache", `Failed to unpack ${zipFile}: ${err}`);
          return false;
        }
      }
      const manifestSrc = path2.join(this.zipSourceDir, "manifest.json");
      if (fs2.existsSync(manifestSrc)) {
        fs2.copyFileSync(manifestSrc, path2.join(this.cacheDir, "manifest.json"));
      }
      fs2.writeFileSync(
        path2.join(this.cacheDir, CACHE_READY_FILE),
        JSON.stringify({ unpackedAt: (/* @__PURE__ */ new Date()).toISOString(), chunks: zipFiles.length })
      );
      const cachedManifest = this.readManifest();
      const pkgCount = cachedManifest?.totalPackages || "unknown";
      logger.info("NpmCache", `Cache unpacked successfully: ${pkgCount} packages ready`);
      this.isReady = true;
      return true;
    } catch (err) {
      logger.error("NpmCache", `Cache unpack failed: ${err}`);
      return false;
    }
  }
  readSourceManifest() {
    try {
      const manifestPath = path2.join(this.zipSourceDir, "manifest.json");
      if (fs2.existsSync(manifestPath)) {
        return JSON.parse(fs2.readFileSync(manifestPath, "utf-8"));
      }
    } catch {
    }
    return null;
  }
  readManifest() {
    try {
      const manifestPath = path2.join(this.cacheDir, "manifest.json");
      if (fs2.existsSync(manifestPath)) {
        return JSON.parse(fs2.readFileSync(manifestPath, "utf-8"));
      }
    } catch {
    }
    return null;
  }
  hasPackage(packageName) {
    if (!this.isReady) return false;
    const pkgDir = path2.join(this.nodeModulesDir, packageName);
    return fs2.existsSync(pkgDir) && fs2.existsSync(path2.join(pkgDir, "package.json"));
  }
  getPackageVersion(packageName) {
    if (!this.isReady) return null;
    try {
      const pkgJsonPath = path2.join(this.nodeModulesDir, packageName, "package.json");
      if (fs2.existsSync(pkgJsonPath)) {
        return JSON.parse(fs2.readFileSync(pkgJsonPath, "utf-8")).version;
      }
    } catch {
    }
    return null;
  }
  listCachedPackages() {
    if (!this.isReady) return [];
    const manifest = this.readManifest();
    if (manifest?.packages) {
      return Object.keys(manifest.packages);
    }
    return [];
  }
  getAllCachedPackageNames() {
    if (!this.isReady || !fs2.existsSync(this.nodeModulesDir)) return /* @__PURE__ */ new Set();
    const manifest = this.readManifest();
    if (manifest?.packages) {
      return new Set(Object.keys(manifest.packages));
    }
    const names = /* @__PURE__ */ new Set();
    try {
      const entries = fs2.readdirSync(this.nodeModulesDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
        if (entry.name.startsWith("@")) {
          const scopeDir = path2.join(this.nodeModulesDir, entry.name);
          const scopedEntries = fs2.readdirSync(scopeDir, { withFileTypes: true });
          for (const scoped of scopedEntries) {
            if (scoped.isDirectory()) {
              names.add(`${entry.name}/${scoped.name}`);
            }
          }
        } else {
          names.add(entry.name);
        }
      }
    } catch {
    }
    return names;
  }
  verifyInstalledPackage(nodeModulesDir, pkgName, _requiredRange) {
    try {
      const pkgJsonPath = path2.join(nodeModulesDir, pkgName, "package.json");
      if (!fs2.existsSync(pkgJsonPath)) return false;
      const installed = JSON.parse(fs2.readFileSync(pkgJsonPath, "utf-8"));
      return !!installed.version;
    } catch {
      return false;
    }
  }
  getCacheStats() {
    const manifest = this.readManifest();
    let sizeBytes = 0;
    if (this.isReady && fs2.existsSync(this.nodeModulesDir)) {
      try {
        sizeBytes = this.getDirSizeSync(this.nodeModulesDir);
      } catch {
      }
    }
    return {
      ready: this.isReady,
      packageCount: manifest?.totalPackages || 0,
      cachePath: this.nodeModulesDir,
      sizeBytes
    };
  }
  computeFileHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha256");
      const stream = fs2.createReadStream(filePath);
      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", reject);
    });
  }
  getDirSizeSync(dirPath) {
    let size = 0;
    try {
      const entries = fs2.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path2.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          size += this.getDirSizeSync(fullPath);
        } else {
          size += fs2.statSync(fullPath).size;
        }
      }
    } catch {
    }
    return size;
  }
};
var npmCache = new NpmCacheManager();

// electron/services/local-runner.ts
var LocalRunner = class {
  currentProcess = null;
  serverUrl = null;
  serverPort = 5200;
  async writeFiles(projectPath, files) {
    logger.startTimer("write-files");
    logger.info("FileSystem", `Writing ${files.length} files to ${projectPath}`);
    let dirsCreated = 0;
    for (const file of files) {
      const fullPath = path3.join(projectPath, file.path);
      const dir = path3.dirname(fullPath);
      if (!fs3.existsSync(dir)) {
        fs3.mkdirSync(dir, { recursive: true });
        dirsCreated++;
      }
      fs3.writeFileSync(fullPath, file.content, "utf-8");
    }
    const elapsed = logger.endTimer("write-files");
    logger.success("FileSystem", `Wrote ${files.length} files (${dirsCreated} dirs created)`, {
      projectPath,
      fileCount: files.length,
      dirsCreated
    }, elapsed);
  }
  countDependencies(projectPath) {
    try {
      const packageJsonPath = path3.join(projectPath, "package.json");
      if (!fs3.existsSync(packageJsonPath)) return { deps: 0, devDeps: 0, total: 0, names: [] };
      const packageJson = JSON.parse(fs3.readFileSync(packageJsonPath, "utf-8"));
      const depNames = Object.keys(packageJson.dependencies || {});
      const devDepNames = Object.keys(packageJson.devDependencies || {});
      return {
        deps: depNames.length,
        devDeps: devDepNames.length,
        total: depNames.length + devDepNames.length,
        names: [...depNames, ...devDepNames]
      };
    } catch {
      return { deps: 0, devDeps: 0, total: 0, names: [] };
    }
  }
  bulkCopyCache(projectPath, onLog, onProgress) {
    if (!npmCache.ready) {
      logger.info("NpmCache", "Offline cache not ready, skipping bulk copy");
      return { copied: false, missing: [] };
    }
    const depInfo = this.countDependencies(projectPath);
    if (depInfo.total === 0) return { copied: false, missing: [] };
    const nodeModulesDest = path3.join(projectPath, "node_modules");
    const cachePath = npmCache.cachePath;
    logger.startTimer("bulk-copy-cache");
    logger.info("NpmCache", `Bulk-copying cached node_modules to project (${depInfo.total} deps requested)`);
    onLog("[AutoCoder] \u{1F4E6} Copying package cache into project...");
    onProgress?.(5, "Copying cached packages...");
    try {
      if (!fs3.existsSync(nodeModulesDest)) {
        fs3.mkdirSync(nodeModulesDest, { recursive: true });
      }
      fs3.cpSync(cachePath, nodeModulesDest, { recursive: true, force: true });
    } catch (err) {
      logger.error("NpmCache", `Bulk copy failed: ${err}`);
      onLog("[AutoCoder] \u26A0 Cache copy failed, will fall back to npm install");
      return { copied: false, missing: depInfo.names };
    }
    const elapsed = logger.endTimer("bulk-copy-cache");
    logger.success("NpmCache", "Bulk copy of node_modules complete", { projectPath }, elapsed);
    onProgress?.(50, "Package cache copied, verifying packages...");
    const packageJsonPath = path3.join(projectPath, "package.json");
    let allDeps = {};
    try {
      const pkg = JSON.parse(fs3.readFileSync(packageJsonPath, "utf-8"));
      allDeps = { ...pkg.dependencies || {}, ...pkg.devDependencies || {} };
    } catch {
    }
    const missing = [];
    for (const dep of depInfo.names) {
      const requiredRange = allDeps[dep] || "*";
      if (!npmCache.verifyInstalledPackage(nodeModulesDest, dep, requiredRange)) {
        missing.push(dep);
      }
    }
    if (missing.length === 0) {
      onLog(`[AutoCoder] \u2713 All ${depInfo.total} packages loaded from cache \u2014 no download needed`);
      logger.success("NpmCache", `All ${depInfo.total} requested deps verified in cache, npm install skipped`);
    } else {
      onLog(`[AutoCoder] \u2713 Cache loaded, ${missing.length} extra package(s) need downloading: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "..." : ""}`);
      logger.info("NpmCache", `${depInfo.total - missing.length} cached, ${missing.length} missing: ${missing.join(", ")}`);
    }
    return { copied: true, missing };
  }
  copyDirRecursive(src, dest) {
    fs3.cpSync(src, dest, { recursive: true, force: true });
  }
  runNpmInstall(projectPath, onLog, onProgress, extraArgs = [], startPercent = 0) {
    return new Promise((resolve) => {
      const depInfo = this.countDependencies(projectPath);
      let installedCount = 0;
      let lastPercent = startPercent;
      const npm = process.platform === "win32" ? "npm.cmd" : "npm";
      const npmArgs = ["install", "--progress", ...extraArgs];
      const child = spawn(npm, npmArgs, {
        cwd: projectPath,
        shell: true,
        env: { ...process.env, FORCE_COLOR: "1" }
      });
      logger.debug("Process", `Spawned npm install (PID: ${child.pid})`, {
        command: `${npm} ${npmArgs.join(" ")}`,
        cwd: projectPath
      });
      const updateProgress = (line) => {
        if (depInfo.total === 0) {
          onProgress?.(50, "Installing packages...");
          return;
        }
        const addedMatch = line.match(/added (\d+) package/i);
        if (addedMatch) {
          installedCount = parseInt(addedMatch[1], 10);
          const percent = Math.min(Math.round(installedCount / Math.max(depInfo.total, installedCount) * 100), 99);
          if (percent > lastPercent) {
            lastPercent = percent;
            onProgress?.(percent, `Installed ${installedCount} packages...`);
          }
          return;
        }
        const httpMatch = line.match(/http fetch (GET|POST)/i);
        if (httpMatch && lastPercent < 30) {
          lastPercent = Math.min(lastPercent + 2, 30);
          onProgress?.(lastPercent, "Fetching packages...");
          return;
        }
        const reifyMatch = line.match(/reify:/i);
        if (reifyMatch && lastPercent < 60) {
          lastPercent = Math.min(lastPercent + 5, 60);
          onProgress?.(lastPercent, "Extracting packages...");
          return;
        }
        const buildMatch = line.match(/timing build/i);
        if (buildMatch && lastPercent < 90) {
          lastPercent = Math.min(lastPercent + 3, 90);
          onProgress?.(lastPercent, "Building packages...");
        }
      };
      child.stdout?.on("data", (data) => {
        const lines = data.toString().split("\n").filter(Boolean);
        lines.forEach((line) => {
          onLog(`[npm] ${line}`);
          updateProgress(line);
          if (line.includes("added") && line.includes("package")) {
            logger.success("NPM", line.trim());
          } else if (line.toLowerCase().includes("warn")) {
            logger.warn("NPM", line.trim());
          } else if (line.toLowerCase().includes("error") || line.toLowerCase().includes("err!")) {
            logger.error("NPM", line.trim());
          } else {
            logger.debug("NPM", line.trim());
          }
        });
      });
      child.stderr?.on("data", (data) => {
        const lines = data.toString().split("\n").filter(Boolean);
        lines.forEach((line) => {
          onLog(`[npm] ${line}`);
          updateProgress(line);
          if (line.toLowerCase().includes("warn")) {
            logger.warn("NPM", line.trim());
          } else if (line.toLowerCase().includes("error") || line.toLowerCase().includes("err!")) {
            logger.error("NPM", line.trim());
          } else {
            logger.debug("NPM", line.trim());
          }
        });
      });
      child.on("error", (error) => {
        const elapsed = logger.endTimer("npm-install");
        logger.error("NPM", `npm install failed: ${error.message}`, { error: error.message }, elapsed);
        logger.separator("NPM INSTALL FAILED");
        onLog(`[AutoCoder] npm install failed: ${error.message}`);
        onProgress?.(0, `Error: ${error.message}`);
        resolve({ success: false, error: error.message });
      });
      child.on("close", (code) => {
        const elapsed = logger.endTimer("npm-install");
        if (code === 0) {
          logger.success("NPM", `npm install completed (${installedCount} packages added)`, {
            exitCode: code,
            projectPath
          }, elapsed);
          logger.separator("NPM INSTALL DONE");
          onLog("[AutoCoder] npm install completed successfully");
          onProgress?.(100, "Installation complete!");
          resolve({ success: true });
        } else {
          logger.error("NPM", `npm install failed with code ${code}`, {
            exitCode: code,
            projectPath
          }, elapsed);
          logger.separator("NPM INSTALL FAILED");
          onLog(`[AutoCoder] npm install failed with code ${code}`);
          onProgress?.(0, `Failed with code ${code}`);
          resolve({ success: false, error: `npm install exited with code ${code}` });
        }
      });
    });
  }
  async npmInstall(projectPath, onLog, onProgress) {
    const depInfo = this.countDependencies(projectPath);
    logger.separator("NPM INSTALL START");
    logger.startTimer("npm-install");
    logger.info("NPM", `Starting npm install (${depInfo.total} packages: ${depInfo.deps} deps + ${depInfo.devDeps} devDeps)`, {
      projectPath,
      packages: depInfo.names.slice(0, 20).join(", ") + (depInfo.names.length > 20 ? `... +${depInfo.names.length - 20} more` : "")
    });
    const cacheResult = this.bulkCopyCache(projectPath, onLog, onProgress);
    if (cacheResult.copied && cacheResult.missing.length === 0) {
      onLog("[AutoCoder] All packages cached \u2014 running quick dependency check...");
      onProgress?.(80, "Verifying dependency tree...");
      return this.runNpmInstall(projectPath, onLog, onProgress, ["--prefer-offline"], 80);
    }
    if (cacheResult.copied && cacheResult.missing.length > 0) {
      onLog(`[AutoCoder] Installing ${cacheResult.missing.length} extra packages...`);
      onProgress?.(55, `Installing ${cacheResult.missing.length} extra packages...`);
      return this.runNpmInstall(projectPath, onLog, onProgress, ["--prefer-offline"], 55);
    }
    onLog("[AutoCoder] Running full npm install...");
    onProgress?.(0, `Starting installation (${depInfo.total} packages)...`);
    return this.runNpmInstall(projectPath, onLog, onProgress);
  }
  async startDevServer(projectPath, onLog) {
    if (this.currentProcess) {
      logger.info("DevServer", "Stopping existing dev server before starting new one");
      await this.stopDevServer();
    }
    return new Promise((resolve) => {
      const packageJsonPath = path3.join(projectPath, "package.json");
      if (!fs3.existsSync(packageJsonPath)) {
        logger.error("DevServer", "package.json not found", { projectPath });
        resolve({ success: false, error: "package.json not found" });
        return;
      }
      const packageJson = JSON.parse(fs3.readFileSync(packageJsonPath, "utf-8"));
      const scripts = packageJson.scripts || {};
      let command = "npm";
      let args = ["run"];
      let scriptName = "";
      if (scripts.dev) {
        args.push("dev");
        scriptName = "dev";
      } else if (scripts.start) {
        args.push("start");
        scriptName = "start";
      } else {
        logger.error("DevServer", "No dev or start script found in package.json", {
          availableScripts: Object.keys(scripts)
        });
        resolve({ success: false, error: "No dev or start script found in package.json" });
        return;
      }
      logger.separator("DEV SERVER START");
      logger.startTimer("dev-server-start");
      logger.info("DevServer", `Starting dev server (script: "${scriptName}", port: ${this.serverPort})`, {
        projectPath,
        script: scriptName,
        port: this.serverPort
      });
      onLog(`[AutoCoder] Starting dev server (port ${this.serverPort})...`);
      const npm = process.platform === "win32" ? "npm.cmd" : "npm";
      this.currentProcess = spawn(npm, args, {
        cwd: projectPath,
        shell: true,
        env: {
          ...process.env,
          PORT: String(this.serverPort),
          FORCE_COLOR: "1"
        }
      });
      logger.debug("Process", `Spawned dev server (PID: ${this.currentProcess.pid})`, {
        command: `${npm} ${args.join(" ")}`,
        cwd: projectPath
      });
      let serverStarted = false;
      const urlPattern = /localhost:(\d+)|http:\/\/127\.0\.0\.1:(\d+)|http:\/\/0\.0\.0\.0:(\d+)/;
      const handleOutput = (data) => {
        const text = data.toString();
        const lines = text.split("\n").filter(Boolean);
        lines.forEach((line) => {
          onLog(`[dev] ${line}`);
          if (line.toLowerCase().includes("error")) {
            logger.error("DevServer", line.trim());
          } else if (line.toLowerCase().includes("warn")) {
            logger.warn("DevServer", line.trim());
          } else if (line.includes("ready") || line.includes("compiled") || line.includes("listening")) {
            logger.success("DevServer", line.trim());
          } else {
            logger.debug("DevServer", line.trim());
          }
          if (!serverStarted) {
            const match = line.match(urlPattern);
            if (match) {
              const port = match[1] || match[2] || match[3];
              this.serverUrl = `http://localhost:${port}`;
              serverStarted = true;
              const elapsed = logger.endTimer("dev-server-start");
              logger.success("DevServer", `Dev server ready at ${this.serverUrl}`, {
                port,
                url: this.serverUrl
              }, elapsed);
              logger.separator("DEV SERVER READY");
              onLog(`[AutoCoder] Dev server ready at ${this.serverUrl}`);
              resolve({ success: true, url: this.serverUrl });
            }
          }
        });
      };
      this.currentProcess.stdout?.on("data", handleOutput);
      this.currentProcess.stderr?.on("data", handleOutput);
      this.currentProcess.on("error", (error) => {
        logger.error("DevServer", `Dev server error: ${error.message}`, { error: error.message });
        onLog(`[AutoCoder] Dev server error: ${error.message}`);
        if (!serverStarted) {
          logger.endTimer("dev-server-start");
          logger.separator("DEV SERVER FAILED");
          resolve({ success: false, error: error.message });
        }
      });
      this.currentProcess.on("close", (code) => {
        if (!serverStarted) {
          const elapsed = logger.endTimer("dev-server-start");
          logger.error("DevServer", `Dev server exited before ready (code ${code})`, { exitCode: code }, elapsed);
          logger.separator("DEV SERVER FAILED");
          onLog(`[AutoCoder] Dev server exited with code ${code}`);
          resolve({ success: false, error: `Server exited with code ${code}` });
        } else {
          logger.info("DevServer", `Dev server process exited (code ${code})`);
        }
        this.currentProcess = null;
        this.serverUrl = null;
      });
      setTimeout(() => {
        if (!serverStarted && this.currentProcess) {
          this.serverUrl = `http://localhost:${this.serverPort}`;
          const elapsed = logger.endTimer("dev-server-start");
          logger.warn("DevServer", `No URL detected, assuming server ready at ${this.serverUrl}`, {
            timeout: "10s",
            port: this.serverPort
          }, elapsed);
          onLog(`[AutoCoder] Assuming server ready at ${this.serverUrl}`);
          serverStarted = true;
          resolve({ success: true, url: this.serverUrl });
        }
      }, 1e4);
    });
  }
  async stopDevServer() {
    if (this.currentProcess) {
      const pid = this.currentProcess.pid;
      logger.info("DevServer", `Stopping dev server (PID: ${pid})`);
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(pid), "/f", "/t"]);
      } else {
        this.currentProcess.kill("SIGTERM");
      }
      this.currentProcess = null;
      this.serverUrl = null;
      logger.success("DevServer", "Dev server stopped");
    }
  }
  isServerRunning() {
    return this.currentProcess !== null;
  }
  getServerUrl() {
    return this.serverUrl;
  }
  cleanup() {
    logger.info("Runner", "Cleaning up runner resources");
    this.stopDevServer();
  }
};

// electron/services/project-manager.ts
import * as fs4 from "fs";
import * as path4 from "path";
import * as os from "os";
var ProjectManager = class {
  baseDir;
  constructor() {
    this.baseDir = path4.join(os.homedir(), "AutoCoder", "projects");
    this.ensureBaseDir();
  }
  ensureBaseDir() {
    if (!fs4.existsSync(this.baseDir)) {
      fs4.mkdirSync(this.baseDir, { recursive: true });
    }
  }
  getProjectPath(projectName) {
    const safeName = projectName.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
    return path4.join(this.baseDir, safeName);
  }
  async ensureProject(projectName) {
    const projectPath = this.getProjectPath(projectName);
    if (!fs4.existsSync(projectPath)) {
      fs4.mkdirSync(projectPath, { recursive: true });
    }
    return projectPath;
  }
  async listProjects() {
    this.ensureBaseDir();
    try {
      const entries = fs4.readdirSync(this.baseDir, { withFileTypes: true });
      return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort((a, b) => {
        const aPath = path4.join(this.baseDir, a);
        const bPath = path4.join(this.baseDir, b);
        const aStat = fs4.statSync(aPath);
        const bStat = fs4.statSync(bPath);
        return bStat.mtime.getTime() - aStat.mtime.getTime();
      });
    } catch {
      return [];
    }
  }
  async deleteProject(projectName) {
    const projectPath = this.getProjectPath(projectName);
    if (fs4.existsSync(projectPath)) {
      fs4.rmSync(projectPath, { recursive: true, force: true });
    }
  }
  async projectExists(projectName) {
    const projectPath = this.getProjectPath(projectName);
    return fs4.existsSync(projectPath);
  }
  getBaseDir() {
    return this.baseDir;
  }
};

// electron/main.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path5.dirname(__filename);
var isDev = process.env.NODE_ENV === "development" || !app3.isPackaged;
function checkNodeVersion() {
  const version = process.versions.node;
  const major = parseInt(version.split(".")[0], 10);
  const supported = major >= 18 && major < 23;
  if (!supported) {
    const msg = `Node.js v${version} detected. AutoCoder requires Node.js v18\u2013v22 (LTS). Non-LTS versions may cause WebContainer npm installs to hang silently.`;
    logger.warn("NodeVersion", msg);
    dialog.showMessageBoxSync({
      type: "warning",
      title: "Node.js Version Warning",
      message: `Unsupported Node.js v${version}`,
      detail: `AutoCoder requires Node.js v18, v20, or v22 (LTS).

Node.js v${major} is not supported and may cause npm installs to hang inside WebContainer.

Please install Node.js v20 LTS from https://nodejs.org and restart.`,
      buttons: ["Continue Anyway"]
    });
  } else {
    logger.info("NodeVersion", `Node.js v${version} \u2014 OK`);
  }
}
var mainWindow = null;
var runner = new LocalRunner();
var projectManager = new ProjectManager();
logger.subscribe((entry) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("logger:entry", entry);
  }
});
function createWindow() {
  logger.info("App", "Creating main window", { isDev });
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: "AutoCoder",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path5.join(__dirname, "preload.js")
    }
  });
  if (isDev) {
    const devPort = process.env.DEV_PORT || "5200";
    const devUrl = `http://localhost:${devPort}`;
    logger.info("App", `Loading dev URL: ${devUrl}`);
    const waitForServer = async (url, maxRetries = 30, interval = 1e3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          const { net } = await import("electron");
          await new Promise((resolve, reject) => {
            const request = net.request(url);
            request.on("response", () => resolve());
            request.on("error", () => reject());
            request.end();
          });
          return true;
        } catch {
          logger.info("App", `Waiting for dev server... (attempt ${i + 1}/${maxRetries})`);
          await new Promise((r) => setTimeout(r, interval));
        }
      }
      return false;
    };
    waitForServer(devUrl).then(async (ready) => {
      if (ready && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.loadURL(devUrl);
      } else {
        logger.error("App", `Dev server not available at ${devUrl} after 30 retries. Make sure to run "npm run dev" first.`);
        mainWindow?.loadURL(`data:text/html,<html><body style="font-family:sans-serif;padding:40px;background:#1a1a2e;color:#e0e0e0"><h1>Could not connect to dev server</h1><p>Make sure the web server is running first:</p><pre style="background:#16213e;padding:16px;border-radius:8px">npm run dev</pre><p>Then restart Electron:</p><pre style="background:#16213e;padding:16px;border-radius:8px">npm run electron:dev</pre><p>Tried connecting to: <strong>${devUrl}</strong></p><p>You can change the port with: <code>DEV_PORT=5200 npm run electron:dev</code></p></body></html>`);
      }
    });
    mainWindow.webContents.openDevTools();
  } else {
    const prodPath = path5.join(__dirname, "../dist/index.html");
    logger.info("App", `Loading production file: ${prodPath}`);
    mainWindow.loadFile(prodPath);
  }
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    logger.error("App", "Failed to load URL", { errorCode, errorDescription, validatedURL });
    if (isDev) {
      logger.info("App", 'Tip: Make sure the dev server is running with "npm run dev" before starting Electron');
    }
  });
  mainWindow.webContents.on("did-finish-load", () => {
    logger.info("App", "Page loaded successfully");
  });
  mainWindow.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    const levels = {
      0: "debug",
      1: "info",
      2: "warn",
      3: "error"
    };
    logger.log(levels[level] || "info", "Renderer", message, { line, sourceId });
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    logger.info("App", `Opening external URL: ${url}`);
    shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.on("closed", () => {
    logger.info("App", "Window closed");
    mainWindow = null;
    runner.cleanup();
  });
}
app3.whenReady().then(() => {
  logger.info("App", "Electron app ready", {
    version: app3.getVersion(),
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version
  });
  checkNodeVersion();
  logger.rotateLogs();
  npmCache.initialize().then((ready) => {
    if (ready) {
      const stats = npmCache.getCacheStats();
      logger.info("App", `Offline npm cache ready: ${stats.packageCount} packages, ${(stats.sizeBytes / 1024 / 1024).toFixed(0)} MB`);
    } else {
      logger.warn("App", "Offline npm cache not available \u2014 npm installs will use the network");
    }
  }).catch((err) => {
    logger.error("App", `Failed to initialize npm cache: ${err}`);
  });
  createWindow();
  app3.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      logger.info("App", "Activating - creating new window");
      createWindow();
    }
  });
});
app3.on("window-all-closed", () => {
  logger.info("App", "All windows closed");
  if (process.platform !== "darwin") {
    app3.quit();
  }
});
app3.on("before-quit", () => {
  logger.info("App", "App quitting");
  runner.cleanup();
});
process.on("uncaughtException", (error) => {
  logger.error("Process", "Uncaught exception", {
    message: error.message,
    stack: error.stack
  });
});
process.on("unhandledRejection", (reason) => {
  logger.error("Process", "Unhandled rejection", { reason: String(reason) });
});
ipcMain.handle("runner:writeFiles", async (_event, projectName, files) => {
  logger.ipc("runner:writeFiles", "in", { projectName, fileCount: files.length });
  try {
    const projectPath = await projectManager.ensureProject(projectName);
    await runner.writeFiles(projectPath, files);
    logger.info("Runner", `Wrote ${files.length} files to ${projectName}`);
    return { success: true, projectPath };
  } catch (error) {
    logger.error("Runner", "Failed to write files", { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});
ipcMain.handle("runner:npmInstall", async (_event, projectName) => {
  logger.ipc("runner:npmInstall", "in", { projectName });
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    const result = await runner.npmInstall(
      projectPath,
      (log) => {
        logger.process("npm", log);
        mainWindow?.webContents.send("runner:log", log);
      },
      (percent, message) => {
        logger.debug("npm", `Progress: ${percent}% - ${message}`);
        mainWindow?.webContents.send("runner:progress", { percent, message });
      }
    );
    logger.ipc("runner:npmInstall", "out", result);
    return result;
  } catch (error) {
    logger.error("Runner", "npm install failed", { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});
ipcMain.handle("runner:startServer", async (_event, projectName) => {
  logger.ipc("runner:startServer", "in", { projectName });
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    const result = await runner.startDevServer(projectPath, (log) => {
      logger.process("DevServer", log);
      mainWindow?.webContents.send("runner:log", log);
    });
    if (result.success) {
      logger.info("Runner", `Dev server started at ${result.url}`);
      mainWindow?.webContents.send("runner:serverReady", result.url);
    }
    logger.ipc("runner:startServer", "out", result);
    return result;
  } catch (error) {
    logger.error("Runner", "Failed to start server", { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});
ipcMain.handle("runner:stopServer", async () => {
  logger.ipc("runner:stopServer", "in");
  try {
    await runner.stopDevServer();
    logger.info("Runner", "Dev server stopped");
    return { success: true };
  } catch (error) {
    logger.error("Runner", "Failed to stop server", { error: String(error) });
    return { success: false, error: String(error) };
  }
});
ipcMain.handle("runner:getStatus", async () => {
  const status = {
    isRunning: runner.isServerRunning(),
    url: runner.getServerUrl()
  };
  logger.ipc("runner:getStatus", "out", status);
  return status;
});
ipcMain.handle("project:list", async () => {
  logger.ipc("project:list", "in");
  const projects = await projectManager.listProjects();
  logger.ipc("project:list", "out", { count: projects.length });
  return projects;
});
ipcMain.handle("project:delete", async (_event, projectName) => {
  logger.ipc("project:delete", "in", { projectName });
  try {
    await projectManager.deleteProject(projectName);
    logger.info("Project", `Deleted project: ${projectName}`);
    return { success: true };
  } catch (error) {
    logger.error("Project", "Failed to delete project", { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});
ipcMain.handle("project:open", async (_event, projectName) => {
  logger.ipc("project:open", "in", { projectName });
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    logger.info("Project", `Opening project folder: ${projectPath}`);
    shell.openPath(projectPath);
    return { success: true };
  } catch (error) {
    logger.error("Project", "Failed to open project", { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});
ipcMain.handle("isElectron", () => {
  logger.debug("App", "isElectron check: true");
  return true;
});
ipcMain.handle("npmCache:getStats", async () => {
  return npmCache.getCacheStats();
});
ipcMain.handle("npmCache:hasPackage", async (_event, packageName) => {
  return npmCache.hasPackage(packageName);
});
ipcMain.handle("npmCache:getCachePath", async () => {
  return npmCache.cachePath;
});
ipcMain.handle("npmCache:isReady", async () => {
  return npmCache.ready;
});
ipcMain.handle("logger:getLogs", async (_event, count) => {
  return logger.getRecentLogs(count);
});
ipcMain.handle("logger:getLogFile", async () => {
  return logger.getLogFilePath();
});
ipcMain.handle("logger:setLevel", async (_event, level) => {
  logger.setMinLevel(level);
  return { success: true };
});
//# sourceMappingURL=main.js.map
