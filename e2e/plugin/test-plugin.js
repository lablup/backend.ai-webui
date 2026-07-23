var _a, _b, _c, _d, _e, _f;
function t(t, e, i, s) {
  var n,
    o = arguments.length,
    r =
      o < 3 ? e : null === s ? (s = Object.getOwnPropertyDescriptor(e, i)) : s;
  if ('object' == typeof Reflect && 'function' == typeof Reflect.decorate)
    r = Reflect.decorate(t, e, i, s);
  else
    for (var l = t.length - 1; l >= 0; l--)
      (n = t[l]) && (r = (o < 3 ? n(r) : o > 3 ? n(e, i, r) : n(e, i)) || r);
  return (o > 3 && r && Object.defineProperty(e, i, r), r);
}
'function' == typeof SuppressedError && SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e = globalThis,
  i =
    e.ShadowRoot &&
    (void 0 === e.ShadyCSS || e.ShadyCSS.nativeShadow) &&
    'adoptedStyleSheets' in Document.prototype &&
    'replace' in CSSStyleSheet.prototype,
  s = Symbol(),
  n = new WeakMap();
let o = class {
  constructor(t, e, i) {
    if (((this._$cssResult$ = !0), i !== s))
      throw Error(
        'CSSResult is not constructable. Use `unsafeCSS` or `css` instead.',
      );
    ((this.cssText = t), (this.t = e));
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (i && void 0 === t) {
      const i = void 0 !== e && 1 === e.length;
      (i && (t = n.get(e)),
        void 0 === t &&
          ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText),
          i && n.set(e, t)));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const r = i
    ? (t) => t
    : (t) =>
        t instanceof CSSStyleSheet
          ? ((t) => {
              let e = '';
              for (const i of t.cssRules) e += i.cssText;
              return ((t) =>
                new o('string' == typeof t ? t : t + '', void 0, s))(e);
            })(t)
          : t,
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */ {
    is: l,
    defineProperty: h,
    getOwnPropertyDescriptor: a,
    getOwnPropertyNames: c,
    getOwnPropertySymbols: d,
    getPrototypeOf: p,
  } = Object,
  u = globalThis,
  $ = u.trustedTypes,
  _ = $ ? $.emptyScript : '',
  A = u.reactiveElementPolyfillSupport,
  v = (t, e) => t,
  g = {
    toAttribute(t, e) {
      switch (e) {
        case Boolean:
          t = t ? _ : null;
          break;
        case Object:
        case Array:
          t = null == t ? t : JSON.stringify(t);
      }
      return t;
    },
    fromAttribute(t, e) {
      let i = t;
      switch (e) {
        case Boolean:
          i = null !== t;
          break;
        case Number:
          i = null === t ? null : Number(t);
          break;
        case Object:
        case Array:
          try {
            i = JSON.parse(t);
          } catch (t) {
            i = null;
          }
      }
      return i;
    },
  },
  f = (t, e) => !l(t, e),
  m = { attribute: !0, type: String, converter: g, reflect: !1, hasChanged: f };
((_a = Symbol.metadata) !== null && _a !== void 0
  ? _a
  : (Symbol.metadata = Symbol('metadata')),
  (_b = u.litPropertyMetadata) !== null && _b !== void 0
    ? _b
    : (u.litPropertyMetadata = new WeakMap()));
class y extends HTMLElement {
  static addInitializer(t) {
    var _a;
    (this._$Ei(),
      ((_a = this.l) !== null && _a !== void 0 ? _a : (this.l = [])).push(t));
  }
  static get observedAttributes() {
    return (this.finalize(), this._$Eh && [...this._$Eh.keys()]);
  }
  static createProperty(t, e = m) {
    if (
      (e.state && (e.attribute = !1),
      this._$Ei(),
      this.elementProperties.set(t, e),
      !e.noAccessor)
    ) {
      const i = Symbol(),
        s = this.getPropertyDescriptor(t, i, e);
      void 0 !== s && h(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    var _a;
    const { get: s, set: n } =
      (_a = a(this.prototype, t)) !== null && _a !== void 0
        ? _a
        : {
            get() {
              return this[e];
            },
            set(t) {
              this[e] = t;
            },
          };
    return {
      get() {
        return s === null || s === void 0 ? void 0 : s.call(this);
      },
      set(e) {
        const o = s === null || s === void 0 ? void 0 : s.call(this);
        (n.call(this, e), this.requestUpdate(t, o, i));
      },
      configurable: !0,
      enumerable: !0,
    };
  }
  static getPropertyOptions(t) {
    var _a;
    return (_a = this.elementProperties.get(t)) !== null && _a !== void 0
      ? _a
      : m;
  }
  static _$Ei() {
    if (this.hasOwnProperty(v('elementProperties'))) return;
    const t = p(this);
    (t.finalize(),
      void 0 !== t.l && (this.l = [...t.l]),
      (this.elementProperties = new Map(t.elementProperties)));
  }
  static finalize() {
    if (this.hasOwnProperty(v('finalized'))) return;
    if (
      ((this.finalized = !0), this._$Ei(), this.hasOwnProperty(v('properties')))
    ) {
      const t = this.properties,
        e = [...c(t), ...d(t)];
      for (const i of e) this.createProperty(i, t[i]);
    }
    const t = this[Symbol.metadata];
    if (null !== t) {
      const e = litPropertyMetadata.get(t);
      if (void 0 !== e)
        for (const [t, i] of e) this.elementProperties.set(t, i);
    }
    this._$Eh = new Map();
    for (const [t, e] of this.elementProperties) {
      const i = this._$Eu(t, e);
      void 0 !== i && this._$Eh.set(i, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const t of i) e.unshift(r(t));
    } else void 0 !== t && e.push(r(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return !1 === i
      ? void 0
      : 'string' == typeof i
        ? i
        : 'string' == typeof t
          ? t.toLowerCase()
          : void 0;
  }
  constructor() {
    (super(),
      (this._$Ep = void 0),
      (this.isUpdatePending = !1),
      (this.hasUpdated = !1),
      (this._$Em = null),
      this._$Ev());
  }
  _$Ev() {
    var _a;
    ((this._$ES = new Promise((t) => (this.enableUpdating = t))),
      (this._$AL = new Map()),
      this._$E_(),
      this.requestUpdate(),
      (_a = this.constructor.l) === null || _a === void 0
        ? void 0
        : _a.forEach((t) => t(this)));
  }
  addController(t) {
    var _a, _b;
    (((_a = this._$EO) !== null && _a !== void 0
      ? _a
      : (this._$EO = new Set())
    ).add(t),
      void 0 !== this.renderRoot &&
        this.isConnected &&
        ((_b = t.hostConnected) === null || _b === void 0
          ? void 0
          : _b.call(t)));
  }
  removeController(t) {
    var _a;
    (_a = this._$EO) === null || _a === void 0 ? void 0 : _a.delete(t);
  }
  _$E_() {
    const t = new Map(),
      e = this.constructor.elementProperties;
    for (const i of e.keys())
      this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    var _a;
    const t =
      (_a = this.shadowRoot) !== null && _a !== void 0
        ? _a
        : this.attachShadow(this.constructor.shadowRootOptions);
    return (
      ((t, s) => {
        if (i)
          t.adoptedStyleSheets = s.map((t) =>
            t instanceof CSSStyleSheet ? t : t.styleSheet,
          );
        else
          for (const i of s) {
            const s = document.createElement('style'),
              n = e.litNonce;
            (void 0 !== n && s.setAttribute('nonce', n),
              (s.textContent = i.cssText),
              t.appendChild(s));
          }
      })(t, this.constructor.elementStyles),
      t
    );
  }
  connectedCallback() {
    var _a, _b;
    ((_a = this.renderRoot) !== null && _a !== void 0
      ? _a
      : (this.renderRoot = this.createRenderRoot()),
      this.enableUpdating(!0),
      (_b = this._$EO) === null || _b === void 0
        ? void 0
        : _b.forEach((t) => {
            var _a;
            return (_a = t.hostConnected) === null || _a === void 0
              ? void 0
              : _a.call(t);
          }));
  }
  enableUpdating(t) {}
  disconnectedCallback() {
    var _a;
    (_a = this._$EO) === null || _a === void 0
      ? void 0
      : _a.forEach((t) => {
          var _a;
          return (_a = t.hostDisconnected) === null || _a === void 0
            ? void 0
            : _a.call(t);
        });
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$EC(t, e) {
    var _a;
    const i = this.constructor.elementProperties.get(t),
      s = this.constructor._$Eu(t, i);
    if (void 0 !== s && !0 === i.reflect) {
      const n = (
        void 0 !==
        ((_a = i.converter) === null || _a === void 0 ? void 0 : _a.toAttribute)
          ? i.converter
          : g
      ).toAttribute(e, i.type);
      ((this._$Em = t),
        null == n ? this.removeAttribute(s) : this.setAttribute(s, n),
        (this._$Em = null));
    }
  }
  _$AK(t, e) {
    var _a;
    const i = this.constructor,
      s = i._$Eh.get(t);
    if (void 0 !== s && this._$Em !== s) {
      const t = i.getPropertyOptions(s),
        n =
          'function' == typeof t.converter
            ? { fromAttribute: t.converter }
            : void 0 !==
                ((_a = t.converter) === null || _a === void 0
                  ? void 0
                  : _a.fromAttribute)
              ? t.converter
              : g;
      ((this._$Em = s),
        (this[s] = n.fromAttribute(e, t.type)),
        (this._$Em = null));
    }
  }
  requestUpdate(t, e, i) {
    var _a;
    if (void 0 !== t) {
      if (
        (i !== null && i !== void 0
          ? i
          : (i = this.constructor.getPropertyOptions(t)),
        !((_a = i.hasChanged) !== null && _a !== void 0 ? _a : f)(this[t], e))
      )
        return;
      this.P(t, e, i);
    }
    !1 === this.isUpdatePending && (this._$ES = this._$ET());
  }
  P(t, e, i) {
    var _a;
    (this._$AL.has(t) || this._$AL.set(t, e),
      !0 === i.reflect &&
        this._$Em !== t &&
        ((_a = this._$Ej) !== null && _a !== void 0
          ? _a
          : (this._$Ej = new Set())
        ).add(t));
  }
  async _$ET() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const t = this.scheduleUpdate();
    return (null != t && (await t), !this.isUpdatePending);
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var _a, _b;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (
        ((_a = this.renderRoot) !== null && _a !== void 0
          ? _a
          : (this.renderRoot = this.createRenderRoot()),
        this._$Ep)
      ) {
        for (const [t, e] of this._$Ep) this[t] = e;
        this._$Ep = void 0;
      }
      const t = this.constructor.elementProperties;
      if (t.size > 0)
        for (const [e, i] of t)
          !0 !== i.wrapped ||
            this._$AL.has(e) ||
            void 0 === this[e] ||
            this.P(e, this[e], i);
    }
    let t = !1;
    const e = this._$AL;
    try {
      ((t = this.shouldUpdate(e)),
        t
          ? (this.willUpdate(e),
            (_b = this._$EO) === null || _b === void 0
              ? void 0
              : _b.forEach((t) => {
                  var _a;
                  return (_a = t.hostUpdate) === null || _a === void 0
                    ? void 0
                    : _a.call(t);
                }),
            this.update(e))
          : this._$EU());
    } catch (e) {
      throw ((t = !1), this._$EU(), e);
    }
    t && this._$AE(e);
  }
  willUpdate(t) {}
  _$AE(t) {
    var _a;
    ((_a = this._$EO) === null || _a === void 0
      ? void 0
      : _a.forEach((t) => {
          var _a;
          return (_a = t.hostUpdated) === null || _a === void 0
            ? void 0
            : _a.call(t);
        }),
      this.hasUpdated || ((this.hasUpdated = !0), this.firstUpdated(t)),
      this.updated(t));
  }
  _$EU() {
    ((this._$AL = new Map()), (this.isUpdatePending = !1));
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    (this._$Ej && (this._$Ej = this._$Ej.forEach((t) => this._$EC(t, this[t]))),
      this._$EU());
  }
  updated(t) {}
  firstUpdated(t) {}
}
((y.elementStyles = []),
  (y.shadowRootOptions = { mode: 'open' }),
  (y[v('elementProperties')] = new Map()),
  (y[v('finalized')] = new Map()),
  A === null || A === void 0 ? void 0 : A({ ReactiveElement: y }),
  ((_c = u.reactiveElementVersions) !== null && _c !== void 0
    ? _c
    : (u.reactiveElementVersions = [])
  ).push('2.0.4'));
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const b = globalThis,
  S = b.trustedTypes,
  E = S ? S.createPolicy('lit-html', { createHTML: (t) => t }) : void 0,
  C = '$lit$',
  w = `lit$${(Math.random() + '').slice(9)}$`,
  x = '?' + w,
  H = `<${x}>`,
  M = document,
  T = () => M.createComment(''),
  P = (t) => null === t || ('object' != typeof t && 'function' != typeof t),
  N = Array.isArray,
  k = '[ \t\n\f\r]',
  U = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
  O = /-->/g,
  R = />/g,
  j = RegExp(
    `>|${k}(?:([^\\s"'>=/]+)(${k}*=${k}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,
    'g',
  ),
  L = /'/g,
  D = /"/g,
  I = /^(?:script|style|textarea|title)$/i,
  B = (
    (t) =>
    (e, ...i) => ({ _$litType$: t, strings: e, values: i })
  )(1),
  z = Symbol.for('lit-noChange'),
  V = Symbol.for('lit-nothing'),
  W = new WeakMap(),
  q = M.createTreeWalker(M, 129);
function Z(t, e) {
  if (!Array.isArray(t) || !t.hasOwnProperty('raw'))
    throw Error('invalid template strings array');
  return void 0 !== E ? E.createHTML(e) : e;
}
let J = class t {
  constructor({ strings: e, _$litType$: i }, s) {
    let n;
    this.parts = [];
    let o = 0,
      r = 0;
    const l = e.length - 1,
      h = this.parts,
      [a, c] = ((t, e) => {
        const i = t.length - 1,
          s = [];
        let n,
          o = 2 === e ? '<svg>' : '',
          r = U;
        for (let e = 0; e < i; e++) {
          const i = t[e];
          let l,
            h,
            a = -1,
            c = 0;
          for (
            ;
            c < i.length && ((r.lastIndex = c), (h = r.exec(i)), null !== h);
          )
            ((c = r.lastIndex),
              r === U
                ? '!--' === h[1]
                  ? (r = O)
                  : void 0 !== h[1]
                    ? (r = R)
                    : void 0 !== h[2]
                      ? (I.test(h[2]) && (n = RegExp('</' + h[2], 'g')),
                        (r = j))
                      : void 0 !== h[3] && (r = j)
                : r === j
                  ? '>' === h[0]
                    ? ((r = n !== null && n !== void 0 ? n : U), (a = -1))
                    : void 0 === h[1]
                      ? (a = -2)
                      : ((a = r.lastIndex - h[2].length),
                        (l = h[1]),
                        (r = void 0 === h[3] ? j : '"' === h[3] ? D : L))
                  : r === D || r === L
                    ? (r = j)
                    : r === O || r === R
                      ? (r = U)
                      : ((r = j), (n = void 0)));
          const d = r === j && t[e + 1].startsWith('/>') ? ' ' : '';
          o +=
            r === U
              ? i + H
              : a >= 0
                ? (s.push(l), i.slice(0, a) + C + i.slice(a) + w + d)
                : i + w + (-2 === a ? e : d);
        }
        return [Z(t, o + (t[i] || '<?>') + (2 === e ? '</svg>' : '')), s];
      })(e, i);
    if (
      ((this.el = t.createElement(a, s)),
      (q.currentNode = this.el.content),
      2 === i)
    ) {
      const t = this.el.content.firstChild;
      t.replaceWith(...t.childNodes);
    }
    for (; null !== (n = q.nextNode()) && h.length < l; ) {
      if (1 === n.nodeType) {
        if (n.hasAttributes())
          for (const t of n.getAttributeNames())
            if (t.endsWith(C)) {
              const e = c[r++],
                i = n.getAttribute(t).split(w),
                s = /([.?@])?(.*)/.exec(e);
              (h.push({
                type: 1,
                index: o,
                name: s[2],
                strings: i,
                ctor:
                  '.' === s[1] ? X : '?' === s[1] ? Y : '@' === s[1] ? tt : Q,
              }),
                n.removeAttribute(t));
            } else
              t.startsWith(w) &&
                (h.push({ type: 6, index: o }), n.removeAttribute(t));
        if (I.test(n.tagName)) {
          const t = n.textContent.split(w),
            e = t.length - 1;
          if (e > 0) {
            n.textContent = S ? S.emptyScript : '';
            for (let i = 0; i < e; i++)
              (n.append(t[i], T()),
                q.nextNode(),
                h.push({ type: 2, index: ++o }));
            n.append(t[e], T());
          }
        }
      } else if (8 === n.nodeType)
        if (n.data === x) h.push({ type: 2, index: o });
        else {
          let t = -1;
          for (; -1 !== (t = n.data.indexOf(w, t + 1)); )
            (h.push({ type: 7, index: o }), (t += w.length - 1));
        }
      o++;
    }
  }
  static createElement(t, e) {
    const i = M.createElement('template');
    return ((i.innerHTML = t), i);
  }
};
function K(t, e, i = t, s) {
  var _a, _b, _c;
  if (e === z) return e;
  let n =
    void 0 !== s
      ? (_a = i._$Co) === null || _a === void 0
        ? void 0
        : _a[s]
      : i._$Cl;
  const o = P(e) ? void 0 : e._$litDirective$;
  return (
    (n === null || n === void 0 ? void 0 : n.constructor) !== o &&
      ((_b = n === null || n === void 0 ? void 0 : n._$AO) === null ||
      _b === void 0
        ? void 0
        : _b.call(n, !1),
      void 0 === o ? (n = void 0) : ((n = new o(t)), n._$AT(t, i, s)),
      void 0 !== s
        ? (((_c = i._$Co) !== null && _c !== void 0 ? _c : (i._$Co = []))[s] =
            n)
        : (i._$Cl = n)),
    void 0 !== n && (e = K(t, n._$AS(t, e.values), n, s)),
    e
  );
}
let F = class {
    constructor(t, e) {
      ((this._$AV = []),
        (this._$AN = void 0),
        (this._$AD = t),
        (this._$AM = e));
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    u(t) {
      var _a;
      const {
          el: { content: e },
          parts: i,
        } = this._$AD,
        s = (
          (_a = t === null || t === void 0 ? void 0 : t.creationScope) !==
            null && _a !== void 0
            ? _a
            : M
        ).importNode(e, !0);
      q.currentNode = s;
      let n = q.nextNode(),
        o = 0,
        r = 0,
        l = i[0];
      for (; void 0 !== l; ) {
        if (o === l.index) {
          let e;
          (2 === l.type
            ? (e = new G(n, n.nextSibling, this, t))
            : 1 === l.type
              ? (e = new l.ctor(n, l.name, l.strings, this, t))
              : 6 === l.type && (e = new et(n, this, t)),
            this._$AV.push(e),
            (l = i[++r]));
        }
        o !== (l === null || l === void 0 ? void 0 : l.index) &&
          ((n = q.nextNode()), o++);
      }
      return ((q.currentNode = M), s);
    }
    p(t) {
      let e = 0;
      for (const i of this._$AV)
        (void 0 !== i &&
          (void 0 !== i.strings
            ? (i._$AI(t, i, e), (e += i.strings.length - 2))
            : i._$AI(t[e])),
          e++);
    }
  },
  G = class t {
    get _$AU() {
      var _a, _b;
      return (_b =
        (_a = this._$AM) === null || _a === void 0 ? void 0 : _a._$AU) !==
        null && _b !== void 0
        ? _b
        : this._$Cv;
    }
    constructor(t, e, i, s) {
      var _a;
      ((this.type = 2),
        (this._$AH = V),
        (this._$AN = void 0),
        (this._$AA = t),
        (this._$AB = e),
        (this._$AM = i),
        (this.options = s),
        (this._$Cv =
          (_a = s === null || s === void 0 ? void 0 : s.isConnected) !== null &&
          _a !== void 0
            ? _a
            : !0));
    }
    get parentNode() {
      let t = this._$AA.parentNode;
      const e = this._$AM;
      return (
        void 0 !== e &&
          11 === (t === null || t === void 0 ? void 0 : t.nodeType) &&
          (t = e.parentNode),
        t
      );
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(t, e = this) {
      ((t = K(this, t, e)),
        P(t)
          ? t === V || null == t || '' === t
            ? (this._$AH !== V && this._$AR(), (this._$AH = V))
            : t !== this._$AH && t !== z && this._(t)
          : void 0 !== t._$litType$
            ? this.$(t)
            : void 0 !== t.nodeType
              ? this.T(t)
              : ((t) =>
                    N(t) ||
                    'function' ==
                      typeof (t === null || t === void 0
                        ? void 0
                        : t[Symbol.iterator]))(t)
                ? this.k(t)
                : this._(t));
    }
    S(t) {
      return this._$AA.parentNode.insertBefore(t, this._$AB);
    }
    T(t) {
      this._$AH !== t && (this._$AR(), (this._$AH = this.S(t)));
    }
    _(t) {
      (this._$AH !== V && P(this._$AH)
        ? (this._$AA.nextSibling.data = t)
        : this.T(M.createTextNode(t)),
        (this._$AH = t));
    }
    $(t) {
      var _a;
      const { values: e, _$litType$: i } = t,
        s =
          'number' == typeof i
            ? this._$AC(t)
            : (void 0 === i.el &&
                (i.el = J.createElement(Z(i.h, i.h[0]), this.options)),
              i);
      if (((_a = this._$AH) === null || _a === void 0 ? void 0 : _a._$AD) === s)
        this._$AH.p(e);
      else {
        const t = new F(s, this),
          i = t.u(this.options);
        (t.p(e), this.T(i), (this._$AH = t));
      }
    }
    _$AC(t) {
      let e = W.get(t.strings);
      return (void 0 === e && W.set(t.strings, (e = new J(t))), e);
    }
    k(e) {
      N(this._$AH) || ((this._$AH = []), this._$AR());
      const i = this._$AH;
      let s,
        n = 0;
      for (const o of e)
        (n === i.length
          ? i.push((s = new t(this.S(T()), this.S(T()), this, this.options)))
          : (s = i[n]),
          s._$AI(o),
          n++);
      n < i.length && (this._$AR(s && s._$AB.nextSibling, n), (i.length = n));
    }
    _$AR(t = this._$AA.nextSibling, e) {
      var _a;
      for (
        (_a = this._$AP) === null || _a === void 0
          ? void 0
          : _a.call(this, !1, !0, e);
        t && t !== this._$AB;
      ) {
        const e = t.nextSibling;
        (t.remove(), (t = e));
      }
    }
    setConnected(t) {
      var _a;
      void 0 === this._$AM &&
        ((this._$Cv = t),
        (_a = this._$AP) === null || _a === void 0 ? void 0 : _a.call(this, t));
    }
  },
  Q = class {
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    constructor(t, e, i, s, n) {
      ((this.type = 1),
        (this._$AH = V),
        (this._$AN = void 0),
        (this.element = t),
        (this.name = e),
        (this._$AM = s),
        (this.options = n),
        i.length > 2 || '' !== i[0] || '' !== i[1]
          ? ((this._$AH = Array(i.length - 1).fill(new String())),
            (this.strings = i))
          : (this._$AH = V));
    }
    _$AI(t, e = this, i, s) {
      const n = this.strings;
      let o = !1;
      if (void 0 === n)
        ((t = K(this, t, e, 0)),
          (o = !P(t) || (t !== this._$AH && t !== z)),
          o && (this._$AH = t));
      else {
        const s = t;
        let r, l;
        for (t = n[0], r = 0; r < n.length - 1; r++)
          ((l = K(this, s[i + r], e, r)),
            l === z && (l = this._$AH[r]),
            o || (o = !P(l) || l !== this._$AH[r]),
            l === V
              ? (t = V)
              : t !== V &&
                (t += (l !== null && l !== void 0 ? l : '') + n[r + 1]),
            (this._$AH[r] = l));
      }
      o && !s && this.j(t);
    }
    j(t) {
      t === V
        ? this.element.removeAttribute(this.name)
        : this.element.setAttribute(
            this.name,
            t !== null && t !== void 0 ? t : '',
          );
    }
  },
  X = class extends Q {
    constructor() {
      (super(...arguments), (this.type = 3));
    }
    j(t) {
      this.element[this.name] = t === V ? void 0 : t;
    }
  },
  Y = class extends Q {
    constructor() {
      (super(...arguments), (this.type = 4));
    }
    j(t) {
      this.element.toggleAttribute(this.name, !!t && t !== V);
    }
  },
  tt = class extends Q {
    constructor(t, e, i, s, n) {
      (super(t, e, i, s, n), (this.type = 5));
    }
    _$AI(t, e = this) {
      var _a;
      if (
        (t = (_a = K(this, t, e, 0)) !== null && _a !== void 0 ? _a : V) === z
      )
        return;
      const i = this._$AH,
        s =
          (t === V && i !== V) ||
          t.capture !== i.capture ||
          t.once !== i.once ||
          t.passive !== i.passive,
        n = t !== V && (i === V || s);
      (s && this.element.removeEventListener(this.name, this, i),
        n && this.element.addEventListener(this.name, this, t),
        (this._$AH = t));
    }
    handleEvent(t) {
      var _a, _b;
      'function' == typeof this._$AH
        ? this._$AH.call(
            (_b =
              (_a = this.options) === null || _a === void 0
                ? void 0
                : _a.host) !== null && _b !== void 0
              ? _b
              : this.element,
            t,
          )
        : this._$AH.handleEvent(t);
    }
  },
  et = class {
    constructor(t, e, i) {
      ((this.element = t),
        (this.type = 6),
        (this._$AN = void 0),
        (this._$AM = e),
        (this.options = i));
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t) {
      K(this, t);
    }
  };
const it = b.litHtmlPolyfillSupport;
(it === null || it === void 0 ? void 0 : it(J, G),
  ((_d = b.litHtmlVersions) !== null && _d !== void 0
    ? _d
    : (b.litHtmlVersions = [])
  ).push('3.1.2'));
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let st = class extends y {
  constructor() {
    (super(...arguments),
      (this.renderOptions = { host: this }),
      (this._$Do = void 0));
  }
  createRenderRoot() {
    var _a;
    var _b;
    const t = super.createRenderRoot();
    return (
      (_a = (_b = this.renderOptions).renderBefore) !== null && _a !== void 0
        ? _a
        : (_b.renderBefore = t.firstChild),
      t
    );
  }
  update(t) {
    const e = this.render();
    (this.hasUpdated || (this.renderOptions.isConnected = this.isConnected),
      super.update(t),
      (this._$Do = ((t, e, i) => {
        var _a, _b;
        const s =
          (_a = i === null || i === void 0 ? void 0 : i.renderBefore) !==
            null && _a !== void 0
            ? _a
            : e;
        let n = s._$litPart$;
        if (void 0 === n) {
          const t =
            (_b = i === null || i === void 0 ? void 0 : i.renderBefore) !==
              null && _b !== void 0
              ? _b
              : null;
          s._$litPart$ = n = new G(
            e.insertBefore(T(), t),
            t,
            void 0,
            i !== null && i !== void 0 ? i : {},
          );
        }
        return (n._$AI(t), n);
      })(e, this.renderRoot, this.renderOptions)));
  }
  connectedCallback() {
    var _a;
    (super.connectedCallback(),
      (_a = this._$Do) === null || _a === void 0
        ? void 0
        : _a.setConnected(!0));
  }
  disconnectedCallback() {
    var _a;
    (super.disconnectedCallback(),
      (_a = this._$Do) === null || _a === void 0
        ? void 0
        : _a.setConnected(!1));
  }
  render() {
    return z;
  }
};
((st._$litElement$ = !0),
  (st.finalized = !0),
  (_e = globalThis.litElementHydrateSupport) === null || _e === void 0
    ? void 0
    : _e.call(globalThis, { LitElement: st }));
const nt = globalThis.litElementPolyfillSupport;
function ot(t, e, i) {
  return Object.entries(lt(e || {})).reduce(
    (t, [e, i]) =>
      t.replace(new RegExp(`{{[  ]*${e}[  ]*}}`, 'gm'), String(lt(i))),
    t,
  );
}
function rt(t, e) {
  const i = t.split('.');
  let s = e.strings;
  for (; null != s && i.length > 0; ) s = s[i.shift()];
  return null != s ? s.toString() : null;
}
function lt(t) {
  return 'function' == typeof t ? t() : t;
}
(nt === null || nt === void 0 ? void 0 : nt({ LitElement: st }),
  ((_f = globalThis.litElementVersions) !== null && _f !== void 0
    ? _f
    : (globalThis.litElementVersions = [])
  ).push('4.0.4'));
let ht = {
  loader: () => Promise.resolve({}),
  empty: (t) => `[${t}]`,
  lookup: rt,
  interpolate: ot,
  translationCache: {},
};
function at(t, e, i = ht) {
  let s =
    i.translationCache[t] ||
    (i.translationCache[t] = i.lookup(t, i) || i.empty(t, i));
  return null != (e = null != e ? lt(e) : null) ? i.interpolate(s, e, i) : s;
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ var ct;
const dt = window,
  pt = dt.trustedTypes,
  ut = pt ? pt.createPolicy('lit-html', { createHTML: (t) => t }) : void 0,
  $t = '$lit$',
  _t = `lit$${(Math.random() + '').slice(9)}$`,
  At = '?' + _t,
  vt = `<${At}>`,
  gt = document,
  ft = () => gt.createComment(''),
  mt = (t) => null === t || ('object' != typeof t && 'function' != typeof t),
  yt = Array.isArray,
  bt = '[ \t\n\f\r]',
  St = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
  Et = /-->/g,
  Ct = />/g,
  wt = RegExp(
    `>|${bt}(?:([^\\s"'>=/]+)(${bt}*=${bt}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,
    'g',
  ),
  xt = /'/g,
  Ht = /"/g,
  Mt = /^(?:script|style|textarea|title)$/i,
  Tt = Symbol.for('lit-noChange'),
  Pt = Symbol.for('lit-nothing'),
  Nt = new WeakMap(),
  kt = gt.createTreeWalker(gt, 129, null, !1);
function Ut(t, e) {
  if (!Array.isArray(t) || !t.hasOwnProperty('raw'))
    throw Error('invalid template strings array');
  return void 0 !== ut ? ut.createHTML(e) : e;
}
const Ot = (t, e) => {
  const i = t.length - 1,
    s = [];
  let n,
    o = 2 === e ? '<svg>' : '',
    r = St;
  for (let e = 0; e < i; e++) {
    const i = t[e];
    let l,
      h,
      a = -1,
      c = 0;
    for (; c < i.length && ((r.lastIndex = c), (h = r.exec(i)), null !== h); )
      ((c = r.lastIndex),
        r === St
          ? '!--' === h[1]
            ? (r = Et)
            : void 0 !== h[1]
              ? (r = Ct)
              : void 0 !== h[2]
                ? (Mt.test(h[2]) && (n = RegExp('</' + h[2], 'g')), (r = wt))
                : void 0 !== h[3] && (r = wt)
          : r === wt
            ? '>' === h[0]
              ? ((r = null != n ? n : St), (a = -1))
              : void 0 === h[1]
                ? (a = -2)
                : ((a = r.lastIndex - h[2].length),
                  (l = h[1]),
                  (r = void 0 === h[3] ? wt : '"' === h[3] ? Ht : xt))
            : r === Ht || r === xt
              ? (r = wt)
              : r === Et || r === Ct
                ? (r = St)
                : ((r = wt), (n = void 0)));
    const d = r === wt && t[e + 1].startsWith('/>') ? ' ' : '';
    o +=
      r === St
        ? i + vt
        : a >= 0
          ? (s.push(l), i.slice(0, a) + $t + i.slice(a) + _t + d)
          : i + _t + (-2 === a ? (s.push(void 0), e) : d);
  }
  return [Ut(t, o + (t[i] || '<?>') + (2 === e ? '</svg>' : '')), s];
};
class Rt {
  constructor({ strings: t, _$litType$: e }, i) {
    let s;
    this.parts = [];
    let n = 0,
      o = 0;
    const r = t.length - 1,
      l = this.parts,
      [h, a] = Ot(t, e);
    if (
      ((this.el = Rt.createElement(h, i)),
      (kt.currentNode = this.el.content),
      2 === e)
    ) {
      const t = this.el.content,
        e = t.firstChild;
      (e.remove(), t.append(...e.childNodes));
    }
    for (; null !== (s = kt.nextNode()) && l.length < r; ) {
      if (1 === s.nodeType) {
        if (s.hasAttributes()) {
          const t = [];
          for (const e of s.getAttributeNames())
            if (e.endsWith($t) || e.startsWith(_t)) {
              const i = a[o++];
              if ((t.push(e), void 0 !== i)) {
                const t = s.getAttribute(i.toLowerCase() + $t).split(_t),
                  e = /([.?@])?(.*)/.exec(i);
                l.push({
                  type: 1,
                  index: n,
                  name: e[2],
                  strings: t,
                  ctor:
                    '.' === e[1]
                      ? Bt
                      : '?' === e[1]
                        ? Vt
                        : '@' === e[1]
                          ? Wt
                          : It,
                });
              } else l.push({ type: 6, index: n });
            }
          for (const e of t) s.removeAttribute(e);
        }
        if (Mt.test(s.tagName)) {
          const t = s.textContent.split(_t),
            e = t.length - 1;
          if (e > 0) {
            s.textContent = pt ? pt.emptyScript : '';
            for (let i = 0; i < e; i++)
              (s.append(t[i], ft()),
                kt.nextNode(),
                l.push({ type: 2, index: ++n }));
            s.append(t[e], ft());
          }
        }
      } else if (8 === s.nodeType)
        if (s.data === At) l.push({ type: 2, index: n });
        else {
          let t = -1;
          for (; -1 !== (t = s.data.indexOf(_t, t + 1)); )
            (l.push({ type: 7, index: n }), (t += _t.length - 1));
        }
      n++;
    }
  }
  static createElement(t, e) {
    const i = gt.createElement('template');
    return ((i.innerHTML = t), i);
  }
}
function jt(t, e, i = t, s) {
  var n, o, r, l;
  if (e === Tt) return e;
  let h =
    void 0 !== s
      ? null === (n = i._$Co) || void 0 === n
        ? void 0
        : n[s]
      : i._$Cl;
  const a = mt(e) ? void 0 : e._$litDirective$;
  return (
    (null == h ? void 0 : h.constructor) !== a &&
      (null === (o = null == h ? void 0 : h._$AO) ||
        void 0 === o ||
        o.call(h, !1),
      void 0 === a ? (h = void 0) : ((h = new a(t)), h._$AT(t, i, s)),
      void 0 !== s
        ? ((null !== (r = (l = i)._$Co) && void 0 !== r ? r : (l._$Co = []))[
            s
          ] = h)
        : (i._$Cl = h)),
    void 0 !== h && (e = jt(t, h._$AS(t, e.values), h, s)),
    e
  );
}
class Lt {
  constructor(t, e) {
    ((this._$AV = []), (this._$AN = void 0), (this._$AD = t), (this._$AM = e));
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    var e;
    const {
        el: { content: i },
        parts: s,
      } = this._$AD,
      n = (
        null !== (e = null == t ? void 0 : t.creationScope) && void 0 !== e
          ? e
          : gt
      ).importNode(i, !0);
    kt.currentNode = n;
    let o = kt.nextNode(),
      r = 0,
      l = 0,
      h = s[0];
    for (; void 0 !== h; ) {
      if (r === h.index) {
        let e;
        (2 === h.type
          ? (e = new Dt(o, o.nextSibling, this, t))
          : 1 === h.type
            ? (e = new h.ctor(o, h.name, h.strings, this, t))
            : 6 === h.type && (e = new qt(o, this, t)),
          this._$AV.push(e),
          (h = s[++l]));
      }
      r !== (null == h ? void 0 : h.index) && ((o = kt.nextNode()), r++);
    }
    return ((kt.currentNode = gt), n);
  }
  v(t) {
    let e = 0;
    for (const i of this._$AV)
      (void 0 !== i &&
        (void 0 !== i.strings
          ? (i._$AI(t, i, e), (e += i.strings.length - 2))
          : i._$AI(t[e])),
        e++);
  }
}
class Dt {
  constructor(t, e, i, s) {
    var n;
    ((this.type = 2),
      (this._$AH = Pt),
      (this._$AN = void 0),
      (this._$AA = t),
      (this._$AB = e),
      (this._$AM = i),
      (this.options = s),
      (this._$Cp =
        null === (n = null == s ? void 0 : s.isConnected) ||
        void 0 === n ||
        n));
  }
  get _$AU() {
    var t, e;
    return null !==
      (e = null === (t = this._$AM) || void 0 === t ? void 0 : t._$AU) &&
      void 0 !== e
      ? e
      : this._$Cp;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return (
      void 0 !== e &&
        11 === (null == t ? void 0 : t.nodeType) &&
        (t = e.parentNode),
      t
    );
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    ((t = jt(this, t, e)),
      mt(t)
        ? t === Pt || null == t || '' === t
          ? (this._$AH !== Pt && this._$AR(), (this._$AH = Pt))
          : t !== this._$AH && t !== Tt && this._(t)
        : void 0 !== t._$litType$
          ? this.g(t)
          : void 0 !== t.nodeType
            ? this.$(t)
            : ((t) =>
                  yt(t) ||
                  'function' ==
                    typeof (null == t ? void 0 : t[Symbol.iterator]))(t)
              ? this.T(t)
              : this._(t));
  }
  k(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  $(t) {
    this._$AH !== t && (this._$AR(), (this._$AH = this.k(t)));
  }
  _(t) {
    (this._$AH !== Pt && mt(this._$AH)
      ? (this._$AA.nextSibling.data = t)
      : this.$(gt.createTextNode(t)),
      (this._$AH = t));
  }
  g(t) {
    var e;
    const { values: i, _$litType$: s } = t,
      n =
        'number' == typeof s
          ? this._$AC(t)
          : (void 0 === s.el &&
              (s.el = Rt.createElement(Ut(s.h, s.h[0]), this.options)),
            s);
    if ((null === (e = this._$AH) || void 0 === e ? void 0 : e._$AD) === n)
      this._$AH.v(i);
    else {
      const t = new Lt(n, this),
        e = t.u(this.options);
      (t.v(i), this.$(e), (this._$AH = t));
    }
  }
  _$AC(t) {
    let e = Nt.get(t.strings);
    return (void 0 === e && Nt.set(t.strings, (e = new Rt(t))), e);
  }
  T(t) {
    yt(this._$AH) || ((this._$AH = []), this._$AR());
    const e = this._$AH;
    let i,
      s = 0;
    for (const n of t)
      (s === e.length
        ? e.push((i = new Dt(this.k(ft()), this.k(ft()), this, this.options)))
        : (i = e[s]),
        i._$AI(n),
        s++);
    s < e.length && (this._$AR(i && i._$AB.nextSibling, s), (e.length = s));
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for (
      null === (i = this._$AP) || void 0 === i || i.call(this, !1, !0, e);
      t && t !== this._$AB;
    ) {
      const e = t.nextSibling;
      (t.remove(), (t = e));
    }
  }
  setConnected(t) {
    var e;
    void 0 === this._$AM &&
      ((this._$Cp = t),
      null === (e = this._$AP) || void 0 === e || e.call(this, t));
  }
}
class It {
  constructor(t, e, i, s, n) {
    ((this.type = 1),
      (this._$AH = Pt),
      (this._$AN = void 0),
      (this.element = t),
      (this.name = e),
      (this._$AM = s),
      (this.options = n),
      i.length > 2 || '' !== i[0] || '' !== i[1]
        ? ((this._$AH = Array(i.length - 1).fill(new String())),
          (this.strings = i))
        : (this._$AH = Pt));
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t, e = this, i, s) {
    const n = this.strings;
    let o = !1;
    if (void 0 === n)
      ((t = jt(this, t, e, 0)),
        (o = !mt(t) || (t !== this._$AH && t !== Tt)),
        o && (this._$AH = t));
    else {
      const s = t;
      let r, l;
      for (t = n[0], r = 0; r < n.length - 1; r++)
        ((l = jt(this, s[i + r], e, r)),
          l === Tt && (l = this._$AH[r]),
          o || (o = !mt(l) || l !== this._$AH[r]),
          l === Pt
            ? (t = Pt)
            : t !== Pt && (t += (null != l ? l : '') + n[r + 1]),
          (this._$AH[r] = l));
    }
    o && !s && this.j(t);
  }
  j(t) {
    t === Pt
      ? this.element.removeAttribute(this.name)
      : this.element.setAttribute(this.name, null != t ? t : '');
  }
}
class Bt extends It {
  constructor() {
    (super(...arguments), (this.type = 3));
  }
  j(t) {
    this.element[this.name] = t === Pt ? void 0 : t;
  }
}
const zt = pt ? pt.emptyScript : '';
class Vt extends It {
  constructor() {
    (super(...arguments), (this.type = 4));
  }
  j(t) {
    t && t !== Pt
      ? this.element.setAttribute(this.name, zt)
      : this.element.removeAttribute(this.name);
  }
}
class Wt extends It {
  constructor(t, e, i, s, n) {
    (super(t, e, i, s, n), (this.type = 5));
  }
  _$AI(t, e = this) {
    var i;
    if ((t = null !== (i = jt(this, t, e, 0)) && void 0 !== i ? i : Pt) === Tt)
      return;
    const s = this._$AH,
      n =
        (t === Pt && s !== Pt) ||
        t.capture !== s.capture ||
        t.once !== s.once ||
        t.passive !== s.passive,
      o = t !== Pt && (s === Pt || n);
    (n && this.element.removeEventListener(this.name, this, s),
      o && this.element.addEventListener(this.name, this, t),
      (this._$AH = t));
  }
  handleEvent(t) {
    var e, i;
    'function' == typeof this._$AH
      ? this._$AH.call(
          null !==
            (i =
              null === (e = this.options) || void 0 === e ? void 0 : e.host) &&
            void 0 !== i
            ? i
            : this.element,
          t,
        )
      : this._$AH.handleEvent(t);
  }
}
class qt {
  constructor(t, e, i) {
    ((this.element = t),
      (this.type = 6),
      (this._$AN = void 0),
      (this._$AM = e),
      (this.options = i));
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    jt(this, t);
  }
}
const Zt = dt.litHtmlPolyfillSupport;
(null == Zt || Zt(Rt, Dt),
  (null !== (ct = dt.litHtmlVersions) && void 0 !== ct
    ? ct
    : (dt.litHtmlVersions = [])
  ).push('2.8.0'));
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Jt = {
    attribute: !0,
    type: String,
    converter: g,
    reflect: !1,
    hasChanged: f,
  },
  Kt = (t = Jt, e, i) => {
    const { kind: s, metadata: n } = i;
    let o = globalThis.litPropertyMetadata.get(n);
    if (
      (void 0 === o && globalThis.litPropertyMetadata.set(n, (o = new Map())),
      o.set(i.name, t),
      'accessor' === s)
    ) {
      const { name: s } = i;
      return {
        set(i) {
          const n = e.get.call(this);
          (e.set.call(this, i), this.requestUpdate(s, n, t));
        },
        init(e) {
          return (void 0 !== e && this.P(s, void 0, t), e);
        },
      };
    }
    if ('setter' === s) {
      const { name: s } = i;
      return function (i) {
        const n = this[s];
        (e.call(this, i), this.requestUpdate(s, n, t));
      };
    }
    throw Error('Unsupported decorator location: ' + s);
  };
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function Ft(t) {
  return (e, i) =>
    'object' == typeof i
      ? Kt(t, e, i)
      : ((t, e, i) => {
          const s = e.hasOwnProperty(i);
          return (
            e.constructor.createProperty(i, s ? { ...t, wrapped: !0 } : t),
            s ? Object.getOwnPropertyDescriptor(e, i) : void 0
          );
        })(t, e, i);
}
var Gt;
((Gt = {
  loader: (t) => fetch(`/resources/i18n/${t}.json`).then((t) => t.json()),
}),
  (ht = Object.assign(Object.assign({}, ht), Gt)));
class Qt extends st {
  constructor() {
    (super(),
      (this.active = !1),
      (this.hasLoadedStrings = !1),
      (this.themeHandler = (t) => {
        this.isDarkMode = t.detail;
      }),
      (this.active = !1),
      (this.tasker = globalThis.tasker),
      (this.isDarkMode = globalThis.isDarkMode));
  }
  get activeConnected() {
    return (
      this.active &&
      void 0 !== globalThis.backendaiclient &&
      null !== globalThis.backendaiclient &&
      !0 === globalThis.backendaiclient.ready
    );
  }
  get connected() {
    return (
      void 0 !== globalThis.backendaiclient &&
      null !== globalThis.backendaiclient &&
      !0 === globalThis.backendaiclient.ready
    );
  }
  _viewStateChanged(t) {}
  connectedCallback() {
    (super.connectedCallback(),
      document.addEventListener(
        'change:backendaiwebui.setting.isDarkMode',
        this.themeHandler,
      ));
  }
  disconnectedCallback() {
    (super.disconnectedCallback(),
      document.removeEventListener(
        'change:backendaiwebui.setting.isDarkMode',
        this.themeHandler,
      ));
  }
  shouldUpdate() {
    return this.active;
  }
  attributeChangedCallback(t, e, i) {
    if ('active' === t) {
      if (e === i) return;
      null !== i
        ? ((this.active = !0), this._viewStateChanged(!0))
        : ((this.active = !1), this._viewStateChanged(!1));
    }
    super.attributeChangedCallback(t, e, i);
  }
  _hideDialog(t) {
    t.target.closest('backend-ai-dialog').hide();
  }
  _addInputValidator(t) {
    if (!t.hasAttribute('auto-validate')) return;
    let e;
    null === t.validityTransform &&
      ((e = t.getAttribute('error-message')
        ? t.getAttribute('error-message')
        : t.getAttribute('validationMessage')
          ? t.getAttribute('validationMessage')
          : at('credential.validation.ValidationFailed')),
      (t.validityTransform = (i, s) =>
        s.valid
          ? { valid: s.valid }
          : s.patternMismatch
            ? ((t.validationMessage = e),
              { valid: s.valid, patternMismatch: !s.valid })
            : s.valueMissing
              ? ((t.validationMessage = at('explorer.ValueRequired')),
                { valid: s.valid, valueMissing: !s.valid })
              : s.tooShort
                ? ((t.validationMessage = at('explorer.InputTooShort')),
                  { valid: s.valid, valueMissing: !s.valid })
                : ((t.validationMessage = e),
                  { valid: s.valid, patternMismatch: !s.valid })));
  }
}
(t([Ft({ type: Boolean, reflect: !0 })], Qt.prototype, 'active', void 0),
  t([Ft({ type: Boolean })], Qt.prototype, 'hasLoadedStrings', void 0),
  t([Ft({ type: String })], Qt.prototype, 'permission', void 0),
  t([Ft({ type: String })], Qt.prototype, 'menuitem', void 0),
  t([Ft({ type: Boolean })], Qt.prototype, 'isDarkMode', void 0));
let Xt = class extends Qt {
  constructor() {
    (super(),
      (this.menuitem = 'Open Backend.AI'),
      (this.icon = 'externalLink'),
      (this.type = 'externalLink'),
      (this.is = 'test-plugin'),
      (this.permission = 'user'),
      (this.url = 'https://backend.ai'));
  }
  static get styles() {
    return [];
  }
  updated() {
    this.openExternalLink();
  }
  openExternalLink() {
    var t;
    (window.open(
      this.url +
        encodeURIComponent(
          btoa(
            null === (t = globalThis.backendaiclient) || void 0 === t
              ? ''
              : t.email,
          ),
        ),
      '_blank',
    ),
      window.history.back());
  }
  render() {
    return B``;
  }
};
(t([Ft({ type: String })], Xt.prototype, 'menuitem', void 0),
  t([Ft({ type: String })], Xt.prototype, 'is', void 0),
  t([Ft({ type: String })], Xt.prototype, 'permission', void 0),
  t([Ft({ type: String })], Xt.prototype, 'url', void 0),
  (Xt = t(
    [
      ((t) => (e, i) => {
        void 0 !== i
          ? i.addInitializer(() => {
              customElements.define(t, e);
            })
          : customElements.define(t, e);
      })('test-plugin'),
    ],
    Xt,
  )));
var Yt = Xt;
export { Yt as default };
