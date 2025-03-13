// https://unpkg.com/browser-geo-tz@0.2.0/dist/geotz.js
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
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

  // node_modules/geobuf/encode.js
  var require_encode = __commonJS({
    "node_modules/geobuf/encode.js"(exports, module) {
      "use strict";
      module.exports = encode;
      var keys;
      var keysNum;
      var keysArr;
      var dim;
      var e;
      var maxPrecision = 1e6;
      var geometryTypes = {
        "Point": 0,
        "MultiPoint": 1,
        "LineString": 2,
        "MultiLineString": 3,
        "Polygon": 4,
        "MultiPolygon": 5,
        "GeometryCollection": 6
      };
      function encode(obj, pbf) {
        keys = {};
        keysArr = [];
        keysNum = 0;
        dim = 0;
        e = 1;
        analyze(obj);
        e = Math.min(e, maxPrecision);
        var precision = Math.ceil(Math.log(e) / Math.LN10);
        for (var i = 0; i < keysArr.length; i++) pbf.writeStringField(1, keysArr[i]);
        if (dim !== 2) pbf.writeVarintField(2, dim);
        if (precision !== 6) pbf.writeVarintField(3, precision);
        if (obj.type === "FeatureCollection") pbf.writeMessage(4, writeFeatureCollection, obj);
        else if (obj.type === "Feature") pbf.writeMessage(5, writeFeature, obj);
        else pbf.writeMessage(6, writeGeometry, obj);
        keys = null;
        return pbf.finish();
      }
      function analyze(obj) {
        var i, key;
        if (obj.type === "FeatureCollection") {
          for (i = 0; i < obj.features.length; i++) analyze(obj.features[i]);
        } else if (obj.type === "Feature") {
          if (obj.geometry !== null) analyze(obj.geometry);
          for (key in obj.properties) saveKey(key);
        } else if (obj.type === "Point") analyzePoint(obj.coordinates);
        else if (obj.type === "MultiPoint") analyzePoints(obj.coordinates);
        else if (obj.type === "GeometryCollection") {
          for (i = 0; i < obj.geometries.length; i++) analyze(obj.geometries[i]);
        } else if (obj.type === "LineString") analyzePoints(obj.coordinates);
        else if (obj.type === "Polygon" || obj.type === "MultiLineString") analyzeMultiLine(obj.coordinates);
        else if (obj.type === "MultiPolygon") {
          for (i = 0; i < obj.coordinates.length; i++) analyzeMultiLine(obj.coordinates[i]);
        }
        for (key in obj) {
          if (!isSpecialKey(key, obj.type)) saveKey(key);
        }
      }
      function analyzeMultiLine(coords) {
        for (var i = 0; i < coords.length; i++) analyzePoints(coords[i]);
      }
      function analyzePoints(coords) {
        for (var i = 0; i < coords.length; i++) analyzePoint(coords[i]);
      }
      function analyzePoint(point2) {
        dim = Math.max(dim, point2.length);
        for (var i = 0; i < point2.length; i++) {
          while (Math.round(point2[i] * e) / e !== point2[i] && e < maxPrecision) e *= 10;
        }
      }
      function saveKey(key) {
        if (keys[key] === void 0) {
          keysArr.push(key);
          keys[key] = keysNum++;
        }
      }
      function writeFeatureCollection(obj, pbf) {
        for (var i = 0; i < obj.features.length; i++) {
          pbf.writeMessage(1, writeFeature, obj.features[i]);
        }
        writeProps(obj, pbf, true);
      }
      function writeFeature(feature2, pbf) {
        if (feature2.geometry !== null) pbf.writeMessage(1, writeGeometry, feature2.geometry);
        if (feature2.id !== void 0) {
          if (typeof feature2.id === "number" && feature2.id % 1 === 0) pbf.writeSVarintField(12, feature2.id);
          else pbf.writeStringField(11, feature2.id);
        }
        if (feature2.properties) writeProps(feature2.properties, pbf);
        writeProps(feature2, pbf, true);
      }
      function writeGeometry(geom, pbf) {
        pbf.writeVarintField(1, geometryTypes[geom.type]);
        var coords = geom.coordinates;
        if (geom.type === "Point") writePoint(coords, pbf);
        else if (geom.type === "MultiPoint") writeLine(coords, pbf, true);
        else if (geom.type === "LineString") writeLine(coords, pbf);
        else if (geom.type === "MultiLineString") writeMultiLine(coords, pbf);
        else if (geom.type === "Polygon") writeMultiLine(coords, pbf, true);
        else if (geom.type === "MultiPolygon") writeMultiPolygon(coords, pbf);
        else if (geom.type === "GeometryCollection") {
          for (var i = 0; i < geom.geometries.length; i++) pbf.writeMessage(4, writeGeometry, geom.geometries[i]);
        }
        writeProps(geom, pbf, true);
      }
      function writeProps(props, pbf, isCustom) {
        var indexes = [], valueIndex = 0;
        for (var key in props) {
          if (isCustom && isSpecialKey(key, props.type)) {
            continue;
          }
          pbf.writeMessage(13, writeValue, props[key]);
          indexes.push(keys[key]);
          indexes.push(valueIndex++);
        }
        pbf.writePackedVarint(isCustom ? 15 : 14, indexes);
      }
      function writeValue(value, pbf) {
        if (value === null) return;
        var type = typeof value;
        if (type === "string") pbf.writeStringField(1, value);
        else if (type === "boolean") pbf.writeBooleanField(5, value);
        else if (type === "object") pbf.writeStringField(6, JSON.stringify(value));
        else if (type === "number") {
          if (value % 1 !== 0) pbf.writeDoubleField(2, value);
          else if (value >= 0) pbf.writeVarintField(3, value);
          else pbf.writeVarintField(4, -value);
        }
      }
      function writePoint(point2, pbf) {
        var coords = [];
        for (var i = 0; i < dim; i++) coords.push(Math.round(point2[i] * e));
        pbf.writePackedSVarint(3, coords);
      }
      function writeLine(line, pbf) {
        var coords = [];
        populateLine(coords, line);
        pbf.writePackedSVarint(3, coords);
      }
      function writeMultiLine(lines, pbf, closed) {
        var len = lines.length, i;
        if (len !== 1) {
          var lengths = [];
          for (i = 0; i < len; i++) lengths.push(lines[i].length - (closed ? 1 : 0));
          pbf.writePackedVarint(2, lengths);
        }
        var coords = [];
        for (i = 0; i < len; i++) populateLine(coords, lines[i], closed);
        pbf.writePackedSVarint(3, coords);
      }
      function writeMultiPolygon(polygons, pbf) {
        var len = polygons.length, i, j;
        if (len !== 1 || polygons[0].length !== 1) {
          var lengths = [len];
          for (i = 0; i < len; i++) {
            lengths.push(polygons[i].length);
            for (j = 0; j < polygons[i].length; j++) lengths.push(polygons[i][j].length - 1);
          }
          pbf.writePackedVarint(2, lengths);
        }
        var coords = [];
        for (i = 0; i < len; i++) {
          for (j = 0; j < polygons[i].length; j++) populateLine(coords, polygons[i][j], true);
        }
        pbf.writePackedSVarint(3, coords);
      }
      function populateLine(coords, line, closed) {
        var i, j, len = line.length - (closed ? 1 : 0), sum2 = new Array(dim);
        for (j = 0; j < dim; j++) sum2[j] = 0;
        for (i = 0; i < len; i++) {
          for (j = 0; j < dim; j++) {
            var n = Math.round(line[i][j] * e) - sum2[j];
            coords.push(n);
            sum2[j] += n;
          }
        }
      }
      function isSpecialKey(key, type) {
        if (key === "type") return true;
        else if (type === "FeatureCollection") {
          if (key === "features") return true;
        } else if (type === "Feature") {
          if (key === "id" || key === "properties" || key === "geometry") return true;
        } else if (type === "GeometryCollection") {
          if (key === "geometries") return true;
        } else if (key === "coordinates") return true;
        return false;
      }
    }
  });

  // node_modules/geobuf/decode.js
  var require_decode = __commonJS({
    "node_modules/geobuf/decode.js"(exports, module) {
      "use strict";
      module.exports = decode2;
      var keys;
      var values;
      var lengths;
      var dim;
      var e;
      var geometryTypes = [
        "Point",
        "MultiPoint",
        "LineString",
        "MultiLineString",
        "Polygon",
        "MultiPolygon",
        "GeometryCollection"
      ];
      function decode2(pbf) {
        dim = 2;
        e = Math.pow(10, 6);
        lengths = null;
        keys = [];
        values = [];
        var obj = pbf.readFields(readDataField, {});
        keys = null;
        return obj;
      }
      function readDataField(tag, obj, pbf) {
        if (tag === 1) keys.push(pbf.readString());
        else if (tag === 2) dim = pbf.readVarint();
        else if (tag === 3) e = Math.pow(10, pbf.readVarint());
        else if (tag === 4) readFeatureCollection(pbf, obj);
        else if (tag === 5) readFeature(pbf, obj);
        else if (tag === 6) readGeometry(pbf, obj);
      }
      function readFeatureCollection(pbf, obj) {
        obj.type = "FeatureCollection";
        obj.features = [];
        return pbf.readMessage(readFeatureCollectionField, obj);
      }
      function readFeature(pbf, feature2) {
        feature2.type = "Feature";
        var f = pbf.readMessage(readFeatureField, feature2);
        if (!("geometry" in f)) f.geometry = null;
        return f;
      }
      function readGeometry(pbf, geom) {
        geom.type = "Point";
        return pbf.readMessage(readGeometryField, geom);
      }
      function readFeatureCollectionField(tag, obj, pbf) {
        if (tag === 1) obj.features.push(readFeature(pbf, {}));
        else if (tag === 13) values.push(readValue(pbf));
        else if (tag === 15) readProps(pbf, obj);
      }
      function readFeatureField(tag, feature2, pbf) {
        if (tag === 1) feature2.geometry = readGeometry(pbf, {});
        else if (tag === 11) feature2.id = pbf.readString();
        else if (tag === 12) feature2.id = pbf.readSVarint();
        else if (tag === 13) values.push(readValue(pbf));
        else if (tag === 14) feature2.properties = readProps(pbf, {});
        else if (tag === 15) readProps(pbf, feature2);
      }
      function readGeometryField(tag, geom, pbf) {
        if (tag === 1) geom.type = geometryTypes[pbf.readVarint()];
        else if (tag === 2) lengths = pbf.readPackedVarint();
        else if (tag === 3) readCoords(geom, pbf, geom.type);
        else if (tag === 4) {
          geom.geometries = geom.geometries || [];
          geom.geometries.push(readGeometry(pbf, {}));
        } else if (tag === 13) values.push(readValue(pbf));
        else if (tag === 15) readProps(pbf, geom);
      }
      function readCoords(geom, pbf, type) {
        if (type === "Point") geom.coordinates = readPoint(pbf);
        else if (type === "MultiPoint") geom.coordinates = readLine(pbf, true);
        else if (type === "LineString") geom.coordinates = readLine(pbf);
        else if (type === "MultiLineString") geom.coordinates = readMultiLine(pbf);
        else if (type === "Polygon") geom.coordinates = readMultiLine(pbf, true);
        else if (type === "MultiPolygon") geom.coordinates = readMultiPolygon(pbf);
      }
      function readValue(pbf) {
        var end = pbf.readVarint() + pbf.pos, value = null;
        while (pbf.pos < end) {
          var val = pbf.readVarint(), tag = val >> 3;
          if (tag === 1) value = pbf.readString();
          else if (tag === 2) value = pbf.readDouble();
          else if (tag === 3) value = pbf.readVarint();
          else if (tag === 4) value = -pbf.readVarint();
          else if (tag === 5) value = pbf.readBoolean();
          else if (tag === 6) value = JSON.parse(pbf.readString());
        }
        return value;
      }
      function readProps(pbf, props) {
        var end = pbf.readVarint() + pbf.pos;
        while (pbf.pos < end) props[keys[pbf.readVarint()]] = values[pbf.readVarint()];
        values = [];
        return props;
      }
      function readPoint(pbf) {
        var end = pbf.readVarint() + pbf.pos, coords = [];
        while (pbf.pos < end) coords.push(pbf.readSVarint() / e);
        return coords;
      }
      function readLinePart(pbf, end, len, closed) {
        var i = 0, coords = [], p, d;
        var prevP = [];
        for (d = 0; d < dim; d++) prevP[d] = 0;
        while (len ? i < len : pbf.pos < end) {
          p = [];
          for (d = 0; d < dim; d++) {
            prevP[d] += pbf.readSVarint();
            p[d] = prevP[d] / e;
          }
          coords.push(p);
          i++;
        }
        if (closed) coords.push(coords[0]);
        return coords;
      }
      function readLine(pbf) {
        return readLinePart(pbf, pbf.readVarint() + pbf.pos);
      }
      function readMultiLine(pbf, closed) {
        var end = pbf.readVarint() + pbf.pos;
        if (!lengths) return [readLinePart(pbf, end, null, closed)];
        var coords = [];
        for (var i = 0; i < lengths.length; i++) coords.push(readLinePart(pbf, end, lengths[i], closed));
        lengths = null;
        return coords;
      }
      function readMultiPolygon(pbf) {
        var end = pbf.readVarint() + pbf.pos;
        if (!lengths) return [[readLinePart(pbf, end, null, true)]];
        var coords = [];
        var j = 1;
        for (var i = 0; i < lengths[0]; i++) {
          var rings = [];
          for (var k = 0; k < lengths[j]; k++) rings.push(readLinePart(pbf, end, lengths[j + 1 + k], true));
          j += lengths[j] + 1;
          coords.push(rings);
        }
        lengths = null;
        return coords;
      }
    }
  });

  // node_modules/geobuf/index.js
  var require_geobuf = __commonJS({
    "node_modules/geobuf/index.js"(exports) {
      "use strict";
      exports.encode = require_encode();
      exports.decode = require_decode();
    }
  });

  // node_modules/ieee754/index.js
  var require_ieee754 = __commonJS({
    "node_modules/ieee754/index.js"(exports) {
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
        }
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
        }
        buffer[offset + i - d] |= s * 128;
      };
    }
  });

  // node_modules/pbf/index.js
  var require_pbf = __commonJS({
    "node_modules/pbf/index.js"(exports, module) {
      "use strict";
      module.exports = Pbf2;
      var ieee754 = require_ieee754();
      function Pbf2(buf) {
        this.buf = ArrayBuffer.isView && ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf || 0);
        this.pos = 0;
        this.type = 0;
        this.length = this.buf.length;
      }
      Pbf2.Varint = 0;
      Pbf2.Fixed64 = 1;
      Pbf2.Bytes = 2;
      Pbf2.Fixed32 = 5;
      var SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
      var SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
      var TEXT_DECODER_MIN_LENGTH = 12;
      var utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf8");
      Pbf2.prototype = {
        destroy: function() {
          this.buf = null;
        },
        // === READING =================================================================
        readFields: function(readField, result, end) {
          end = end || this.length;
          while (this.pos < end) {
            var val = this.readVarint(), tag = val >> 3, startPos = this.pos;
            this.type = val & 7;
            readField(tag, result, this);
            if (this.pos === startPos) this.skip(val);
          }
          return result;
        },
        readMessage: function(readField, result) {
          return this.readFields(readField, result, this.readVarint() + this.pos);
        },
        readFixed32: function() {
          var val = readUInt32(this.buf, this.pos);
          this.pos += 4;
          return val;
        },
        readSFixed32: function() {
          var val = readInt32(this.buf, this.pos);
          this.pos += 4;
          return val;
        },
        // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)
        readFixed64: function() {
          var val = readUInt32(this.buf, this.pos) + readUInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
          this.pos += 8;
          return val;
        },
        readSFixed64: function() {
          var val = readUInt32(this.buf, this.pos) + readInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
          this.pos += 8;
          return val;
        },
        readFloat: function() {
          var val = ieee754.read(this.buf, this.pos, true, 23, 4);
          this.pos += 4;
          return val;
        },
        readDouble: function() {
          var val = ieee754.read(this.buf, this.pos, true, 52, 8);
          this.pos += 8;
          return val;
        },
        readVarint: function(isSigned) {
          var buf = this.buf, val, b;
          b = buf[this.pos++];
          val = b & 127;
          if (b < 128) return val;
          b = buf[this.pos++];
          val |= (b & 127) << 7;
          if (b < 128) return val;
          b = buf[this.pos++];
          val |= (b & 127) << 14;
          if (b < 128) return val;
          b = buf[this.pos++];
          val |= (b & 127) << 21;
          if (b < 128) return val;
          b = buf[this.pos];
          val |= (b & 15) << 28;
          return readVarintRemainder(val, isSigned, this);
        },
        readVarint64: function() {
          return this.readVarint(true);
        },
        readSVarint: function() {
          var num = this.readVarint();
          return num % 2 === 1 ? (num + 1) / -2 : num / 2;
        },
        readBoolean: function() {
          return Boolean(this.readVarint());
        },
        readString: function() {
          var end = this.readVarint() + this.pos;
          var pos = this.pos;
          this.pos = end;
          if (end - pos >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) {
            return readUtf8TextDecoder(this.buf, pos, end);
          }
          return readUtf8(this.buf, pos, end);
        },
        readBytes: function() {
          var end = this.readVarint() + this.pos, buffer = this.buf.subarray(this.pos, end);
          this.pos = end;
          return buffer;
        },
        // verbose for performance reasons; doesn't affect gzipped size
        readPackedVarint: function(arr, isSigned) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readVarint(isSigned));
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readVarint(isSigned));
          return arr;
        },
        readPackedSVarint: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readSVarint());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readSVarint());
          return arr;
        },
        readPackedBoolean: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readBoolean());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readBoolean());
          return arr;
        },
        readPackedFloat: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readFloat());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readFloat());
          return arr;
        },
        readPackedDouble: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readDouble());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readDouble());
          return arr;
        },
        readPackedFixed32: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readFixed32());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readFixed32());
          return arr;
        },
        readPackedSFixed32: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readSFixed32());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readSFixed32());
          return arr;
        },
        readPackedFixed64: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readFixed64());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readFixed64());
          return arr;
        },
        readPackedSFixed64: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readSFixed64());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readSFixed64());
          return arr;
        },
        skip: function(val) {
          var type = val & 7;
          if (type === Pbf2.Varint) while (this.buf[this.pos++] > 127) {
          }
          else if (type === Pbf2.Bytes) this.pos = this.readVarint() + this.pos;
          else if (type === Pbf2.Fixed32) this.pos += 4;
          else if (type === Pbf2.Fixed64) this.pos += 8;
          else throw new Error("Unimplemented type: " + type);
        },
        // === WRITING =================================================================
        writeTag: function(tag, type) {
          this.writeVarint(tag << 3 | type);
        },
        realloc: function(min) {
          var length = this.length || 16;
          while (length < this.pos + min) length *= 2;
          if (length !== this.length) {
            var buf = new Uint8Array(length);
            buf.set(this.buf);
            this.buf = buf;
            this.length = length;
          }
        },
        finish: function() {
          this.length = this.pos;
          this.pos = 0;
          return this.buf.subarray(0, this.length);
        },
        writeFixed32: function(val) {
          this.realloc(4);
          writeInt32(this.buf, val, this.pos);
          this.pos += 4;
        },
        writeSFixed32: function(val) {
          this.realloc(4);
          writeInt32(this.buf, val, this.pos);
          this.pos += 4;
        },
        writeFixed64: function(val) {
          this.realloc(8);
          writeInt32(this.buf, val & -1, this.pos);
          writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
          this.pos += 8;
        },
        writeSFixed64: function(val) {
          this.realloc(8);
          writeInt32(this.buf, val & -1, this.pos);
          writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
          this.pos += 8;
        },
        writeVarint: function(val) {
          val = +val || 0;
          if (val > 268435455 || val < 0) {
            writeBigVarint(val, this);
            return;
          }
          this.realloc(4);
          this.buf[this.pos++] = val & 127 | (val > 127 ? 128 : 0);
          if (val <= 127) return;
          this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
          if (val <= 127) return;
          this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
          if (val <= 127) return;
          this.buf[this.pos++] = val >>> 7 & 127;
        },
        writeSVarint: function(val) {
          this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
        },
        writeBoolean: function(val) {
          this.writeVarint(Boolean(val));
        },
        writeString: function(str) {
          str = String(str);
          this.realloc(str.length * 4);
          this.pos++;
          var startPos = this.pos;
          this.pos = writeUtf8(this.buf, str, this.pos);
          var len = this.pos - startPos;
          if (len >= 128) makeRoomForExtraLength(startPos, len, this);
          this.pos = startPos - 1;
          this.writeVarint(len);
          this.pos += len;
        },
        writeFloat: function(val) {
          this.realloc(4);
          ieee754.write(this.buf, val, this.pos, true, 23, 4);
          this.pos += 4;
        },
        writeDouble: function(val) {
          this.realloc(8);
          ieee754.write(this.buf, val, this.pos, true, 52, 8);
          this.pos += 8;
        },
        writeBytes: function(buffer) {
          var len = buffer.length;
          this.writeVarint(len);
          this.realloc(len);
          for (var i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
        },
        writeRawMessage: function(fn, obj) {
          this.pos++;
          var startPos = this.pos;
          fn(obj, this);
          var len = this.pos - startPos;
          if (len >= 128) makeRoomForExtraLength(startPos, len, this);
          this.pos = startPos - 1;
          this.writeVarint(len);
          this.pos += len;
        },
        writeMessage: function(tag, fn, obj) {
          this.writeTag(tag, Pbf2.Bytes);
          this.writeRawMessage(fn, obj);
        },
        writePackedVarint: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedVarint, arr);
        },
        writePackedSVarint: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedSVarint, arr);
        },
        writePackedBoolean: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedBoolean, arr);
        },
        writePackedFloat: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedFloat, arr);
        },
        writePackedDouble: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedDouble, arr);
        },
        writePackedFixed32: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedFixed32, arr);
        },
        writePackedSFixed32: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedSFixed32, arr);
        },
        writePackedFixed64: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedFixed64, arr);
        },
        writePackedSFixed64: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedSFixed64, arr);
        },
        writeBytesField: function(tag, buffer) {
          this.writeTag(tag, Pbf2.Bytes);
          this.writeBytes(buffer);
        },
        writeFixed32Field: function(tag, val) {
          this.writeTag(tag, Pbf2.Fixed32);
          this.writeFixed32(val);
        },
        writeSFixed32Field: function(tag, val) {
          this.writeTag(tag, Pbf2.Fixed32);
          this.writeSFixed32(val);
        },
        writeFixed64Field: function(tag, val) {
          this.writeTag(tag, Pbf2.Fixed64);
          this.writeFixed64(val);
        },
        writeSFixed64Field: function(tag, val) {
          this.writeTag(tag, Pbf2.Fixed64);
          this.writeSFixed64(val);
        },
        writeVarintField: function(tag, val) {
          this.writeTag(tag, Pbf2.Varint);
          this.writeVarint(val);
        },
        writeSVarintField: function(tag, val) {
          this.writeTag(tag, Pbf2.Varint);
          this.writeSVarint(val);
        },
        writeStringField: function(tag, str) {
          this.writeTag(tag, Pbf2.Bytes);
          this.writeString(str);
        },
        writeFloatField: function(tag, val) {
          this.writeTag(tag, Pbf2.Fixed32);
          this.writeFloat(val);
        },
        writeDoubleField: function(tag, val) {
          this.writeTag(tag, Pbf2.Fixed64);
          this.writeDouble(val);
        },
        writeBooleanField: function(tag, val) {
          this.writeVarintField(tag, Boolean(val));
        }
      };
      function readVarintRemainder(l, s, p) {
        var buf = p.buf, h, b;
        b = buf[p.pos++];
        h = (b & 112) >> 4;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 127) << 3;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 127) << 10;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 127) << 17;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 127) << 24;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 1) << 31;
        if (b < 128) return toNum(l, h, s);
        throw new Error("Expected varint not more than 10 bytes");
      }
      function readPackedEnd(pbf) {
        return pbf.type === Pbf2.Bytes ? pbf.readVarint() + pbf.pos : pbf.pos + 1;
      }
      function toNum(low, high, isSigned) {
        if (isSigned) {
          return high * 4294967296 + (low >>> 0);
        }
        return (high >>> 0) * 4294967296 + (low >>> 0);
      }
      function writeBigVarint(val, pbf) {
        var low, high;
        if (val >= 0) {
          low = val % 4294967296 | 0;
          high = val / 4294967296 | 0;
        } else {
          low = ~(-val % 4294967296);
          high = ~(-val / 4294967296);
          if (low ^ 4294967295) {
            low = low + 1 | 0;
          } else {
            low = 0;
            high = high + 1 | 0;
          }
        }
        if (val >= 18446744073709552e3 || val < -18446744073709552e3) {
          throw new Error("Given varint doesn't fit into 10 bytes");
        }
        pbf.realloc(10);
        writeBigVarintLow(low, high, pbf);
        writeBigVarintHigh(high, pbf);
      }
      function writeBigVarintLow(low, high, pbf) {
        pbf.buf[pbf.pos++] = low & 127 | 128;
        low >>>= 7;
        pbf.buf[pbf.pos++] = low & 127 | 128;
        low >>>= 7;
        pbf.buf[pbf.pos++] = low & 127 | 128;
        low >>>= 7;
        pbf.buf[pbf.pos++] = low & 127 | 128;
        low >>>= 7;
        pbf.buf[pbf.pos] = low & 127;
      }
      function writeBigVarintHigh(high, pbf) {
        var lsb = (high & 7) << 4;
        pbf.buf[pbf.pos++] |= lsb | ((high >>>= 3) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127;
      }
      function makeRoomForExtraLength(startPos, len, pbf) {
        var extraLen = len <= 16383 ? 1 : len <= 2097151 ? 2 : len <= 268435455 ? 3 : Math.floor(Math.log(len) / (Math.LN2 * 7));
        pbf.realloc(extraLen);
        for (var i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
      }
      function writePackedVarint(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);
      }
      function writePackedSVarint(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);
      }
      function writePackedFloat(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);
      }
      function writePackedDouble(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);
      }
      function writePackedBoolean(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);
      }
      function writePackedFixed32(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);
      }
      function writePackedSFixed32(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]);
      }
      function writePackedFixed64(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);
      }
      function writePackedSFixed64(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]);
      }
      function readUInt32(buf, pos) {
        return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16) + buf[pos + 3] * 16777216;
      }
      function writeInt32(buf, val, pos) {
        buf[pos] = val;
        buf[pos + 1] = val >>> 8;
        buf[pos + 2] = val >>> 16;
        buf[pos + 3] = val >>> 24;
      }
      function readInt32(buf, pos) {
        return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16) + (buf[pos + 3] << 24);
      }
      function readUtf8(buf, pos, end) {
        var str = "";
        var i = pos;
        while (i < end) {
          var b0 = buf[i];
          var c = null;
          var bytesPerSequence = b0 > 239 ? 4 : b0 > 223 ? 3 : b0 > 191 ? 2 : 1;
          if (i + bytesPerSequence > end) break;
          var b1, b2, b3;
          if (bytesPerSequence === 1) {
            if (b0 < 128) {
              c = b0;
            }
          } else if (bytesPerSequence === 2) {
            b1 = buf[i + 1];
            if ((b1 & 192) === 128) {
              c = (b0 & 31) << 6 | b1 & 63;
              if (c <= 127) {
                c = null;
              }
            }
          } else if (bytesPerSequence === 3) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            if ((b1 & 192) === 128 && (b2 & 192) === 128) {
              c = (b0 & 15) << 12 | (b1 & 63) << 6 | b2 & 63;
              if (c <= 2047 || c >= 55296 && c <= 57343) {
                c = null;
              }
            }
          } else if (bytesPerSequence === 4) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            b3 = buf[i + 3];
            if ((b1 & 192) === 128 && (b2 & 192) === 128 && (b3 & 192) === 128) {
              c = (b0 & 15) << 18 | (b1 & 63) << 12 | (b2 & 63) << 6 | b3 & 63;
              if (c <= 65535 || c >= 1114112) {
                c = null;
              }
            }
          }
          if (c === null) {
            c = 65533;
            bytesPerSequence = 1;
          } else if (c > 65535) {
            c -= 65536;
            str += String.fromCharCode(c >>> 10 & 1023 | 55296);
            c = 56320 | c & 1023;
          }
          str += String.fromCharCode(c);
          i += bytesPerSequence;
        }
        return str;
      }
      function readUtf8TextDecoder(buf, pos, end) {
        return utf8TextDecoder.decode(buf.subarray(pos, end));
      }
      function writeUtf8(buf, str, pos) {
        for (var i = 0, c, lead; i < str.length; i++) {
          c = str.charCodeAt(i);
          if (c > 55295 && c < 57344) {
            if (lead) {
              if (c < 56320) {
                buf[pos++] = 239;
                buf[pos++] = 191;
                buf[pos++] = 189;
                lead = c;
                continue;
              } else {
                c = lead - 55296 << 10 | c - 56320 | 65536;
                lead = null;
              }
            } else {
              if (c > 56319 || i + 1 === str.length) {
                buf[pos++] = 239;
                buf[pos++] = 191;
                buf[pos++] = 189;
              } else {
                lead = c;
              }
              continue;
            }
          } else if (lead) {
            buf[pos++] = 239;
            buf[pos++] = 191;
            buf[pos++] = 189;
            lead = null;
          }
          if (c < 128) {
            buf[pos++] = c;
          } else {
            if (c < 2048) {
              buf[pos++] = c >> 6 | 192;
            } else {
              if (c < 65536) {
                buf[pos++] = c >> 12 | 224;
              } else {
                buf[pos++] = c >> 18 | 240;
                buf[pos++] = c >> 12 & 63 | 128;
              }
              buf[pos++] = c >> 6 & 63 | 128;
            }
            buf[pos++] = c & 63 | 128;
          }
        }
        return pos;
      }
    }
  });

  // src/find.ts
  var import_geobuf = __toESM(require_geobuf());

  // node_modules/robust-predicates/esm/util.js
  var epsilon = 11102230246251565e-32;
  var splitter = 134217729;
  var resulterrbound = (3 + 8 * epsilon) * epsilon;
  function sum(elen, e, flen, f, h) {
    let Q, Qnew, hh, bvirt;
    let enow = e[0];
    let fnow = f[0];
    let eindex = 0;
    let findex = 0;
    if (fnow > enow === fnow > -enow) {
      Q = enow;
      enow = e[++eindex];
    } else {
      Q = fnow;
      fnow = f[++findex];
    }
    let hindex = 0;
    if (eindex < elen && findex < flen) {
      if (fnow > enow === fnow > -enow) {
        Qnew = enow + Q;
        hh = Q - (Qnew - enow);
        enow = e[++eindex];
      } else {
        Qnew = fnow + Q;
        hh = Q - (Qnew - fnow);
        fnow = f[++findex];
      }
      Q = Qnew;
      if (hh !== 0) {
        h[hindex++] = hh;
      }
      while (eindex < elen && findex < flen) {
        if (fnow > enow === fnow > -enow) {
          Qnew = Q + enow;
          bvirt = Qnew - Q;
          hh = Q - (Qnew - bvirt) + (enow - bvirt);
          enow = e[++eindex];
        } else {
          Qnew = Q + fnow;
          bvirt = Qnew - Q;
          hh = Q - (Qnew - bvirt) + (fnow - bvirt);
          fnow = f[++findex];
        }
        Q = Qnew;
        if (hh !== 0) {
          h[hindex++] = hh;
        }
      }
    }
    while (eindex < elen) {
      Qnew = Q + enow;
      bvirt = Qnew - Q;
      hh = Q - (Qnew - bvirt) + (enow - bvirt);
      enow = e[++eindex];
      Q = Qnew;
      if (hh !== 0) {
        h[hindex++] = hh;
      }
    }
    while (findex < flen) {
      Qnew = Q + fnow;
      bvirt = Qnew - Q;
      hh = Q - (Qnew - bvirt) + (fnow - bvirt);
      fnow = f[++findex];
      Q = Qnew;
      if (hh !== 0) {
        h[hindex++] = hh;
      }
    }
    if (Q !== 0 || hindex === 0) {
      h[hindex++] = Q;
    }
    return hindex;
  }
  function estimate(elen, e) {
    let Q = e[0];
    for (let i = 1; i < elen; i++) Q += e[i];
    return Q;
  }
  function vec(n) {
    return new Float64Array(n);
  }

  // node_modules/robust-predicates/esm/orient2d.js
  var ccwerrboundA = (3 + 16 * epsilon) * epsilon;
  var ccwerrboundB = (2 + 12 * epsilon) * epsilon;
  var ccwerrboundC = (9 + 64 * epsilon) * epsilon * epsilon;
  var B = vec(4);
  var C1 = vec(8);
  var C2 = vec(12);
  var D = vec(16);
  var u = vec(4);
  function orient2dadapt(ax, ay, bx, by, cx, cy, detsum) {
    let acxtail, acytail, bcxtail, bcytail;
    let bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u32;
    const acx = ax - cx;
    const bcx = bx - cx;
    const acy = ay - cy;
    const bcy = by - cy;
    s1 = acx * bcy;
    c = splitter * acx;
    ahi = c - (c - acx);
    alo = acx - ahi;
    c = splitter * bcy;
    bhi = c - (c - bcy);
    blo = bcy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acy * bcx;
    c = splitter * acy;
    ahi = c - (c - acy);
    alo = acy - ahi;
    c = splitter * bcx;
    bhi = c - (c - bcx);
    blo = bcx - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    B[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    B[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u32 = _j + _i;
    bvirt = u32 - _j;
    B[2] = _j - (u32 - bvirt) + (_i - bvirt);
    B[3] = u32;
    let det = estimate(4, B);
    let errbound = ccwerrboundB * detsum;
    if (det >= errbound || -det >= errbound) {
      return det;
    }
    bvirt = ax - acx;
    acxtail = ax - (acx + bvirt) + (bvirt - cx);
    bvirt = bx - bcx;
    bcxtail = bx - (bcx + bvirt) + (bvirt - cx);
    bvirt = ay - acy;
    acytail = ay - (acy + bvirt) + (bvirt - cy);
    bvirt = by - bcy;
    bcytail = by - (bcy + bvirt) + (bvirt - cy);
    if (acxtail === 0 && acytail === 0 && bcxtail === 0 && bcytail === 0) {
      return det;
    }
    errbound = ccwerrboundC * detsum + resulterrbound * Math.abs(det);
    det += acx * bcytail + bcy * acxtail - (acy * bcxtail + bcx * acytail);
    if (det >= errbound || -det >= errbound) return det;
    s1 = acxtail * bcy;
    c = splitter * acxtail;
    ahi = c - (c - acxtail);
    alo = acxtail - ahi;
    c = splitter * bcy;
    bhi = c - (c - bcy);
    blo = bcy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acytail * bcx;
    c = splitter * acytail;
    ahi = c - (c - acytail);
    alo = acytail - ahi;
    c = splitter * bcx;
    bhi = c - (c - bcx);
    blo = bcx - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    u[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u32 = _j + _i;
    bvirt = u32 - _j;
    u[2] = _j - (u32 - bvirt) + (_i - bvirt);
    u[3] = u32;
    const C1len = sum(4, B, 4, u, C1);
    s1 = acx * bcytail;
    c = splitter * acx;
    ahi = c - (c - acx);
    alo = acx - ahi;
    c = splitter * bcytail;
    bhi = c - (c - bcytail);
    blo = bcytail - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acy * bcxtail;
    c = splitter * acy;
    ahi = c - (c - acy);
    alo = acy - ahi;
    c = splitter * bcxtail;
    bhi = c - (c - bcxtail);
    blo = bcxtail - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    u[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u32 = _j + _i;
    bvirt = u32 - _j;
    u[2] = _j - (u32 - bvirt) + (_i - bvirt);
    u[3] = u32;
    const C2len = sum(C1len, C1, 4, u, C2);
    s1 = acxtail * bcytail;
    c = splitter * acxtail;
    ahi = c - (c - acxtail);
    alo = acxtail - ahi;
    c = splitter * bcytail;
    bhi = c - (c - bcytail);
    blo = bcytail - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acytail * bcxtail;
    c = splitter * acytail;
    ahi = c - (c - acytail);
    alo = acytail - ahi;
    c = splitter * bcxtail;
    bhi = c - (c - bcxtail);
    blo = bcxtail - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    u[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u32 = _j + _i;
    bvirt = u32 - _j;
    u[2] = _j - (u32 - bvirt) + (_i - bvirt);
    u[3] = u32;
    const Dlen = sum(C2len, C2, 4, u, D);
    return D[Dlen - 1];
  }
  function orient2d(ax, ay, bx, by, cx, cy) {
    const detleft = (ay - cy) * (bx - cx);
    const detright = (ax - cx) * (by - cy);
    const det = detleft - detright;
    const detsum = Math.abs(detleft + detright);
    if (Math.abs(det) >= ccwerrboundA * detsum) return det;
    return -orient2dadapt(ax, ay, bx, by, cx, cy, detsum);
  }

  // node_modules/robust-predicates/esm/orient3d.js
  var o3derrboundA = (7 + 56 * epsilon) * epsilon;
  var o3derrboundB = (3 + 28 * epsilon) * epsilon;
  var o3derrboundC = (26 + 288 * epsilon) * epsilon * epsilon;
  var bc = vec(4);
  var ca = vec(4);
  var ab = vec(4);
  var at_b = vec(4);
  var at_c = vec(4);
  var bt_c = vec(4);
  var bt_a = vec(4);
  var ct_a = vec(4);
  var ct_b = vec(4);
  var bct = vec(8);
  var cat = vec(8);
  var abt = vec(8);
  var u2 = vec(4);
  var _8 = vec(8);
  var _8b = vec(8);
  var _16 = vec(8);
  var _12 = vec(12);
  var fin = vec(192);
  var fin2 = vec(192);

  // node_modules/robust-predicates/esm/incircle.js
  var iccerrboundA = (10 + 96 * epsilon) * epsilon;
  var iccerrboundB = (4 + 48 * epsilon) * epsilon;
  var iccerrboundC = (44 + 576 * epsilon) * epsilon * epsilon;
  var bc2 = vec(4);
  var ca2 = vec(4);
  var ab2 = vec(4);
  var aa = vec(4);
  var bb = vec(4);
  var cc = vec(4);
  var u3 = vec(4);
  var v = vec(4);
  var axtbc = vec(8);
  var aytbc = vec(8);
  var bxtca = vec(8);
  var bytca = vec(8);
  var cxtab = vec(8);
  var cytab = vec(8);
  var abt2 = vec(8);
  var bct2 = vec(8);
  var cat2 = vec(8);
  var abtt = vec(4);
  var bctt = vec(4);
  var catt = vec(4);
  var _82 = vec(8);
  var _162 = vec(16);
  var _16b = vec(16);
  var _16c = vec(16);
  var _32 = vec(32);
  var _32b = vec(32);
  var _48 = vec(48);
  var _64 = vec(64);
  var fin3 = vec(1152);
  var fin22 = vec(1152);

  // node_modules/robust-predicates/esm/insphere.js
  var isperrboundA = (16 + 224 * epsilon) * epsilon;
  var isperrboundB = (5 + 72 * epsilon) * epsilon;
  var isperrboundC = (71 + 1408 * epsilon) * epsilon * epsilon;
  var ab3 = vec(4);
  var bc3 = vec(4);
  var cd = vec(4);
  var de = vec(4);
  var ea = vec(4);
  var ac = vec(4);
  var bd = vec(4);
  var ce = vec(4);
  var da = vec(4);
  var eb = vec(4);
  var abc = vec(24);
  var bcd = vec(24);
  var cde = vec(24);
  var dea = vec(24);
  var eab = vec(24);
  var abd = vec(24);
  var bce = vec(24);
  var cda = vec(24);
  var deb = vec(24);
  var eac = vec(24);
  var adet = vec(1152);
  var bdet = vec(1152);
  var cdet = vec(1152);
  var ddet = vec(1152);
  var edet = vec(1152);
  var abdet = vec(2304);
  var cddet = vec(2304);
  var cdedet = vec(3456);
  var deter = vec(5760);
  var _83 = vec(8);
  var _8b2 = vec(8);
  var _8c = vec(8);
  var _163 = vec(16);
  var _24 = vec(24);
  var _482 = vec(48);
  var _48b = vec(48);
  var _96 = vec(96);
  var _192 = vec(192);
  var _384x = vec(384);
  var _384y = vec(384);
  var _384z = vec(384);
  var _768 = vec(768);
  var xdet = vec(96);
  var ydet = vec(96);
  var zdet = vec(96);
  var fin4 = vec(1152);

  // node_modules/point-in-polygon-hao/dist/esm/index.js
  function pointInPolygon(p, polygon) {
    var i;
    var ii;
    var k = 0;
    var f;
    var u1;
    var v1;
    var u22;
    var v2;
    var currentP;
    var nextP;
    var x = p[0];
    var y = p[1];
    var numContours = polygon.length;
    for (i = 0; i < numContours; i++) {
      ii = 0;
      var contour = polygon[i];
      var contourLen = contour.length - 1;
      currentP = contour[0];
      if (currentP[0] !== contour[contourLen][0] && currentP[1] !== contour[contourLen][1]) {
        throw new Error("First and last coordinates in a ring must be the same");
      }
      u1 = currentP[0] - x;
      v1 = currentP[1] - y;
      for (ii; ii < contourLen; ii++) {
        nextP = contour[ii + 1];
        u22 = nextP[0] - x;
        v2 = nextP[1] - y;
        if (v1 === 0 && v2 === 0) {
          if (u22 <= 0 && u1 >= 0 || u1 <= 0 && u22 >= 0) {
            return 0;
          }
        } else if (v2 >= 0 && v1 < 0 || v2 < 0 && v1 >= 0) {
          f = orient2d(u1, u22, v1, v2, 0, 0);
          if (f === 0) {
            return 0;
          }
          if (f > 0 && v2 > 0 && v1 <= 0 || f < 0 && v2 <= 0 && v1 > 0) {
            k++;
          }
        }
        currentP = nextP;
        v1 = v2;
        u1 = u22;
      }
    }
    if (k % 2 === 0) {
      return false;
    }
    return true;
  }

  // node_modules/@turf/helpers/dist/esm/index.js
  var earthRadius = 63710088e-1;
  var factors = {
    centimeters: earthRadius * 100,
    centimetres: earthRadius * 100,
    degrees: 360 / (2 * Math.PI),
    feet: earthRadius * 3.28084,
    inches: earthRadius * 39.37,
    kilometers: earthRadius / 1e3,
    kilometres: earthRadius / 1e3,
    meters: earthRadius,
    metres: earthRadius,
    miles: earthRadius / 1609.344,
    millimeters: earthRadius * 1e3,
    millimetres: earthRadius * 1e3,
    nauticalmiles: earthRadius / 1852,
    radians: 1,
    yards: earthRadius * 1.0936
  };
  function feature(geom, properties, options = {}) {
    const feat = { type: "Feature" };
    if (options.id === 0 || options.id) {
      feat.id = options.id;
    }
    if (options.bbox) {
      feat.bbox = options.bbox;
    }
    feat.properties = properties || {};
    feat.geometry = geom;
    return feat;
  }
  function point(coordinates, properties, options = {}) {
    if (!coordinates) {
      throw new Error("coordinates is required");
    }
    if (!Array.isArray(coordinates)) {
      throw new Error("coordinates must be an Array");
    }
    if (coordinates.length < 2) {
      throw new Error("coordinates must be at least 2 numbers long");
    }
    if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) {
      throw new Error("coordinates must contain numbers");
    }
    const geom = {
      type: "Point",
      coordinates
    };
    return feature(geom, properties, options);
  }
  function isNumber(num) {
    return !isNaN(num) && num !== null && !Array.isArray(num);
  }

  // node_modules/@turf/invariant/dist/esm/index.js
  function getCoord(coord) {
    if (!coord) {
      throw new Error("coord is required");
    }
    if (!Array.isArray(coord)) {
      if (coord.type === "Feature" && coord.geometry !== null && coord.geometry.type === "Point") {
        return [...coord.geometry.coordinates];
      }
      if (coord.type === "Point") {
        return [...coord.coordinates];
      }
    }
    if (Array.isArray(coord) && coord.length >= 2 && !Array.isArray(coord[0]) && !Array.isArray(coord[1])) {
      return [...coord];
    }
    throw new Error("coord must be GeoJSON Point or an Array of numbers");
  }
  function getGeom(geojson) {
    if (geojson.type === "Feature") {
      return geojson.geometry;
    }
    return geojson;
  }

  // node_modules/@turf/boolean-point-in-polygon/dist/esm/index.js
  function booleanPointInPolygon(point2, polygon, options = {}) {
    if (!point2) {
      throw new Error("point is required");
    }
    if (!polygon) {
      throw new Error("polygon is required");
    }
    const pt = getCoord(point2);
    const geom = getGeom(polygon);
    const type = geom.type;
    const bbox = polygon.bbox;
    let polys = geom.coordinates;
    if (bbox && inBBox(pt, bbox) === false) {
      return false;
    }
    if (type === "Polygon") {
      polys = [polys];
    }
    let result = false;
    for (var i = 0; i < polys.length; ++i) {
      const polyResult = pointInPolygon(pt, polys[i]);
      if (polyResult === 0)
        return options.ignoreBoundary ? false : true;
      else if (polyResult)
        result = true;
    }
    return result;
  }
  function inBBox(pt, bbox) {
    return bbox[0] <= pt[0] && bbox[1] <= pt[1] && bbox[2] >= pt[0] && bbox[3] >= pt[1];
  }
  var turf_boolean_point_in_polygon_default = booleanPointInPolygon;

  // src/find.ts
  var import_pbf = __toESM(require_pbf());

  // src/oceanUtils.ts
  var oceanZones = [
    { tzid: "Etc/GMT-12", left: 172.5, right: 180 },
    { tzid: "Etc/GMT-11", left: 157.5, right: 172.5 },
    { tzid: "Etc/GMT-10", left: 142.5, right: 157.5 },
    { tzid: "Etc/GMT-9", left: 127.5, right: 142.5 },
    { tzid: "Etc/GMT-8", left: 112.5, right: 127.5 },
    { tzid: "Etc/GMT-7", left: 97.5, right: 112.5 },
    { tzid: "Etc/GMT-6", left: 82.5, right: 97.5 },
    { tzid: "Etc/GMT-5", left: 67.5, right: 82.5 },
    { tzid: "Etc/GMT-4", left: 52.5, right: 67.5 },
    { tzid: "Etc/GMT-3", left: 37.5, right: 52.5 },
    { tzid: "Etc/GMT-2", left: 22.5, right: 37.5 },
    { tzid: "Etc/GMT-1", left: 7.5, right: 22.5 },
    { tzid: "Etc/GMT", left: -7.5, right: 7.5 },
    { tzid: "Etc/GMT+1", left: -22.5, right: -7.5 },
    { tzid: "Etc/GMT+2", left: -37.5, right: -22.5 },
    { tzid: "Etc/GMT+3", left: -52.5, right: -37.5 },
    { tzid: "Etc/GMT+4", left: -67.5, right: -52.5 },
    { tzid: "Etc/GMT+5", left: -82.5, right: -67.5 },
    { tzid: "Etc/GMT+6", left: -97.5, right: -82.5 },
    { tzid: "Etc/GMT+7", left: -112.5, right: -97.5 },
    { tzid: "Etc/GMT+8", left: -127.5, right: -112.5 },
    { tzid: "Etc/GMT+9", left: -142.5, right: -127.5 },
    { tzid: "Etc/GMT+10", left: -157.5, right: -142.5 },
    { tzid: "Etc/GMT+11", left: -172.5, right: -157.5 },
    { tzid: "Etc/GMT+12", left: -180, right: -172.5 }
  ];
  function getTimezoneAtSea(lon) {
    if (lon === -180 || lon === 180) {
      return ["Etc/GMT+12", "Etc/GMT-12"];
    }
    const tzs = [];
    for (let i = 0; i < oceanZones.length; i++) {
      const z = oceanZones[i];
      if (z.left <= lon && z.right >= lon) {
        tzs.push(z.tzid);
      } else if (z.right < lon) {
        break;
      }
    }
    return tzs;
  }

  // src/find.ts
  function init(geoDataSource = "https://cdn.jsdelivr.net/npm/geo-tz@latest/data/timezones-1970.geojson.geo.dat", tzDataSource = "https://cdn.jsdelivr.net/npm/geo-tz@latest/data/timezones-1970.geojson.index.json") {
    const geoData = typeof geoDataSource === "string" ? async (start, end) => {
      const response = await fetch(geoDataSource, {
        headers: { Range: `bytes=${start}-${end}` }
      });
      return await response.arrayBuffer();
    } : geoDataSource;
    let tzDataPromise = null;
    const tzData = typeof tzDataSource === "string" ? async () => {
      if (tzDataPromise) {
        return await tzDataPromise;
      }
      const promise = fetch(tzDataSource).then(
        (response) => response.json()
      );
      tzDataPromise = promise;
      return await promise;
    } : tzDataSource;
    return {
      /**
       * Find the timezone ID(s) at the given GPS coordinates.
       *
       * @param lat latitude (must be >= -90 and <=90)
       * @param lon longitue (must be >= -180 and <=180)
       * @returns An array of string of TZIDs at the given coordinate.
       */
      find: async (lat, lon) => {
        return await findImpl(geoData, tzData, lat, lon);
      }
    };
  }
  async function find(lat, lon) {
    return await init().find(lat, lon);
  }
  async function findImpl(geoData, tzData, lat, lon) {
    const originalLon = lon;
    let err;
    if (isNaN(lat) || lat > 90 || lat < -90) {
      err = new Error("Invalid latitude: " + lat);
      throw err;
    }
    if (isNaN(lon) || lon > 180 || lon < -180) {
      err = new Error("Invalid longitude: " + lon);
      throw err;
    }
    if (lat === 90) {
      return oceanZones.map((zone) => zone.tzid);
    }
    if (lat >= 89.9999) {
      lat = 89.9999;
    } else if (lat <= -89.9999) {
      lat = -89.9999;
    }
    if (lon >= 179.9999) {
      lon = 179.9999;
    } else if (lon <= -179.9999) {
      lon = -179.9999;
    }
    const pt = point([lon, lat]);
    const quadData = {
      top: 89.9999,
      bottom: -89.9999,
      left: -179.9999,
      right: 179.9999,
      midLat: 0,
      midLon: 0
    };
    let quadPos = "";
    const tzDataResponse = await tzData();
    let curTzData = tzDataResponse.lookup;
    while (true) {
      let nextQuad;
      if (lat >= quadData.midLat && lon >= quadData.midLon) {
        nextQuad = "a";
        quadData.bottom = quadData.midLat;
        quadData.left = quadData.midLon;
      } else if (lat >= quadData.midLat && lon < quadData.midLon) {
        nextQuad = "b";
        quadData.bottom = quadData.midLat;
        quadData.right = quadData.midLon;
      } else if (lat < quadData.midLat && lon < quadData.midLon) {
        nextQuad = "c";
        quadData.top = quadData.midLat;
        quadData.right = quadData.midLon;
      } else {
        nextQuad = "d";
        quadData.top = quadData.midLat;
        quadData.left = quadData.midLon;
      }
      curTzData = curTzData[nextQuad];
      quadPos += nextQuad;
      if (!curTzData) {
        return getTimezoneAtSea(originalLon);
      } else if (curTzData.pos >= 0 && curTzData.len) {
        const bufSlice = await geoData(
          curTzData.pos,
          curTzData.pos + curTzData.len - 1
        );
        const geoJson = (0, import_geobuf.decode)(new import_pbf.default(bufSlice));
        const timezonesContainingPoint = [];
        if (geoJson.type === "FeatureCollection") {
          for (let i = 0; i < geoJson.features.length; i++) {
            if (turf_boolean_point_in_polygon_default(pt, geoJson.features[i])) {
              const properties = geoJson.features[i].properties;
              if (properties) {
                timezonesContainingPoint.push(properties.tzid);
              }
            }
          }
        } else if (geoJson.type === "Feature") {
          if (turf_boolean_point_in_polygon_default(pt, geoJson) && geoJson.properties) {
            timezonesContainingPoint.push(geoJson.properties.tzid);
          }
        }
        return timezonesContainingPoint.length > 0 ? timezonesContainingPoint : getTimezoneAtSea(originalLon);
      } else if (curTzData.length > 0) {
        const timezones = tzDataResponse.timezones;
        return curTzData.map((idx) => timezones[idx]);
      } else if (typeof curTzData !== "object") {
        err = new Error("Unexpected data type");
        throw err;
      }
      quadData.midLat = (quadData.top + quadData.bottom) / 2;
      quadData.midLon = (quadData.left + quadData.right) / 2;
    }
  }
  function toOffset(timeZone) {
    const date = /* @__PURE__ */ new Date();
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone }));
    return (tzDate.getTime() - utcDate.getTime()) / 6e4;
  }

  // index.ts
  window.GeoTZ = { find, init };
})();
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
