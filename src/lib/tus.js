!(function (e) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = e())
    : 'function' == typeof define && define.amd
    ? define([], e)
    : (('undefined' != typeof window
        ? window
        : 'undefined' != typeof global
        ? global
        : 'undefined' != typeof self
        ? self
        : this
      ).tus = e());
})(function () {
  var define, module, exports;
  return (function i(a, u, s) {
    function l(r, e) {
      if (!u[r]) {
        if (!a[r]) {
          var t = 'function' == typeof require && require;
          if (!e && t) return t(r, !0);
          if (c) return c(r, !0);
          var o = new Error("Cannot find module '" + r + "'");
          throw ((o.code = 'MODULE_NOT_FOUND'), o);
        }
        var n = (u[r] = { exports: {} });
        a[r][0].call(
          n.exports,
          function (e) {
            var t = a[r][1][e];
            return l(t || e);
          },
          n,
          n.exports,
          i,
          a,
          u,
          s,
        );
      }
      return u[r].exports;
    }
    for (
      var c = 'function' == typeof require && require, e = 0;
      e < s.length;
      e++
    )
      l(s[e]);
    return l;
  })(
    {
      1: [
        function (e, t, r) {
          'use strict';
          Object.defineProperty(r, '__esModule', { value: !0 }),
            (r.default = void 0);
          var o = u(e('./isReactNative')),
            n = u(e('./uriToBlob')),
            i = u(e('./isCordova')),
            a = u(e('./readAsByteArray'));
          function u(e) {
            return e && e.__esModule ? e : { default: e };
          }
          function s(e, t) {
            if (!(e instanceof t))
              throw new TypeError('Cannot call a class as a function');
          }
          function l(e, t) {
            for (var r = 0; r < t.length; r++) {
              var o = t[r];
              (o.enumerable = o.enumerable || !1),
                (o.configurable = !0),
                'value' in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o);
            }
          }
          function c(e, t, r) {
            return t && l(e.prototype, t), r && l(e, r), e;
          }
          var f = (function () {
              function t(e) {
                s(this, t), (this._file = e), (this.size = e.size);
              }
              return (
                c(t, [
                  {
                    key: 'slice',
                    value: function (e, t) {
                      if ((0, i.default)())
                        return (0, a.default)(this._file.slice(e, t));
                      var r = this._file.slice(e, t);
                      return Promise.resolve({ value: r });
                    },
                  },
                  { key: 'close', value: function () {} },
                ]),
                t
              );
            })(),
            p = (function () {
              function r(e, t) {
                s(this, r),
                  (this._chunkSize = t),
                  (this._buffer = void 0),
                  (this._bufferOffset = 0),
                  (this._reader = e),
                  (this._done = !1);
              }
              return (
                c(r, [
                  {
                    key: 'slice',
                    value: function (e, t) {
                      return e < this._bufferOffset
                        ? Promise.reject(
                            new Error(
                              "Requested data is before the reader's current offset",
                            ),
                          )
                        : this._readUntilEnoughDataOrDone(e, t);
                    },
                  },
                  {
                    key: '_readUntilEnoughDataOrDone',
                    value: function (r, o) {
                      var n = this,
                        e = o <= this._bufferOffset + d(this._buffer);
                      if (this._done || e) {
                        var t = this._getDataFromBuffer(r, o),
                          i = null == t && this._done;
                        return Promise.resolve({ value: t, done: i });
                      }
                      return this._reader.read().then(function (e) {
                        var t = e.value;
                        return (
                          e.done
                            ? (n._done = !0)
                            : void 0 === n._buffer
                            ? (n._buffer = t)
                            : (n._buffer = (function (e, t) {
                                if (e.concat) return e.concat(t);
                                if (e instanceof Blob)
                                  return new Blob([e, t], { type: e.type });
                                if (e.set) {
                                  var r = new e.constructor(
                                    e.length + t.length,
                                  );
                                  return r.set(e), r.set(t, e.length), r;
                                }
                                throw new Error('Unknown data type');
                              })(n._buffer, t)),
                          n._readUntilEnoughDataOrDone(r, o)
                        );
                      });
                    },
                  },
                  {
                    key: '_getDataFromBuffer',
                    value: function (e, t) {
                      e > this._bufferOffset &&
                        ((this._buffer = this._buffer.slice(
                          e - this._bufferOffset,
                        )),
                        (this._bufferOffset = e));
                      var r = 0 === d(this._buffer);
                      return this._done && r
                        ? null
                        : this._buffer.slice(0, t - e);
                    },
                  },
                  {
                    key: 'close',
                    value: function () {
                      this._reader.cancel && this._reader.cancel();
                    },
                  },
                ]),
                r
              );
            })();
          function d(e) {
            return void 0 === e ? 0 : void 0 !== e.size ? e.size : e.length;
          }
          var h = (function () {
            function e() {
              s(this, e);
            }
            return (
              c(e, [
                {
                  key: 'openFile',
                  value: function (e, t) {
                    return (0, o.default)() && e && void 0 !== e.uri
                      ? (0, n.default)(e.uri)
                          .then(function (e) {
                            return new f(e);
                          })
                          .catch(function (e) {
                            throw new Error(
                              'tus: cannot fetch `file.uri` as Blob, make sure the uri is correct and accessible. ' +
                                e,
                            );
                          })
                      : 'function' == typeof e.slice && void 0 !== e.size
                      ? Promise.resolve(new f(e))
                      : 'function' == typeof e.read
                      ? ((t = +t),
                        isFinite(t)
                          ? Promise.resolve(new p(e, t))
                          : Promise.reject(
                              new Error(
                                'cannot create source for stream without a finite value for the `chunkSize` option',
                              ),
                            ))
                      : Promise.reject(
                          new Error(
                            'source object may only be an instance of File, Blob, or Reader in this environment',
                          ),
                        );
                  },
                },
              ]),
              e
            );
          })();
          r.default = h;
        },
        {
          './isCordova': 5,
          './isReactNative': 6,
          './readAsByteArray': 7,
          './uriToBlob': 8,
        },
      ],
      2: [
        function (e, t, r) {
          'use strict';
          Object.defineProperty(r, '__esModule', { value: !0 }),
            (r.default = function (e, t) {
              if ((0, n.default)())
                return Promise.resolve(
                  (function (e, t) {
                    var r = e.exif
                      ? (function (e) {
                          var t = 0;
                          if (0 === e.length) return t;
                          for (var r = 0; r < e.length; r++) {
                            var o = e.charCodeAt(r);
                            (t = (t << 5) - t + o), (t &= t);
                          }
                          return t;
                        })(JSON.stringify(e.exif))
                      : 'noexif';
                    return [
                      'tus-rn',
                      e.name || 'noname',
                      e.size || 'nosize',
                      r,
                      t.endpoint,
                    ].join('/');
                  })(e, t),
                );
              return Promise.resolve(
                [
                  'tus-br',
                  e.name,
                  e.type,
                  e.size,
                  e.lastModified,
                  t.endpoint,
                ].join('-'),
              );
            });
          var o,
            n = (o = e('./isReactNative')) && o.__esModule ? o : { default: o };
        },
        { './isReactNative': 6 },
      ],
      3: [
        function (e, t, r) {
          'use strict';
          function o(e, t) {
            if (!(e instanceof t))
              throw new TypeError('Cannot call a class as a function');
          }
          function n(e, t) {
            for (var r = 0; r < t.length; r++) {
              var o = t[r];
              (o.enumerable = o.enumerable || !1),
                (o.configurable = !0),
                'value' in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o);
            }
          }
          function i(e, t, r) {
            return t && n(e.prototype, t), r && n(e, r), e;
          }
          Object.defineProperty(r, '__esModule', { value: !0 }),
            (r.default = void 0);
          var a = (function () {
            function e() {
              o(this, e);
            }
            return (
              i(e, [
                {
                  key: 'createRequest',
                  value: function (e, t) {
                    return new u(e, t);
                  },
                },
                {
                  key: 'getName',
                  value: function () {
                    return 'XHRHttpStack';
                  },
                },
              ]),
              e
            );
          })();
          r.default = a;
          var u = (function () {
              function r(e, t) {
                o(this, r),
                  (this._xhr = new XMLHttpRequest()),
                  this._xhr.open(e, t, !0),
                  (this._method = e),
                  (this._url = t),
                  (this._headers = {});
              }
              return (
                i(r, [
                  {
                    key: 'getMethod',
                    value: function () {
                      return this._method;
                    },
                  },
                  {
                    key: 'getURL',
                    value: function () {
                      return this._url;
                    },
                  },
                  {
                    key: 'setHeader',
                    value: function (e, t) {
                      this._xhr.setRequestHeader(e, t), (this._headers[e] = t);
                    },
                  },
                  {
                    key: 'getHeader',
                    value: function (e) {
                      return this._headers[e];
                    },
                  },
                  {
                    key: 'setProgressHandler',
                    value: function (t) {
                      'upload' in this._xhr &&
                        (this._xhr.upload.onprogress = function (e) {
                          e.lengthComputable && t(e.loaded);
                        });
                    },
                  },
                  {
                    key: 'send',
                    value: function (e) {
                      var r = this,
                        o = 0 < arguments.length && void 0 !== e ? e : null;
                      return new Promise(function (e, t) {
                        (r._xhr.onload = function () {
                          e(new s(r._xhr));
                        }),
                          (r._xhr.onerror = function (e) {
                            t(e);
                          }),
                          r._xhr.send(o);
                      });
                    },
                  },
                  {
                    key: 'abort',
                    value: function () {
                      return this._xhr.abort(), Promise.resolve();
                    },
                  },
                  {
                    key: 'getUnderlyingObject',
                    value: function () {
                      return this._xhr;
                    },
                  },
                ]),
                r
              );
            })(),
            s = (function () {
              function t(e) {
                o(this, t), (this._xhr = e);
              }
              return (
                i(t, [
                  {
                    key: 'getStatus',
                    value: function () {
                      return this._xhr.status;
                    },
                  },
                  {
                    key: 'getHeader',
                    value: function (e) {
                      return this._xhr.getResponseHeader(e);
                    },
                  },
                  {
                    key: 'getBody',
                    value: function () {
                      return this._xhr.responseText;
                    },
                  },
                  {
                    key: 'getUnderlyingObject',
                    value: function () {
                      return this._xhr;
                    },
                  },
                ]),
                t
              );
            })();
        },
        {},
      ],
      4: [
        function (e, t, r) {
          'use strict';
          Object.defineProperty(r, '__esModule', { value: !0 }),
            Object.defineProperty(r, 'enableDebugLog', {
              enumerable: !0,
              get: function () {
                return n.enableDebugLog;
              },
            }),
            Object.defineProperty(r, 'canStoreURLs', {
              enumerable: !0,
              get: function () {
                return a.canStoreURLs;
              },
            }),
            (r.isSupported = r.defaultOptions = r.Upload = void 0);
          var i = c(e('../upload')),
            o = c(e('../noopUrlStorage')),
            n = e('../logger'),
            a = e('./urlStorage'),
            u = c(e('./httpStack')),
            s = c(e('./fileReader')),
            l = c(e('./fingerprint'));
          function c(e) {
            return e && e.__esModule ? e : { default: e };
          }
          function f(e) {
            return (f =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (e) {
                    return typeof e;
                  }
                : function (e) {
                    return e &&
                      'function' == typeof Symbol &&
                      e.constructor === Symbol &&
                      e !== Symbol.prototype
                      ? 'symbol'
                      : typeof e;
                  })(e);
          }
          function p(e, t) {
            for (var r = 0; r < t.length; r++) {
              var o = t[r];
              (o.enumerable = o.enumerable || !1),
                (o.configurable = !0),
                'value' in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o);
            }
          }
          function d(e, t) {
            return (d =
              Object.setPrototypeOf ||
              function (e, t) {
                return (e.__proto__ = t), e;
              })(e, t);
          }
          function h(i) {
            return function () {
              var e,
                t,
                r,
                o,
                n = v(i);
              return (
                (t = (function () {
                  if ('undefined' == typeof Reflect || !Reflect.construct)
                    return;
                  if (Reflect.construct.sham) return;
                  if ('function' == typeof Proxy) return 1;
                  try {
                    return (
                      Date.prototype.toString.call(
                        Reflect.construct(Date, [], function () {}),
                      ),
                      1
                    );
                  } catch (e) {
                    return;
                  }
                })()
                  ? ((e = v(this).constructor),
                    Reflect.construct(n, arguments, e))
                  : n.apply(this, arguments)),
                (r = this),
                !(o = t) || ('object' !== f(o) && 'function' != typeof o)
                  ? (function (e) {
                      if (void 0 !== e) return e;
                      throw new ReferenceError(
                        "this hasn't been initialised - super() hasn't been called",
                      );
                    })(r)
                  : o
              );
            };
          }
          function v(e) {
            return (v = Object.setPrototypeOf
              ? Object.getPrototypeOf
              : function (e) {
                  return e.__proto__ || Object.getPrototypeOf(e);
                })(e);
          }
          function y(t, e) {
            var r,
              o = Object.keys(t);
            return (
              Object.getOwnPropertySymbols &&
                ((r = Object.getOwnPropertySymbols(t)),
                e &&
                  (r = r.filter(function (e) {
                    return Object.getOwnPropertyDescriptor(t, e).enumerable;
                  })),
                o.push.apply(o, r)),
              o
            );
          }
          function g(t) {
            for (var e = 1; e < arguments.length; e++) {
              var r = null != arguments[e] ? arguments[e] : {};
              e % 2
                ? y(Object(r), !0).forEach(function (e) {
                    b(t, e, r[e]);
                  })
                : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    t,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : y(Object(r)).forEach(function (e) {
                    Object.defineProperty(
                      t,
                      e,
                      Object.getOwnPropertyDescriptor(r, e),
                    );
                  });
            }
            return t;
          }
          function b(e, t, r) {
            return (
              t in e
                ? Object.defineProperty(e, t, {
                    value: r,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0,
                  })
                : (e[t] = r),
              e
            );
          }
          var _ = g({}, i.default.defaultOptions, {
            httpStack: new u.default(),
            fileReader: new s.default(),
            urlStorage: a.canStoreURLs
              ? new a.WebStorageUrlStorage()
              : new o.default(),
            fingerprint: l.default,
          });
          r.defaultOptions = _;
          var m = (function () {
            !(function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Super expression must either be null or a function',
                );
              (e.prototype = Object.create(t && t.prototype, {
                constructor: { value: e, writable: !0, configurable: !0 },
              })),
                t && d(e, t);
            })(n, i['default']);
            var e,
              t,
              r,
              o = h(n);
            function n() {
              var e =
                  0 < arguments.length && void 0 !== arguments[0]
                    ? arguments[0]
                    : null,
                t =
                  1 < arguments.length && void 0 !== arguments[1]
                    ? arguments[1]
                    : {};
              return (
                (function (e, t) {
                  if (!(e instanceof t))
                    throw new TypeError('Cannot call a class as a function');
                })(this, n),
                (t = g({}, _, {}, t)),
                o.call(this, e, t)
              );
            }
            return (
              (e = n),
              (r = [
                {
                  key: 'terminate',
                  value: function (e, t, r) {
                    return (t = g({}, _, {}, t)), i.default.terminate(e, t, r);
                  },
                },
              ]),
              (t = null) && p(e.prototype, t),
              r && p(e, r),
              n
            );
          })();
          r.Upload = m;
          var w = window,
            U = w.XMLHttpRequest,
            S = w.Blob,
            O = U && S && 'function' == typeof S.prototype.slice;
          r.isSupported = O;
        },
        {
          '../logger': 11,
          '../noopUrlStorage': 12,
          '../upload': 13,
          './fileReader': 1,
          './fingerprint': 2,
          './httpStack': 3,
          './urlStorage': 9,
        },
      ],
      5: [
        function (e, t, r) {
          'use strict';
          Object.defineProperty(r, '__esModule', { value: !0 }),
            (r.default = void 0);
          function o() {
            return (
              'undefined' != typeof window &&
              (void 0 !== window.PhoneGap ||
                void 0 !== window.Cordova ||
                void 0 !== window.cordova)
            );
          }
          r.default = o;
        },
        {},
      ],
      6: [
        function (e, t, r) {
          'use strict';
          Object.defineProperty(r, '__esModule', { value: !0 }),
            (r.default = void 0);
          function o() {
            return (
              'undefined' != typeof navigator &&
              'string' == typeof navigator.product &&
              'reactnative' === navigator.product.toLowerCase()
            );
          }
          r.default = o;
        },
        {},
      ],
      7: [
        function (e, t, r) {
          'use strict';
          Object.defineProperty(r, '__esModule', { value: !0 }),
            (r.default = function (e) {
              return new Promise(function (t, r) {
                var o = new FileReader();
                (o.onload = function () {
                  var e = new Uint8Array(o.result);
                  t({ value: e });
                }),
                  (o.onerror = function (e) {
                    r(e);
                  }),
                  o.readAsArrayBuffer(e);
              });
            });
        },
        {},
      ],
      8: [
        function (e, t, r) {
          'use strict';
          Object.defineProperty(r, '__esModule', { value: !0 }),
            (r.default = function (e) {
              return new Promise(function (t, r) {
                var o = new XMLHttpRequest();
                (o.responseType = 'blob'),
                  (o.onload = function () {
                    var e = o.response;
                    t(e);
                  }),
                  (o.onerror = function (e) {
                    r(e);
                  }),
                  o.open('GET', e),
                  o.send();
              });
            });
        },
        {},
      ],
      9: [
        function (e, t, r) {
          'use strict';
          function n(e, t) {
            for (var r = 0; r < t.length; r++) {
              var o = t[r];
              (o.enumerable = o.enumerable || !1),
                (o.configurable = !0),
                'value' in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o);
            }
          }
          Object.defineProperty(r, '__esModule', { value: !0 }),
            (r.WebStorageUrlStorage = r.canStoreURLs = void 0);
          var o = !1;
          try {
            o = 'localStorage' in window;
            var i = 'tusSupport';
            localStorage.setItem(i, localStorage.getItem(i));
          } catch (e) {
            if (e.code !== e.SECURITY_ERR && e.code !== e.QUOTA_EXCEEDED_ERR)
              throw e;
            o = !1;
          }
          r.canStoreURLs = o;
          var a = (function () {
            function e() {
              !(function (e, t) {
                if (!(e instanceof t))
                  throw new TypeError('Cannot call a class as a function');
              })(this, e);
            }
            var t, r, o;
            return (
              (t = e),
              (r = [
                {
                  key: 'findAllUploads',
                  value: function () {
                    var e = this._findEntries('tus::');
                    return Promise.resolve(e);
                  },
                },
                {
                  key: 'findUploadsByFingerprint',
                  value: function (e) {
                    var t = this._findEntries('tus::'.concat(e, '::'));
                    return Promise.resolve(t);
                  },
                },
                {
                  key: 'removeUpload',
                  value: function (e) {
                    return localStorage.removeItem(e), Promise.resolve();
                  },
                },
                {
                  key: 'addUpload',
                  value: function (e, t) {
                    var r = Math.round(1e12 * Math.random()),
                      o = 'tus::'.concat(e, '::').concat(r);
                    return (
                      localStorage.setItem(o, JSON.stringify(t)),
                      Promise.resolve(o)
                    );
                  },
                },
                {
                  key: '_findEntries',
                  value: function (e) {
                    for (var t = [], r = 0; r < localStorage.length; r++) {
                      var o = localStorage.key(r);
                      if (0 === o.indexOf(e))
                        try {
                          var n = JSON.parse(localStorage.getItem(o));
                          (n.urlStorageKey = o), t.push(n);
                        } catch (e) {}
                    }
                    return t;
                  },
                },
              ]) && n(t.prototype, r),
              o && n(t, o),
              e
            );
          })();
          r.WebStorageUrlStorage = a;
        },
        {},
      ],
      10: [
        function (e, t, r) {
          'use strict';
          function a(e) {
            return (a =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (e) {
                    return typeof e;
                  }
                : function (e) {
                    return e &&
                      'function' == typeof Symbol &&
                      e.constructor === Symbol &&
                      e !== Symbol.prototype
                      ? 'symbol'
                      : typeof e;
                  })(e);
          }
          function o(i) {
            return function () {
              var e,
                t,
                r,
                o,
                n = l(i);
              return (
                (t = u()
                  ? ((e = l(this).constructor),
                    Reflect.construct(n, arguments, e))
                  : n.apply(this, arguments)),
                (r = this),
                !(o = t) || ('object' !== a(o) && 'function' != typeof o)
                  ? (function (e) {
                      if (void 0 !== e) return e;
                      throw new ReferenceError(
                        "this hasn't been initialised - super() hasn't been called",
                      );
                    })(r)
                  : o
              );
            };
          }
          function n(e) {
            var o = 'function' == typeof Map ? new Map() : void 0;
            return (n = function (e) {
              if (
                null === e ||
                ((t = e),
                -1 === Function.toString.call(t).indexOf('[native code]'))
              )
                return e;
              var t;
              if ('function' != typeof e)
                throw new TypeError(
                  'Super expression must either be null or a function',
                );
              if (void 0 !== o) {
                if (o.has(e)) return o.get(e);
                o.set(e, r);
              }
              function r() {
                return i(e, arguments, l(this).constructor);
              }
              return (
                (r.prototype = Object.create(e.prototype, {
                  constructor: {
                    value: r,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0,
                  },
                })),
                s(r, e)
              );
            })(e);
          }
          function i(e, t, r) {
            return (i = u()
              ? Reflect.construct
              : function (e, t, r) {
                  var o = [null];
                  o.push.apply(o, t);
                  var n = new (Function.bind.apply(e, o))();
                  return r && s(n, r.prototype), n;
                }).apply(null, arguments);
          }
          function u() {
            if (
              'undefined' != typeof Reflect &&
              Reflect.construct &&
              !Reflect.construct.sham
            ) {
              if ('function' == typeof Proxy) return 1;
              try {
                return (
                  Date.prototype.toString.call(
                    Reflect.construct(Date, [], function () {}),
                  ),
                  1
                );
              } catch (e) {
                return;
              }
            }
          }
          function s(e, t) {
            return (s =
              Object.setPrototypeOf ||
              function (e, t) {
                return (e.__proto__ = t), e;
              })(e, t);
          }
          function l(e) {
            return (l = Object.setPrototypeOf
              ? Object.getPrototypeOf
              : function (e) {
                  return e.__proto__ || Object.getPrototypeOf(e);
                })(e);
          }
          Object.defineProperty(r, '__esModule', { value: !0 }),
            (r.default = void 0);
          var c = (function () {
            !(function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Super expression must either be null or a function',
                );
              (e.prototype = Object.create(t && t.prototype, {
                constructor: { value: e, writable: !0, configurable: !0 },
              })),
                t && s(e, t);
            })(f, n(Error));
            var c = o(f);
            function f(e) {
              var t,
                r,
                o,
                n,
                i,
                a,
                u =
                  1 < arguments.length && void 0 !== arguments[1]
                    ? arguments[1]
                    : null,
                s =
                  2 < arguments.length && void 0 !== arguments[2]
                    ? arguments[2]
                    : null,
                l =
                  3 < arguments.length && void 0 !== arguments[3]
                    ? arguments[3]
                    : null;
              return (
                (function (e, t) {
                  if (!(e instanceof t))
                    throw new TypeError('Cannot call a class as a function');
                })(this, f),
                ((t = c.call(this, e)).originalRequest = s),
                (t.originalResponse = l),
                null != (t.causingError = u) &&
                  (e += ', caused by '.concat(u.toString())),
                null != s &&
                  ((r = s.getHeader('X-Request-ID') || 'n/a'),
                  (o = s.getMethod()),
                  (n = s.getURL()),
                  (i = l ? l.getStatus() : 'n/a'),
                  (a = l ? l.getBody() || '' : 'n/a'),
                  (e += ', originated from request (method: '
                    .concat(o, ', url: ')
                    .concat(n, ', response code: ')
                    .concat(i, ', response text: ')
                    .concat(a, ', request id: ')
                    .concat(r, ')'))),
                (t.message = e),
                t
              );
            }
            return f;
          })();
          r.default = c;
        },
        {},
      ],
      11: [
        function (e, t, r) {
          'use strict';
          Object.defineProperty(r, '__esModule', { value: !0 }),
            (r.enableDebugLog = function () {
              o = !0;
            });
          var o = !(r.log = function (e) {
            if (!o) return;
            console.log(e);
          });
        },
        {},
      ],
      12: [
        function (e, t, r) {
          'use strict';
          function n(e, t) {
            for (var r = 0; r < t.length; r++) {
              var o = t[r];
              (o.enumerable = o.enumerable || !1),
                (o.configurable = !0),
                'value' in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o);
            }
          }
          Object.defineProperty(r, '__esModule', { value: !0 }),
            (r.default = void 0);
          var o = (function () {
            function e() {
              !(function (e, t) {
                if (!(e instanceof t))
                  throw new TypeError('Cannot call a class as a function');
              })(this, e);
            }
            var t, r, o;
            return (
              (t = e),
              (r = [
                {
                  key: 'listAllUploads',
                  value: function () {
                    return Promise.resolve([]);
                  },
                },
                {
                  key: 'findUploadsByFingerprint',
                  value: function () {
                    return Promise.resolve([]);
                  },
                },
                {
                  key: 'removeUpload',
                  value: function () {
                    return Promise.resolve();
                  },
                },
                {
                  key: 'addUpload',
                  value: function () {
                    return Promise.resolve(null);
                  },
                },
              ]) && n(t.prototype, r),
              o && n(t, o),
              e
            );
          })();
          r.default = o;
        },
        {},
      ],
      13: [
        function (e, t, r) {
          'use strict';
          Object.defineProperty(r, '__esModule', { value: !0 }),
            (r.default = void 0);
          var u = a(e('./error')),
            s = a(e('./uuid')),
            o = e('js-base64'),
            n = a(e('url-parse')),
            i = e('./logger');
          function a(e) {
            return e && e.__esModule ? e : { default: e };
          }
          function l(t, e) {
            var r,
              o = Object.keys(t);
            return (
              Object.getOwnPropertySymbols &&
                ((r = Object.getOwnPropertySymbols(t)),
                e &&
                  (r = r.filter(function (e) {
                    return Object.getOwnPropertyDescriptor(t, e).enumerable;
                  })),
                o.push.apply(o, r)),
              o
            );
          }
          function d(t) {
            for (var e = 1; e < arguments.length; e++) {
              var r = null != arguments[e] ? arguments[e] : {};
              e % 2
                ? l(Object(r), !0).forEach(function (e) {
                    c(t, e, r[e]);
                  })
                : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    t,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : l(Object(r)).forEach(function (e) {
                    Object.defineProperty(
                      t,
                      e,
                      Object.getOwnPropertyDescriptor(r, e),
                    );
                  });
            }
            return t;
          }
          function c(e, t, r) {
            return (
              t in e
                ? Object.defineProperty(e, t, {
                    value: r,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0,
                  })
                : (e[t] = r),
              e
            );
          }
          function f(e, t) {
            for (var r = 0; r < t.length; r++) {
              var o = t[r];
              (o.enumerable = o.enumerable || !1),
                (o.configurable = !0),
                'value' in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o);
            }
          }
          var p = {
              endpoint: null,
              uploadUrl: null,
              metadata: {},
              fingerprint: null,
              uploadSize: null,
              onProgress: null,
              onChunkComplete: null,
              onSuccess: null,
              onError: null,
              _onUploadUrlAvailable: null,
              overridePatchMethod: !1,
              headers: {},
              addRequestId: !1,
              onBeforeRequest: null,
              onAfterResponse: null,
              chunkSize: 1 / 0,
              retryDelays: [0, 1e3, 3e3, 5e3],
              parallelUploads: 1,
              storeFingerprintForResuming: !0,
              removeFingerprintOnSuccess: !1,
              uploadLengthDeferred: !1,
              uploadDataDuringCreation: !1,
              urlStorage: null,
              fileReader: null,
              httpStack: null,
            },
            h = (function () {
              function p(e, t) {
                !(function (e, t) {
                  if (!(e instanceof t))
                    throw new TypeError('Cannot call a class as a function');
                })(this, p),
                  'resume' in t &&
                    console.log(
                      'tus: The `resume` option has been removed in tus-js-client v2. Please use the URL storage API instead.',
                    ),
                  (this.options = t),
                  (this._urlStorage = this.options.urlStorage),
                  (this.file = e),
                  (this.url = null),
                  (this._req = null),
                  (this._fingerprint = null),
                  (this._urlStorageKey = null),
                  (this._offset = null),
                  (this._aborted = !1),
                  (this._size = null),
                  (this._source = null),
                  (this._retryAttempt = 0),
                  (this._retryTimeout = null),
                  (this._offsetBeforeRetry = 0),
                  (this._parallelUploads = null),
                  (this._parallelUploadUrls = null);
              }
              var e, t, r;
              return (
                (e = p),
                (r = [
                  {
                    key: 'terminate',
                    value: function (n, e, t) {
                      var i = 1 < arguments.length && void 0 !== e ? e : {};
                      if (
                        'function' == typeof i ||
                        'function' == typeof (2 < arguments.length ? t : void 0)
                      )
                        throw new Error(
                          'tus: the terminate function does not accept a callback since v2 anymore; please use the returned Promise instead',
                        );
                      var a = g('DELETE', n, i);
                      return a
                        .send()
                        .then(function (e) {
                          if (204 !== e.getStatus())
                            throw new u.default(
                              'tus: unexpected response while terminating upload',
                              null,
                              a,
                              e,
                            );
                        })
                        .catch(function (e) {
                          if (
                            (e instanceof u.default ||
                              (e = new u.default(
                                'tus: failed to terminate upload',
                                e,
                                a,
                                null,
                              )),
                            !b(e, 0, i))
                          )
                            throw e;
                          var t = i.retryDelays[0],
                            r = i.retryDelays.slice(1),
                            o = d({}, i, { retryDelays: r });
                          return new Promise(function (e) {
                            return setTimeout(e, t);
                          }).then(function () {
                            return p.terminate(n, o);
                          });
                        });
                    },
                  },
                ]),
                (t = [
                  {
                    key: 'findPreviousUploads',
                    value: function () {
                      var t = this;
                      return this.options
                        .fingerprint(this.file, this.options)
                        .then(function (e) {
                          return t._urlStorage.findUploadsByFingerprint(e);
                        });
                    },
                  },
                  {
                    key: 'resumeFromPreviousUpload',
                    value: function (e) {
                      (this.url = e.uploadUrl || null),
                        (this._parallelUploadUrls =
                          e.parallelUploadUrls || null),
                        (this._urlStorageKey = e.urlStorageKey);
                    },
                  },
                  {
                    key: 'start',
                    value: function () {
                      var e,
                        t = this,
                        r = this.file;
                      r
                        ? this.options.endpoint || this.options.uploadUrl
                          ? null == (e = this.options.retryDelays) ||
                            '[object Array]' ===
                              Object.prototype.toString.call(e)
                            ? (1 < this.options.parallelUploads &&
                                [
                                  'uploadUrl',
                                  'uploadSize',
                                  'uploadLengthDeferred',
                                ].forEach(function (e) {
                                  t.options[e] &&
                                    t._emitError(
                                      new Error(
                                        'tus: cannot use the '.concat(
                                          e,
                                          ' option when parallelUploads is enabled',
                                        ),
                                      ),
                                    );
                                }),
                              this.options
                                .fingerprint(r, this.options)
                                .then(function (e) {
                                  return (
                                    null == e
                                      ? (0, i.log)(
                                          'No fingerprint was calculated meaning that the upload cannot be stored in the URL storage.',
                                        )
                                      : (0, i.log)(
                                          'Calculated fingerprint: '.concat(e),
                                        ),
                                    (t._fingerprint = e),
                                    t._source
                                      ? t._source
                                      : t.options.fileReader.openFile(
                                          r,
                                          t.options.chunkSize,
                                        )
                                  );
                                })
                                .then(function (e) {
                                  (t._source = e),
                                    1 < t.options.parallelUploads ||
                                    null != t._parallelUploadUrls
                                      ? t._startParallelUpload()
                                      : t._startSingleUpload();
                                })
                                .catch(function (e) {
                                  t._emitError(e);
                                }))
                            : this._emitError(
                                new Error(
                                  'tus: the `retryDelays` option must either be an array or null',
                                ),
                              )
                          : this._emitError(
                              new Error(
                                'tus: neither an endpoint or an upload URL is provided',
                              ),
                            )
                        : this._emitError(
                            new Error(
                              'tus: no file or stream to upload provided',
                            ),
                          );
                    },
                  },
                  {
                    key: '_startParallelUpload',
                    value: function () {
                      var s = this,
                        l = (this._size = this._source.size),
                        c = 0;
                      this._parallelUploads = [];
                      var e =
                          null != this._parallelUploadUrls
                            ? this._parallelUploadUrls.length
                            : this.options.parallelUploads,
                        f = (function (e, t, r) {
                          for (
                            var o = Math.floor(e / t), n = [], i = 0;
                            i < t;
                            i++
                          )
                            n.push({ start: o * i, end: o * (i + 1) });
                          (n[t - 1].end = e),
                            r &&
                              n.forEach(function (e, t) {
                                e.uploadUrl = r[t] || null;
                              });
                          return n;
                        })(this._source.size, e, this._parallelUploadUrls);
                      this._parallelUploadUrls = new Array(f.length);
                      var r,
                        t = f.map(function (i, a) {
                          var u = 0;
                          return s._source
                            .slice(i.start, i.end)
                            .then(function (e) {
                              var n = e.value;
                              return new Promise(function (e, t) {
                                var r = d({}, s.options, {
                                    uploadUrl: i.uploadUrl || null,
                                    storeFingerprintForResuming: !1,
                                    removeFingerprintOnSuccess: !1,
                                    parallelUploads: 1,
                                    metadata: {},
                                    headers: d({}, s.options.headers, {
                                      'Upload-Concat': 'partial',
                                    }),
                                    onSuccess: e,
                                    onError: t,
                                    onProgress: function (e) {
                                      (c = c - u + e),
                                        (u = e),
                                        s._emitProgress(c, l);
                                    },
                                    _onUploadUrlAvailable: function () {
                                      (s._parallelUploadUrls[a] = o.url),
                                        s._parallelUploadUrls.filter(
                                          function (e) {
                                            return !!e;
                                          },
                                        ).length === f.length &&
                                          s._saveUploadInUrlStorage();
                                    },
                                  }),
                                  o = new p(n, r);
                                o.start(), s._parallelUploads.push(o);
                              });
                            });
                        });
                      Promise.all(t)
                        .then(function () {
                          (r = s._openRequest(
                            'POST',
                            s.options.endpoint,
                          )).setHeader(
                            'Upload-Concat',
                            'final;'.concat(s._parallelUploadUrls.join(' ')),
                          );
                          var e = v(s.options.metadata);
                          return (
                            '' !== e && r.setHeader('Upload-Metadata', e),
                            s._sendRequest(r, null)
                          );
                        })
                        .then(function (e) {
                          var t;
                          y(e.getStatus(), 200)
                            ? null != (t = e.getHeader('Location'))
                              ? ((s.url = _(s.options.endpoint, t)),
                                (0, i.log)('Created upload at '.concat(s.url)),
                                s._emitSuccess())
                              : s._emitHttpError(
                                  r,
                                  e,
                                  'tus: invalid or missing Location header',
                                )
                            : s._emitHttpError(
                                r,
                                e,
                                'tus: unexpected response while creating upload',
                              );
                        })
                        .catch(function (e) {
                          s._emitError(e);
                        });
                    },
                  },
                  {
                    key: '_startSingleUpload',
                    value: function () {
                      if (this.options.uploadLengthDeferred) this._size = null;
                      else if (null != this.options.uploadSize) {
                        if (
                          ((this._size = +this.options.uploadSize),
                          isNaN(this._size))
                        )
                          return void this._emitError(
                            new Error(
                              'tus: cannot convert `uploadSize` option into a number',
                            ),
                          );
                      } else if (
                        ((this._size = this._source.size), null == this._size)
                      )
                        return void this._emitError(
                          new Error(
                            "tus: cannot automatically derive upload's size from input and must be specified manually using the `uploadSize` option",
                          ),
                        );
                      return (
                        (this._aborted = !1),
                        null != this.url
                          ? ((0, i.log)(
                              'Resuming upload from previous URL: '.concat(
                                this.url,
                              ),
                            ),
                            void this._resumeUpload())
                          : null != this.options.uploadUrl
                          ? ((0, i.log)(
                              'Resuming upload from provided URL: '.concat(
                                this.options.url,
                              ),
                            ),
                            (this.url = this.options.uploadUrl),
                            void this._resumeUpload())
                          : ((0, i.log)('Creating a new upload'),
                            void this._createUpload())
                      );
                    },
                  },
                  {
                    key: 'abort',
                    value: function (t, e) {
                      var r = this;
                      if ('function' == typeof e)
                        throw new Error(
                          'tus: the abort function does not accept a callback since v2 anymore; please use the returned Promise instead',
                        );
                      return (
                        null != this._parallelUploads &&
                          this._parallelUploads.forEach(function (e) {
                            e.abort(t);
                          }),
                        null !== this._req &&
                          (this._req.abort(), this._source.close()),
                        (this._aborted = !0),
                        null != this._retryTimeout &&
                          (clearTimeout(this._retryTimeout),
                          (this._retryTimeout = null)),
                        t && null != this.url
                          ? p
                              .terminate(this.url, this.options)
                              .then(function () {
                                return r._removeFromUrlStorage();
                              })
                          : Promise.resolve()
                      );
                    },
                  },
                  {
                    key: '_emitHttpError',
                    value: function (e, t, r, o) {
                      this._emitError(new u.default(r, o, e, t));
                    },
                  },
                  {
                    key: '_emitError',
                    value: function (e) {
                      var t = this;
                      if (!this._aborted) {
                        if (null != this.options.retryDelays)
                          if (
                            (null != this._offset &&
                              this._offset > this._offsetBeforeRetry &&
                              (this._retryAttempt = 0),
                            b(e, this._retryAttempt, this.options))
                          ) {
                            var r =
                              this.options.retryDelays[this._retryAttempt++];
                            return (
                              (this._offsetBeforeRetry = this._offset),
                              void (this._retryTimeout = setTimeout(
                                function () {
                                  t.start();
                                },
                                r,
                              ))
                            );
                          }
                        if ('function' != typeof this.options.onError) throw e;
                        this.options.onError(e);
                      }
                    },
                  },
                  {
                    key: '_emitSuccess',
                    value: function () {
                      this.options.removeFingerprintOnSuccess &&
                        this._removeFromUrlStorage(),
                        'function' == typeof this.options.onSuccess &&
                          this.options.onSuccess();
                    },
                  },
                  {
                    key: '_emitProgress',
                    value: function (e, t) {
                      'function' == typeof this.options.onProgress &&
                        this.options.onProgress(e, t);
                    },
                  },
                  {
                    key: '_emitChunkComplete',
                    value: function (e, t, r) {
                      'function' == typeof this.options.onChunkComplete &&
                        this.options.onChunkComplete(e, t, r);
                    },
                  },
                  {
                    key: '_createUpload',
                    value: function () {
                      var r,
                        e,
                        o = this;
                      this.options.endpoint
                        ? ((r = this._openRequest(
                            'POST',
                            this.options.endpoint,
                          )),
                          this.options.uploadLengthDeferred
                            ? r.setHeader('Upload-Defer-Length', 1)
                            : r.setHeader('Upload-Length', this._size),
                          '' !== (e = v(this.options.metadata)) &&
                            r.setHeader('Upload-Metadata', e),
                          (this.options.uploadDataDuringCreation &&
                          !this.options.uploadLengthDeferred
                            ? ((this._offset = 0), this._addChunkToRequest(r))
                            : this._sendRequest(r, null)
                          )
                            .then(function (e) {
                              if (y(e.getStatus(), 200)) {
                                var t = e.getHeader('Location');
                                if (null != t) {
                                  if (
                                    ((o.url = _(o.options.endpoint, t)),
                                    (0, i.log)(
                                      'Created upload at '.concat(o.url),
                                    ),
                                    'function' ==
                                      typeof o.options._onUploadUrlAvailable &&
                                      o.options._onUploadUrlAvailable(),
                                    0 === o._size)
                                  )
                                    return (
                                      o._emitSuccess(), void o._source.close()
                                    );
                                  o._saveUploadInUrlStorage(),
                                    o.options.uploadDataDuringCreation
                                      ? o._handleUploadResponse(r, e)
                                      : ((o._offset = 0), o._performUpload());
                                } else
                                  o._emitHttpError(
                                    r,
                                    e,
                                    'tus: invalid or missing Location header',
                                  );
                              } else
                                o._emitHttpError(
                                  r,
                                  e,
                                  'tus: unexpected response while creating upload',
                                );
                            })
                            .catch(function (e) {
                              o._emitHttpError(
                                r,
                                null,
                                'tus: failed to create upload',
                                e,
                              );
                            }))
                        : this._emitError(
                            new Error(
                              'tus: unable to create upload because no endpoint is provided',
                            ),
                          );
                    },
                  },
                  {
                    key: '_resumeUpload',
                    value: function () {
                      var n = this,
                        i = this._openRequest('HEAD', this.url);
                      this._sendRequest(i, null)
                        .then(function (e) {
                          var t = e.getStatus();
                          if (!y(t, 200))
                            return (
                              y(t, 400) && n._removeFromUrlStorage(),
                              423 === t
                                ? void n._emitHttpError(
                                    i,
                                    e,
                                    'tus: upload is currently locked; retry later',
                                  )
                                : n.options.endpoint
                                ? ((n.url = null), void n._createUpload())
                                : void n._emitHttpError(
                                    i,
                                    e,
                                    'tus: unable to resume upload (new upload cannot be created without an endpoint)',
                                  )
                            );
                          var r = parseInt(e.getHeader('Upload-Offset'), 10);
                          if (isNaN(r))
                            n._emitHttpError(
                              i,
                              e,
                              'tus: invalid or missing offset value',
                            );
                          else {
                            var o = parseInt(e.getHeader('Upload-Length'), 10);
                            if (!isNaN(o) || n.options.uploadLengthDeferred) {
                              if (
                                ('function' ==
                                  typeof n.options._onUploadUrlAvailable &&
                                  n.options._onUploadUrlAvailable(),
                                r === o)
                              )
                                return (
                                  n._emitProgress(o, o), void n._emitSuccess()
                                );
                              (n._offset = r), n._performUpload();
                            } else
                              n._emitHttpError(
                                i,
                                e,
                                'tus: invalid or missing length value',
                              );
                          }
                        })
                        .catch(function (e) {
                          n._emitHttpError(
                            i,
                            null,
                            'tus: failed to resume upload',
                            e,
                          );
                        });
                    },
                  },
                  {
                    key: '_performUpload',
                    value: function () {
                      var t,
                        r = this;
                      this._aborted ||
                        (this.options.overridePatchMethod
                          ? (t = this._openRequest('POST', this.url)).setHeader(
                              'X-HTTP-Method-Override',
                              'PATCH',
                            )
                          : (t = this._openRequest('PATCH', this.url)),
                        t.setHeader('Upload-Offset', this._offset),
                        this._addChunkToRequest(t)
                          .then(function (e) {
                            y(e.getStatus(), 200)
                              ? r._handleUploadResponse(t, e)
                              : r._emitHttpError(
                                  t,
                                  e,
                                  'tus: unexpected response while uploading chunk',
                                );
                          })
                          .catch(function (e) {
                            r._aborted ||
                              r._emitHttpError(
                                t,
                                null,
                                'tus: failed to upload chunk at offset ' +
                                  r._offset,
                                e,
                              );
                          }));
                    },
                  },
                  {
                    key: '_addChunkToRequest',
                    value: function (o) {
                      var n = this,
                        t = this._offset,
                        e = this._offset + this.options.chunkSize;
                      return (
                        o.setProgressHandler(function (e) {
                          n._emitProgress(t + e, n._size);
                        }),
                        o.setHeader(
                          'Content-Type',
                          'application/offset+octet-stream',
                        ),
                        (e === 1 / 0 || e > this._size) &&
                          !this.options.uploadLengthDeferred &&
                          (e = this._size),
                        this._source.slice(t, e).then(function (e) {
                          var t = e.value,
                            r = e.done;
                          return (
                            n.options.uploadLengthDeferred &&
                              r &&
                              ((n._size =
                                n._offset + (t && t.size ? t.size : 0)),
                              o.setHeader('Upload-Length', n._size)),
                            null === t
                              ? n._sendRequest(o)
                              : (n._emitProgress(n._offset, n._size),
                                n._sendRequest(o, t))
                          );
                        })
                      );
                    },
                  },
                  {
                    key: '_handleUploadResponse',
                    value: function (e, t) {
                      var r = parseInt(t.getHeader('Upload-Offset'), 10);
                      if (isNaN(r))
                        this._emitHttpError(
                          e,
                          t,
                          'tus: invalid or missing offset value',
                        );
                      else {
                        if (
                          (this._emitProgress(r, this._size),
                          this._emitChunkComplete(
                            r - this._offset,
                            r,
                            this._size,
                          ),
                          (this._offset = r) == this._size)
                        )
                          return this._emitSuccess(), void this._source.close();
                        this._performUpload();
                      }
                    },
                  },
                  {
                    key: '_openRequest',
                    value: function (e, t) {
                      var r = g(e, t, this.options);
                      return (this._req = r);
                    },
                  },
                  {
                    key: '_removeFromUrlStorage',
                    value: function () {
                      var t = this;
                      this._urlStorageKey &&
                        (this._urlStorage
                          .removeUpload(this._urlStorageKey)
                          .catch(function (e) {
                            t._emitError(e);
                          }),
                        (this._urlStorageKey = null));
                    },
                  },
                  {
                    key: '_saveUploadInUrlStorage',
                    value: function () {
                      var e,
                        t = this;
                      this.options.storeFingerprintForResuming &&
                        this._fingerprint &&
                        ((e = {
                          size: this._size,
                          metadata: this.options.metadata,
                          creationTime: new Date().toString(),
                        }),
                        this._parallelUploads
                          ? (e.parallelUploadUrls = this._parallelUploadUrls)
                          : (e.uploadUrl = this.url),
                        this._urlStorage
                          .addUpload(this._fingerprint, e)
                          .then(function (e) {
                            return (t._urlStorageKey = e);
                          })
                          .catch(function (e) {
                            t._emitError(e);
                          }));
                    },
                  },
                  {
                    key: '_sendRequest',
                    value: function (t, e) {
                      var r = this,
                        o = 1 < arguments.length && void 0 !== e ? e : null;
                      return (
                        'function' == typeof this.options.onBeforeRequest &&
                          this.options.onBeforeRequest(t),
                        t.send(o).then(function (e) {
                          return (
                            'function' == typeof r.options.onAfterResponse &&
                              r.options.onAfterResponse(t, e),
                            e
                          );
                        })
                      );
                    },
                  },
                ]) && f(e.prototype, t),
                r && f(e, r),
                p
              );
            })();
          function v(e) {
            var t = [];
            for (var r in e) t.push(r + ' ' + o.Base64.encode(e[r]));
            return t.join(',');
          }
          function y(e, t) {
            return t <= e && e < t + 100;
          }
          function g(e, t, r) {
            var o = r.httpStack.createRequest(e, t);
            o.setHeader('Tus-Resumable', '1.0.0');
            var n,
              i = r.headers || {};
            for (var a in i) o.setHeader(a, i[a]);
            return (
              r.addRequestId &&
                ((n = (0, s.default)()), o.setHeader('X-Request-ID', n)),
              o
            );
          }
          function b(e, t, r) {
            var o,
              n = e.originalResponse ? e.originalResponse.getStatus() : 0,
              i = !y(n, 400) || 409 === n || 423 === n;
            return (
              null != r.retryDelays &&
              t < r.retryDelays.length &&
              null != e.originalRequest &&
              i &&
              ((o = !0),
              'undefined' != typeof window &&
                'navigator' in window &&
                !1 === window.navigator.onLine &&
                (o = !1),
              o)
            );
          }
          function _(e, t) {
            return new n.default(t, e).toString();
          }
          (h.defaultOptions = p), (r.default = h);
        },
        {
          './error': 10,
          './logger': 11,
          './uuid': 14,
          'js-base64': 15,
          'url-parse': 18,
        },
      ],
      14: [
        function (e, t, r) {
          'use strict';
          Object.defineProperty(r, '__esModule', { value: !0 }),
            (r.default = function () {
              return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
                /[xy]/g,
                function (e) {
                  var t = (16 * Math.random()) | 0;
                  return ('x' == e ? t : (3 & t) | 8).toString(16);
                },
              );
            });
        },
        {},
      ],
      15: [
        function (require, module, exports) {
          (function (global) {
            var Gk, Hk;
            (Gk =
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : void 0 !== global
                ? global
                : this),
              (Hk = function (global) {
                'use strict';
                var _Base64 = global.Base64,
                  version = '2.4.9',
                  buffer;
                if (void 0 !== module && module.exports)
                  try {
                    buffer = eval("require('buffer').Buffer");
                  } catch (e) {
                    buffer = void 0;
                  }
                var b64chars =
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
                  b64tab = (function (e) {
                    for (var t = {}, r = 0, o = e.length; r < o; r++)
                      t[e.charAt(r)] = r;
                    return t;
                  })(b64chars),
                  fromCharCode = String.fromCharCode,
                  cb_utob = function (e) {
                    if (e.length < 2)
                      return (t = e.charCodeAt(0)) < 128
                        ? e
                        : t < 2048
                        ? fromCharCode(192 | (t >>> 6)) +
                          fromCharCode(128 | (63 & t))
                        : fromCharCode(224 | ((t >>> 12) & 15)) +
                          fromCharCode(128 | ((t >>> 6) & 63)) +
                          fromCharCode(128 | (63 & t));
                    var t =
                      65536 +
                      1024 * (e.charCodeAt(0) - 55296) +
                      (e.charCodeAt(1) - 56320);
                    return (
                      fromCharCode(240 | ((t >>> 18) & 7)) +
                      fromCharCode(128 | ((t >>> 12) & 63)) +
                      fromCharCode(128 | ((t >>> 6) & 63)) +
                      fromCharCode(128 | (63 & t))
                    );
                  },
                  re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g,
                  utob = function (e) {
                    return e.replace(re_utob, cb_utob);
                  },
                  cb_encode = function (e) {
                    var t = [0, 2, 1][e.length % 3],
                      r =
                        (e.charCodeAt(0) << 16) |
                        ((1 < e.length ? e.charCodeAt(1) : 0) << 8) |
                        (2 < e.length ? e.charCodeAt(2) : 0);
                    return [
                      b64chars.charAt(r >>> 18),
                      b64chars.charAt((r >>> 12) & 63),
                      2 <= t ? '=' : b64chars.charAt((r >>> 6) & 63),
                      1 <= t ? '=' : b64chars.charAt(63 & r),
                    ].join('');
                  },
                  btoa = global.btoa
                    ? function (e) {
                        return global.btoa(e);
                      }
                    : function (e) {
                        return e.replace(/[\s\S]{1,3}/g, cb_encode);
                      },
                  _encode = buffer
                    ? buffer.from &&
                      Uint8Array &&
                      buffer.from !== Uint8Array.from
                      ? function (e) {
                          return (
                            e.constructor === buffer.constructor
                              ? e
                              : buffer.from(e)
                          ).toString('base64');
                        }
                      : function (e) {
                          return (
                            e.constructor === buffer.constructor
                              ? e
                              : new buffer(e)
                          ).toString('base64');
                        }
                    : function (e) {
                        return btoa(utob(e));
                      },
                  encode = function (e, t) {
                    return t
                      ? _encode(String(e))
                          .replace(/[+\/]/g, function (e) {
                            return '+' == e ? '-' : '_';
                          })
                          .replace(/=/g, '')
                      : _encode(String(e));
                  },
                  encodeURI = function (e) {
                    return encode(e, !0);
                  },
                  re_btou = new RegExp(
                    ['[À-ß][-¿]', '[à-ï][-¿]{2}', '[ð-÷][-¿]{3}'].join('|'),
                    'g',
                  ),
                  cb_btou = function (e) {
                    switch (e.length) {
                      case 4:
                        var t =
                          (((7 & e.charCodeAt(0)) << 18) |
                            ((63 & e.charCodeAt(1)) << 12) |
                            ((63 & e.charCodeAt(2)) << 6) |
                            (63 & e.charCodeAt(3))) -
                          65536;
                        return (
                          fromCharCode(55296 + (t >>> 10)) +
                          fromCharCode(56320 + (1023 & t))
                        );
                      case 3:
                        return fromCharCode(
                          ((15 & e.charCodeAt(0)) << 12) |
                            ((63 & e.charCodeAt(1)) << 6) |
                            (63 & e.charCodeAt(2)),
                        );
                      default:
                        return fromCharCode(
                          ((31 & e.charCodeAt(0)) << 6) |
                            (63 & e.charCodeAt(1)),
                        );
                    }
                  },
                  btou = function (e) {
                    return e.replace(re_btou, cb_btou);
                  },
                  cb_decode = function (e) {
                    var t = e.length,
                      r = t % 4,
                      o =
                        (0 < t ? b64tab[e.charAt(0)] << 18 : 0) |
                        (1 < t ? b64tab[e.charAt(1)] << 12 : 0) |
                        (2 < t ? b64tab[e.charAt(2)] << 6 : 0) |
                        (3 < t ? b64tab[e.charAt(3)] : 0),
                      n = [
                        fromCharCode(o >>> 16),
                        fromCharCode((o >>> 8) & 255),
                        fromCharCode(255 & o),
                      ];
                    return (n.length -= [0, 0, 2, 1][r]), n.join('');
                  },
                  atob = global.atob
                    ? function (e) {
                        return global.atob(e);
                      }
                    : function (e) {
                        return e.replace(/[\s\S]{1,4}/g, cb_decode);
                      },
                  _decode = buffer
                    ? buffer.from &&
                      Uint8Array &&
                      buffer.from !== Uint8Array.from
                      ? function (e) {
                          return (
                            e.constructor === buffer.constructor
                              ? e
                              : buffer.from(e, 'base64')
                          ).toString();
                        }
                      : function (e) {
                          return (
                            e.constructor === buffer.constructor
                              ? e
                              : new buffer(e, 'base64')
                          ).toString();
                        }
                    : function (e) {
                        return btou(atob(e));
                      },
                  decode = function (e) {
                    return _decode(
                      String(e)
                        .replace(/[-_]/g, function (e) {
                          return '-' == e ? '+' : '/';
                        })
                        .replace(/[^A-Za-z0-9\+\/]/g, ''),
                    );
                  },
                  noConflict = function () {
                    var e = global.Base64;
                    return (global.Base64 = _Base64), e;
                  },
                  noEnum;
                return (
                  (global.Base64 = {
                    VERSION: version,
                    atob: atob,
                    btoa: btoa,
                    fromBase64: decode,
                    toBase64: encode,
                    utob: utob,
                    encode: encode,
                    encodeURI: encodeURI,
                    btou: btou,
                    decode: decode,
                    noConflict: noConflict,
                    __buffer__: buffer,
                  }),
                  'function' == typeof Object.defineProperty &&
                    ((noEnum = function (e) {
                      return {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0,
                      };
                    }),
                    (global.Base64.extendString = function () {
                      Object.defineProperty(
                        String.prototype,
                        'fromBase64',
                        noEnum(function () {
                          return decode(this);
                        }),
                      ),
                        Object.defineProperty(
                          String.prototype,
                          'toBase64',
                          noEnum(function (e) {
                            return encode(this, e);
                          }),
                        ),
                        Object.defineProperty(
                          String.prototype,
                          'toBase64URI',
                          noEnum(function () {
                            return encode(this, !0);
                          }),
                        );
                    })),
                  global.Meteor && (Base64 = global.Base64),
                  void 0 !== module && module.exports
                    ? (module.exports.Base64 = global.Base64)
                    : 'function' == typeof define &&
                      define.amd &&
                      define([], function () {
                        return global.Base64;
                      }),
                  { Base64: global.Base64 }
                );
              }),
              'object' == typeof exports && void 0 !== module
                ? (module.exports = Hk(Gk))
                : 'function' == typeof define && define.amd
                ? define(Hk)
                : Hk(Gk);
          }).call(
            this,
            'undefined' != typeof global
              ? global
              : 'undefined' != typeof self
              ? self
              : 'undefined' != typeof window
              ? window
              : {},
          );
        },
        {},
      ],
      16: [
        function (e, t, r) {
          'use strict';
          var n = Object.prototype.hasOwnProperty;
          function a(e) {
            return decodeURIComponent(e.replace(/\+/g, ' '));
          }
          (r.stringify = function (e, t) {
            t = t || '';
            var r = [];
            for (var o in ('string' != typeof t && (t = '?'), e))
              n.call(e, o) &&
                r.push(encodeURIComponent(o) + '=' + encodeURIComponent(e[o]));
            return r.length ? t + r.join('&') : '';
          }),
            (r.parse = function (e) {
              for (
                var t, r = /([^=?&]+)=?([^&]*)/g, o = {};
                (t = r.exec(e));

              ) {
                var n = a(t[1]),
                  i = a(t[2]);
                n in o || (o[n] = i);
              }
              return o;
            });
        },
        {},
      ],
      17: [
        function (e, t, r) {
          'use strict';
          t.exports = function (e, t) {
            if (((t = t.split(':')[0]), !(e = +e))) return !1;
            switch (t) {
              case 'http':
              case 'ws':
                return 80 !== e;
              case 'https':
              case 'wss':
                return 443 !== e;
              case 'ftp':
                return 21 !== e;
              case 'gopher':
                return 70 !== e;
              case 'file':
                return !1;
            }
            return 0 !== e;
          };
        },
        {},
      ],
      18: [
        function (e, t, r) {
          (function (i) {
            'use strict';
            var d = e('requires-port'),
              h = e('querystringify'),
              r = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i,
              a = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//,
              v = [
                ['#', 'hash'],
                ['?', 'query'],
                function (e) {
                  return e.replace('\\', '/');
                },
                ['/', 'pathname'],
                ['@', 'auth', 1],
                [NaN, 'host', void 0, 1, 1],
                [/:(\d+)$/, 'port', void 0, 1],
                [NaN, 'hostname', void 0, 1, 1],
              ],
              u = { hash: 1, query: 1 };
            function y(e) {
              var t,
                r = (i && i.location) || {},
                o = {},
                n = typeof (e = e || r);
              if ('blob:' === e.protocol) o = new b(unescape(e.pathname), {});
              else if ('string' == n)
                for (t in ((o = new b(e, {})), u)) delete o[t];
              else if ('object' == n) {
                for (t in e) t in u || (o[t] = e[t]);
                void 0 === o.slashes && (o.slashes = a.test(e.href));
              }
              return o;
            }
            function g(e) {
              var t = r.exec(e);
              return {
                protocol: t[1] ? t[1].toLowerCase() : '',
                slashes: !!t[2],
                rest: t[3],
              };
            }
            function b(e, t, r) {
              if (!(this instanceof b)) return new b(e, t, r);
              var o,
                n,
                i,
                a,
                u,
                s,
                l = v.slice(),
                c = typeof t,
                f = this,
                p = 0;
              for (
                'object' != c && 'string' != c && ((r = t), (t = null)),
                  r && 'function' != typeof r && (r = h.parse),
                  t = y(t),
                  o = !(n = g(e || '')).protocol && !n.slashes,
                  f.slashes = n.slashes || (o && t.slashes),
                  f.protocol = n.protocol || t.protocol || '',
                  e = n.rest,
                  n.slashes || (l[3] = [/(.*)/, 'pathname']);
                p < l.length;
                p++
              )
                'function' != typeof (a = l[p])
                  ? ((i = a[0]),
                    (s = a[1]),
                    i != i
                      ? (f[s] = e)
                      : 'string' == typeof i
                      ? ~(u = e.indexOf(i)) &&
                        (e =
                          'number' == typeof a[2]
                            ? ((f[s] = e.slice(0, u)), e.slice(u + a[2]))
                            : ((f[s] = e.slice(u)), e.slice(0, u)))
                      : (u = i.exec(e)) &&
                        ((f[s] = u[1]), (e = e.slice(0, u.index))),
                    (f[s] = f[s] || (o && a[3] && t[s]) || ''),
                    a[4] && (f[s] = f[s].toLowerCase()))
                  : (e = a(e));
              r && (f.query = r(f.query)),
                o &&
                  t.slashes &&
                  '/' !== f.pathname.charAt(0) &&
                  ('' !== f.pathname || '' !== t.pathname) &&
                  (f.pathname = (function (e, t) {
                    for (
                      var r = (t || '/')
                          .split('/')
                          .slice(0, -1)
                          .concat(e.split('/')),
                        o = r.length,
                        n = r[o - 1],
                        i = !1,
                        a = 0;
                      o--;

                    )
                      '.' === r[o]
                        ? r.splice(o, 1)
                        : '..' === r[o]
                        ? (r.splice(o, 1), a++)
                        : a && (0 === o && (i = !0), r.splice(o, 1), a--);
                    return (
                      i && r.unshift(''),
                      ('.' !== n && '..' !== n) || r.push(''),
                      r.join('/')
                    );
                  })(f.pathname, t.pathname)),
                d(f.port, f.protocol) || ((f.host = f.hostname), (f.port = '')),
                (f.username = f.password = ''),
                f.auth &&
                  ((a = f.auth.split(':')),
                  (f.username = a[0] || ''),
                  (f.password = a[1] || '')),
                (f.origin =
                  f.protocol && f.host && 'file:' !== f.protocol
                    ? f.protocol + '//' + f.host
                    : 'null'),
                (f.href = f.toString());
            }
            (b.prototype = {
              set: function (e, t, r) {
                var o,
                  n = this;
                switch (e) {
                  case 'query':
                    'string' == typeof t && t.length && (t = (r || h.parse)(t)),
                      (n[e] = t);
                    break;
                  case 'port':
                    (n[e] = t),
                      d(t, n.protocol)
                        ? t && (n.host = n.hostname + ':' + t)
                        : ((n.host = n.hostname), (n[e] = ''));
                    break;
                  case 'hostname':
                    (n[e] = t), n.port && (t += ':' + n.port), (n.host = t);
                    break;
                  case 'host':
                    (n[e] = t),
                      /:\d+$/.test(t)
                        ? ((t = t.split(':')),
                          (n.port = t.pop()),
                          (n.hostname = t.join(':')))
                        : ((n.hostname = t), (n.port = ''));
                    break;
                  case 'protocol':
                    (n.protocol = t.toLowerCase()), (n.slashes = !r);
                    break;
                  case 'pathname':
                  case 'hash':
                    t
                      ? ((o = 'pathname' === e ? '/' : '#'),
                        (n[e] = t.charAt(0) !== o ? o + t : t))
                      : (n[e] = t);
                    break;
                  default:
                    n[e] = t;
                }
                for (var i = 0; i < v.length; i++) {
                  var a = v[i];
                  a[4] && (n[a[1]] = n[a[1]].toLowerCase());
                }
                return (
                  (n.origin =
                    n.protocol && n.host && 'file:' !== n.protocol
                      ? n.protocol + '//' + n.host
                      : 'null'),
                  (n.href = n.toString()),
                  n
                );
              },
              toString: function (e) {
                (e && 'function' == typeof e) || (e = h.stringify);
                var t,
                  r = this,
                  o = r.protocol;
                o && ':' !== o.charAt(o.length - 1) && (o += ':');
                var n = o + (r.slashes ? '//' : '');
                return (
                  r.username &&
                    ((n += r.username),
                    r.password && (n += ':' + r.password),
                    (n += '@')),
                  (n += r.host + r.pathname),
                  (t = 'object' == typeof r.query ? e(r.query) : r.query) &&
                    (n += '?' !== t.charAt(0) ? '?' + t : t),
                  r.hash && (n += r.hash),
                  n
                );
              },
            }),
              (b.extractProtocol = g),
              (b.location = y),
              (b.qs = h),
              (t.exports = b);
          }).call(
            this,
            'undefined' != typeof global
              ? global
              : 'undefined' != typeof self
              ? self
              : 'undefined' != typeof window
              ? window
              : {},
          );
        },
        { querystringify: 16, 'requires-port': 17 },
      ],
    },
    {},
    [4],
  )(4);
});
export default tus;
