(function (authentication, common, events, dom, utils, ui, extension, React$1, custom, toasts, modals, patcher) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var authentication__default = /*#__PURE__*/_interopDefaultLegacy(authentication);
    var common__default = /*#__PURE__*/_interopDefaultLegacy(common);
    var events__default = /*#__PURE__*/_interopDefaultLegacy(events);
    var dom__default = /*#__PURE__*/_interopDefaultLegacy(dom);
    var utils__default = /*#__PURE__*/_interopDefaultLegacy(utils);
    var ui__default = /*#__PURE__*/_interopDefaultLegacy(ui);
    var React__namespace = /*#__PURE__*/_interopNamespace(React$1);
    var toasts__default = /*#__PURE__*/_interopDefaultLegacy(toasts);
    var modals__default = /*#__PURE__*/_interopDefaultLegacy(modals);

    const PACKET_TYPES = Object.create(null); // no Map = no polyfill
    PACKET_TYPES["open"] = "0";
    PACKET_TYPES["close"] = "1";
    PACKET_TYPES["ping"] = "2";
    PACKET_TYPES["pong"] = "3";
    PACKET_TYPES["message"] = "4";
    PACKET_TYPES["upgrade"] = "5";
    PACKET_TYPES["noop"] = "6";
    const PACKET_TYPES_REVERSE = Object.create(null);
    Object.keys(PACKET_TYPES).forEach(key => {
        PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
    });
    const ERROR_PACKET = { type: "error", data: "parser error" };

    const withNativeBlob$1 = typeof Blob === "function" ||
        (typeof Blob !== "undefined" &&
            Object.prototype.toString.call(Blob) === "[object BlobConstructor]");
    const withNativeArrayBuffer$2 = typeof ArrayBuffer === "function";
    // ArrayBuffer.isView method is not defined in IE10
    const isView$1 = obj => {
        return typeof ArrayBuffer.isView === "function"
            ? ArrayBuffer.isView(obj)
            : obj && obj.buffer instanceof ArrayBuffer;
    };
    const encodePacket = ({ type, data }, supportsBinary, callback) => {
        if (withNativeBlob$1 && data instanceof Blob) {
            if (supportsBinary) {
                return callback(data);
            }
            else {
                return encodeBlobAsBase64(data, callback);
            }
        }
        else if (withNativeArrayBuffer$2 &&
            (data instanceof ArrayBuffer || isView$1(data))) {
            if (supportsBinary) {
                return callback(data);
            }
            else {
                return encodeBlobAsBase64(new Blob([data]), callback);
            }
        }
        // plain string
        return callback(PACKET_TYPES[type] + (data || ""));
    };
    const encodeBlobAsBase64 = (data, callback) => {
        const fileReader = new FileReader();
        fileReader.onload = function () {
            const content = fileReader.result.split(",")[1];
            callback("b" + (content || ""));
        };
        return fileReader.readAsDataURL(data);
    };

    // imported from https://github.com/socketio/base64-arraybuffer
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    // Use a lookup table to find the index.
    const lookup$1 = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
        lookup$1[chars.charCodeAt(i)] = i;
    }
    const decode$1 = (base64) => {
        let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
        if (base64[base64.length - 1] === '=') {
            bufferLength--;
            if (base64[base64.length - 2] === '=') {
                bufferLength--;
            }
        }
        const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
        for (i = 0; i < len; i += 4) {
            encoded1 = lookup$1[base64.charCodeAt(i)];
            encoded2 = lookup$1[base64.charCodeAt(i + 1)];
            encoded3 = lookup$1[base64.charCodeAt(i + 2)];
            encoded4 = lookup$1[base64.charCodeAt(i + 3)];
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }
        return arraybuffer;
    };

    const withNativeArrayBuffer$1 = typeof ArrayBuffer === "function";
    const decodePacket = (encodedPacket, binaryType) => {
        if (typeof encodedPacket !== "string") {
            return {
                type: "message",
                data: mapBinary(encodedPacket, binaryType)
            };
        }
        const type = encodedPacket.charAt(0);
        if (type === "b") {
            return {
                type: "message",
                data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
            };
        }
        const packetType = PACKET_TYPES_REVERSE[type];
        if (!packetType) {
            return ERROR_PACKET;
        }
        return encodedPacket.length > 1
            ? {
                type: PACKET_TYPES_REVERSE[type],
                data: encodedPacket.substring(1)
            }
            : {
                type: PACKET_TYPES_REVERSE[type]
            };
    };
    const decodeBase64Packet = (data, binaryType) => {
        if (withNativeArrayBuffer$1) {
            const decoded = decode$1(data);
            return mapBinary(decoded, binaryType);
        }
        else {
            return { base64: true, data }; // fallback for old browsers
        }
    };
    const mapBinary = (data, binaryType) => {
        switch (binaryType) {
            case "blob":
                return data instanceof ArrayBuffer ? new Blob([data]) : data;
            case "arraybuffer":
            default:
                return data; // assuming the data is already an ArrayBuffer
        }
    };

    const SEPARATOR = String.fromCharCode(30); // see https://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text
    const encodePayload = (packets, callback) => {
        // some packets may be added to the array while encoding, so the initial length must be saved
        const length = packets.length;
        const encodedPackets = new Array(length);
        let count = 0;
        packets.forEach((packet, i) => {
            // force base64 encoding for binary packets
            encodePacket(packet, false, encodedPacket => {
                encodedPackets[i] = encodedPacket;
                if (++count === length) {
                    callback(encodedPackets.join(SEPARATOR));
                }
            });
        });
    };
    const decodePayload = (encodedPayload, binaryType) => {
        const encodedPackets = encodedPayload.split(SEPARATOR);
        const packets = [];
        for (let i = 0; i < encodedPackets.length; i++) {
            const decodedPacket = decodePacket(encodedPackets[i], binaryType);
            packets.push(decodedPacket);
            if (decodedPacket.type === "error") {
                break;
            }
        }
        return packets;
    };
    const protocol$1 = 4;

    /**
     * Initialize a new `Emitter`.
     *
     * @api public
     */

    function Emitter(obj) {
      if (obj) return mixin(obj);
    }

    /**
     * Mixin the emitter properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */

    function mixin(obj) {
      for (var key in Emitter.prototype) {
        obj[key] = Emitter.prototype[key];
      }
      return obj;
    }

    /**
     * Listen on the given `event` with `fn`.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.on =
    Emitter.prototype.addEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};
      (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
        .push(fn);
      return this;
    };

    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.once = function(event, fn){
      function on() {
        this.off(event, on);
        fn.apply(this, arguments);
      }

      on.fn = fn;
      this.on(event, on);
      return this;
    };

    /**
     * Remove the given callback for `event` or all
     * registered callbacks.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.off =
    Emitter.prototype.removeListener =
    Emitter.prototype.removeAllListeners =
    Emitter.prototype.removeEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};

      // all
      if (0 == arguments.length) {
        this._callbacks = {};
        return this;
      }

      // specific event
      var callbacks = this._callbacks['$' + event];
      if (!callbacks) return this;

      // remove all handlers
      if (1 == arguments.length) {
        delete this._callbacks['$' + event];
        return this;
      }

      // remove specific handler
      var cb;
      for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }

      // Remove event specific arrays for event types that no
      // one is subscribed for to avoid memory leak.
      if (callbacks.length === 0) {
        delete this._callbacks['$' + event];
      }

      return this;
    };

    /**
     * Emit `event` with the given args.
     *
     * @param {String} event
     * @param {Mixed} ...
     * @return {Emitter}
     */

    Emitter.prototype.emit = function(event){
      this._callbacks = this._callbacks || {};

      var args = new Array(arguments.length - 1)
        , callbacks = this._callbacks['$' + event];

      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }

      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) {
          callbacks[i].apply(this, args);
        }
      }

      return this;
    };

    // alias used for reserved events (protected method)
    Emitter.prototype.emitReserved = Emitter.prototype.emit;

    /**
     * Return array of callbacks for `event`.
     *
     * @param {String} event
     * @return {Array}
     * @api public
     */

    Emitter.prototype.listeners = function(event){
      this._callbacks = this._callbacks || {};
      return this._callbacks['$' + event] || [];
    };

    /**
     * Check if this emitter has `event` handlers.
     *
     * @param {String} event
     * @return {Boolean}
     * @api public
     */

    Emitter.prototype.hasListeners = function(event){
      return !! this.listeners(event).length;
    };

    const globalThisShim = (() => {
        if (typeof self !== "undefined") {
            return self;
        }
        else if (typeof window !== "undefined") {
            return window;
        }
        else {
            return Function("return this")();
        }
    })();

    function pick(obj, ...attr) {
        return attr.reduce((acc, k) => {
            if (obj.hasOwnProperty(k)) {
                acc[k] = obj[k];
            }
            return acc;
        }, {});
    }
    // Keep a reference to the real timeout functions so they can be used when overridden
    const NATIVE_SET_TIMEOUT = globalThisShim.setTimeout;
    const NATIVE_CLEAR_TIMEOUT = globalThisShim.clearTimeout;
    function installTimerFunctions(obj, opts) {
        if (opts.useNativeTimers) {
            obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThisShim);
            obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThisShim);
        }
        else {
            obj.setTimeoutFn = globalThisShim.setTimeout.bind(globalThisShim);
            obj.clearTimeoutFn = globalThisShim.clearTimeout.bind(globalThisShim);
        }
    }
    // base64 encoded buffers are about 33% bigger (https://en.wikipedia.org/wiki/Base64)
    const BASE64_OVERHEAD = 1.33;
    // we could also have used `new Blob([obj]).size`, but it isn't supported in IE9
    function byteLength(obj) {
        if (typeof obj === "string") {
            return utf8Length(obj);
        }
        // arraybuffer or blob
        return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
    }
    function utf8Length(str) {
        let c = 0, length = 0;
        for (let i = 0, l = str.length; i < l; i++) {
            c = str.charCodeAt(i);
            if (c < 0x80) {
                length += 1;
            }
            else if (c < 0x800) {
                length += 2;
            }
            else if (c < 0xd800 || c >= 0xe000) {
                length += 3;
            }
            else {
                i++;
                length += 4;
            }
        }
        return length;
    }

    class TransportError extends Error {
        constructor(reason, description, context) {
            super(reason);
            this.description = description;
            this.context = context;
            this.type = "TransportError";
        }
    }
    class Transport extends Emitter {
        /**
         * Transport abstract constructor.
         *
         * @param {Object} opts - options
         * @protected
         */
        constructor(opts) {
            super();
            this.writable = false;
            installTimerFunctions(this, opts);
            this.opts = opts;
            this.query = opts.query;
            this.socket = opts.socket;
        }
        /**
         * Emits an error.
         *
         * @param {String} reason
         * @param description
         * @param context - the error context
         * @return {Transport} for chaining
         * @protected
         */
        onError(reason, description, context) {
            super.emitReserved("error", new TransportError(reason, description, context));
            return this;
        }
        /**
         * Opens the transport.
         */
        open() {
            this.readyState = "opening";
            this.doOpen();
            return this;
        }
        /**
         * Closes the transport.
         */
        close() {
            if (this.readyState === "opening" || this.readyState === "open") {
                this.doClose();
                this.onClose();
            }
            return this;
        }
        /**
         * Sends multiple packets.
         *
         * @param {Array} packets
         */
        send(packets) {
            if (this.readyState === "open") {
                this.write(packets);
            }
        }
        /**
         * Called upon open
         *
         * @protected
         */
        onOpen() {
            this.readyState = "open";
            this.writable = true;
            super.emitReserved("open");
        }
        /**
         * Called with data.
         *
         * @param {String} data
         * @protected
         */
        onData(data) {
            const packet = decodePacket(data, this.socket.binaryType);
            this.onPacket(packet);
        }
        /**
         * Called with a decoded packet.
         *
         * @protected
         */
        onPacket(packet) {
            super.emitReserved("packet", packet);
        }
        /**
         * Called upon close.
         *
         * @protected
         */
        onClose(details) {
            this.readyState = "closed";
            super.emitReserved("close", details);
        }
        /**
         * Pauses the transport, in order not to lose packets during an upgrade.
         *
         * @param onPause
         */
        pause(onPause) { }
    }

    // imported from https://github.com/unshiftio/yeast
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(''), length = 64, map$1 = {};
    let seed = 0, i = 0, prev;
    /**
     * Return a string representing the specified number.
     *
     * @param {Number} num The number to convert.
     * @returns {String} The string representation of the number.
     * @api public
     */
    function encode$1(num) {
        let encoded = '';
        do {
            encoded = alphabet[num % length] + encoded;
            num = Math.floor(num / length);
        } while (num > 0);
        return encoded;
    }
    /**
     * Yeast: A tiny growing id generator.
     *
     * @returns {String} A unique id.
     * @api public
     */
    function yeast() {
        const now = encode$1(+new Date());
        if (now !== prev)
            return seed = 0, prev = now;
        return now + '.' + encode$1(seed++);
    }
    //
    // Map each character to its index.
    //
    for (; i < length; i++)
        map$1[alphabet[i]] = i;

    // imported from https://github.com/galkn/querystring
    /**
     * Compiles a querystring
     * Returns string representation of the object
     *
     * @param {Object}
     * @api private
     */
    function encode(obj) {
        let str = '';
        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (str.length)
                    str += '&';
                str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
            }
        }
        return str;
    }
    /**
     * Parses a simple querystring into an object
     *
     * @param {String} qs
     * @api private
     */
    function decode(qs) {
        let qry = {};
        let pairs = qs.split('&');
        for (let i = 0, l = pairs.length; i < l; i++) {
            let pair = pairs[i].split('=');
            qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return qry;
    }

    // imported from https://github.com/component/has-cors
    let value = false;
    try {
        value = typeof XMLHttpRequest !== 'undefined' &&
            'withCredentials' in new XMLHttpRequest();
    }
    catch (err) {
        // if XMLHttp support is disabled in IE then it will throw
        // when trying to create
    }
    const hasCORS = value;

    // browser shim for xmlhttprequest module
    function XHR(opts) {
        const xdomain = opts.xdomain;
        // XMLHttpRequest can be disabled on IE
        try {
            if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
                return new XMLHttpRequest();
            }
        }
        catch (e) { }
        if (!xdomain) {
            try {
                return new globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
            }
            catch (e) { }
        }
    }

    function empty() { }
    const hasXHR2 = (function () {
        const xhr = new XHR({
            xdomain: false,
        });
        return null != xhr.responseType;
    })();
    class Polling extends Transport {
        /**
         * XHR Polling constructor.
         *
         * @param {Object} opts
         * @package
         */
        constructor(opts) {
            super(opts);
            this.polling = false;
            if (typeof location !== "undefined") {
                const isSSL = "https:" === location.protocol;
                let port = location.port;
                // some user agents have empty `location.port`
                if (!port) {
                    port = isSSL ? "443" : "80";
                }
                this.xd =
                    (typeof location !== "undefined" &&
                        opts.hostname !== location.hostname) ||
                        port !== opts.port;
                this.xs = opts.secure !== isSSL;
            }
            /**
             * XHR supports binary
             */
            const forceBase64 = opts && opts.forceBase64;
            this.supportsBinary = hasXHR2 && !forceBase64;
        }
        get name() {
            return "polling";
        }
        /**
         * Opens the socket (triggers polling). We write a PING message to determine
         * when the transport is open.
         *
         * @protected
         */
        doOpen() {
            this.poll();
        }
        /**
         * Pauses polling.
         *
         * @param {Function} onPause - callback upon buffers are flushed and transport is paused
         * @package
         */
        pause(onPause) {
            this.readyState = "pausing";
            const pause = () => {
                this.readyState = "paused";
                onPause();
            };
            if (this.polling || !this.writable) {
                let total = 0;
                if (this.polling) {
                    total++;
                    this.once("pollComplete", function () {
                        --total || pause();
                    });
                }
                if (!this.writable) {
                    total++;
                    this.once("drain", function () {
                        --total || pause();
                    });
                }
            }
            else {
                pause();
            }
        }
        /**
         * Starts polling cycle.
         *
         * @private
         */
        poll() {
            this.polling = true;
            this.doPoll();
            this.emitReserved("poll");
        }
        /**
         * Overloads onData to detect payloads.
         *
         * @protected
         */
        onData(data) {
            const callback = (packet) => {
                // if its the first message we consider the transport open
                if ("opening" === this.readyState && packet.type === "open") {
                    this.onOpen();
                }
                // if its a close packet, we close the ongoing requests
                if ("close" === packet.type) {
                    this.onClose({ description: "transport closed by the server" });
                    return false;
                }
                // otherwise bypass onData and handle the message
                this.onPacket(packet);
            };
            // decode payload
            decodePayload(data, this.socket.binaryType).forEach(callback);
            // if an event did not trigger closing
            if ("closed" !== this.readyState) {
                // if we got data we're not polling
                this.polling = false;
                this.emitReserved("pollComplete");
                if ("open" === this.readyState) {
                    this.poll();
                }
            }
        }
        /**
         * For polling, send a close packet.
         *
         * @protected
         */
        doClose() {
            const close = () => {
                this.write([{ type: "close" }]);
            };
            if ("open" === this.readyState) {
                close();
            }
            else {
                // in case we're trying to close while
                // handshaking is in progress (GH-164)
                this.once("open", close);
            }
        }
        /**
         * Writes a packets payload.
         *
         * @param {Array} packets - data packets
         * @protected
         */
        write(packets) {
            this.writable = false;
            encodePayload(packets, (data) => {
                this.doWrite(data, () => {
                    this.writable = true;
                    this.emitReserved("drain");
                });
            });
        }
        /**
         * Generates uri for connection.
         *
         * @private
         */
        uri() {
            let query = this.query || {};
            const schema = this.opts.secure ? "https" : "http";
            let port = "";
            // cache busting is forced
            if (false !== this.opts.timestampRequests) {
                query[this.opts.timestampParam] = yeast();
            }
            if (!this.supportsBinary && !query.sid) {
                query.b64 = 1;
            }
            // avoid port if default for schema
            if (this.opts.port &&
                (("https" === schema && Number(this.opts.port) !== 443) ||
                    ("http" === schema && Number(this.opts.port) !== 80))) {
                port = ":" + this.opts.port;
            }
            const encodedQuery = encode(query);
            const ipv6 = this.opts.hostname.indexOf(":") !== -1;
            return (schema +
                "://" +
                (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
                port +
                this.opts.path +
                (encodedQuery.length ? "?" + encodedQuery : ""));
        }
        /**
         * Creates a request.
         *
         * @param {String} method
         * @private
         */
        request(opts = {}) {
            Object.assign(opts, { xd: this.xd, xs: this.xs }, this.opts);
            return new Request(this.uri(), opts);
        }
        /**
         * Sends data.
         *
         * @param {String} data to send.
         * @param {Function} called upon flush.
         * @private
         */
        doWrite(data, fn) {
            const req = this.request({
                method: "POST",
                data: data,
            });
            req.on("success", fn);
            req.on("error", (xhrStatus, context) => {
                this.onError("xhr post error", xhrStatus, context);
            });
        }
        /**
         * Starts a poll cycle.
         *
         * @private
         */
        doPoll() {
            const req = this.request();
            req.on("data", this.onData.bind(this));
            req.on("error", (xhrStatus, context) => {
                this.onError("xhr poll error", xhrStatus, context);
            });
            this.pollXhr = req;
        }
    }
    class Request extends Emitter {
        /**
         * Request constructor
         *
         * @param {Object} options
         * @package
         */
        constructor(uri, opts) {
            super();
            installTimerFunctions(this, opts);
            this.opts = opts;
            this.method = opts.method || "GET";
            this.uri = uri;
            this.async = false !== opts.async;
            this.data = undefined !== opts.data ? opts.data : null;
            this.create();
        }
        /**
         * Creates the XHR object and sends the request.
         *
         * @private
         */
        create() {
            const opts = pick(this.opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
            opts.xdomain = !!this.opts.xd;
            opts.xscheme = !!this.opts.xs;
            const xhr = (this.xhr = new XHR(opts));
            try {
                xhr.open(this.method, this.uri, this.async);
                try {
                    if (this.opts.extraHeaders) {
                        xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
                        for (let i in this.opts.extraHeaders) {
                            if (this.opts.extraHeaders.hasOwnProperty(i)) {
                                xhr.setRequestHeader(i, this.opts.extraHeaders[i]);
                            }
                        }
                    }
                }
                catch (e) { }
                if ("POST" === this.method) {
                    try {
                        xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
                    }
                    catch (e) { }
                }
                try {
                    xhr.setRequestHeader("Accept", "*/*");
                }
                catch (e) { }
                // ie6 check
                if ("withCredentials" in xhr) {
                    xhr.withCredentials = this.opts.withCredentials;
                }
                if (this.opts.requestTimeout) {
                    xhr.timeout = this.opts.requestTimeout;
                }
                xhr.onreadystatechange = () => {
                    if (4 !== xhr.readyState)
                        return;
                    if (200 === xhr.status || 1223 === xhr.status) {
                        this.onLoad();
                    }
                    else {
                        // make sure the `error` event handler that's user-set
                        // does not throw in the same tick and gets caught here
                        this.setTimeoutFn(() => {
                            this.onError(typeof xhr.status === "number" ? xhr.status : 0);
                        }, 0);
                    }
                };
                xhr.send(this.data);
            }
            catch (e) {
                // Need to defer since .create() is called directly from the constructor
                // and thus the 'error' event can only be only bound *after* this exception
                // occurs.  Therefore, also, we cannot throw here at all.
                this.setTimeoutFn(() => {
                    this.onError(e);
                }, 0);
                return;
            }
            if (typeof document !== "undefined") {
                this.index = Request.requestsCount++;
                Request.requests[this.index] = this;
            }
        }
        /**
         * Called upon error.
         *
         * @private
         */
        onError(err) {
            this.emitReserved("error", err, this.xhr);
            this.cleanup(true);
        }
        /**
         * Cleans up house.
         *
         * @private
         */
        cleanup(fromError) {
            if ("undefined" === typeof this.xhr || null === this.xhr) {
                return;
            }
            this.xhr.onreadystatechange = empty;
            if (fromError) {
                try {
                    this.xhr.abort();
                }
                catch (e) { }
            }
            if (typeof document !== "undefined") {
                delete Request.requests[this.index];
            }
            this.xhr = null;
        }
        /**
         * Called upon load.
         *
         * @private
         */
        onLoad() {
            const data = this.xhr.responseText;
            if (data !== null) {
                this.emitReserved("data", data);
                this.emitReserved("success");
                this.cleanup();
            }
        }
        /**
         * Aborts the request.
         *
         * @package
         */
        abort() {
            this.cleanup();
        }
    }
    Request.requestsCount = 0;
    Request.requests = {};
    /**
     * Aborts pending requests when unloading the window. This is needed to prevent
     * memory leaks (e.g. when using IE) and to ensure that no spurious error is
     * emitted.
     */
    if (typeof document !== "undefined") {
        // @ts-ignore
        if (typeof attachEvent === "function") {
            // @ts-ignore
            attachEvent("onunload", unloadHandler);
        }
        else if (typeof addEventListener === "function") {
            const terminationEvent = "onpagehide" in globalThisShim ? "pagehide" : "unload";
            addEventListener(terminationEvent, unloadHandler, false);
        }
    }
    function unloadHandler() {
        for (let i in Request.requests) {
            if (Request.requests.hasOwnProperty(i)) {
                Request.requests[i].abort();
            }
        }
    }

    const nextTick$3 = (() => {
        const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
        if (isPromiseAvailable) {
            return (cb) => Promise.resolve().then(cb);
        }
        else {
            return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
        }
    })();
    const WebSocket = globalThisShim.WebSocket || globalThisShim.MozWebSocket;
    const usingBrowserWebSocket = true;
    const defaultBinaryType = "arraybuffer";

    // detect ReactNative environment
    const isReactNative = typeof navigator !== "undefined" &&
        typeof navigator.product === "string" &&
        navigator.product.toLowerCase() === "reactnative";
    class WS extends Transport {
        /**
         * WebSocket transport constructor.
         *
         * @param {Object} opts - connection options
         * @protected
         */
        constructor(opts) {
            super(opts);
            this.supportsBinary = !opts.forceBase64;
        }
        get name() {
            return "websocket";
        }
        doOpen() {
            if (!this.check()) {
                // let probe timeout
                return;
            }
            const uri = this.uri();
            const protocols = this.opts.protocols;
            // React Native only supports the 'headers' option, and will print a warning if anything else is passed
            const opts = isReactNative
                ? {}
                : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
            if (this.opts.extraHeaders) {
                opts.headers = this.opts.extraHeaders;
            }
            try {
                this.ws =
                    usingBrowserWebSocket && !isReactNative
                        ? protocols
                            ? new WebSocket(uri, protocols)
                            : new WebSocket(uri)
                        : new WebSocket(uri, protocols, opts);
            }
            catch (err) {
                return this.emitReserved("error", err);
            }
            this.ws.binaryType = this.socket.binaryType || defaultBinaryType;
            this.addEventListeners();
        }
        /**
         * Adds event listeners to the socket
         *
         * @private
         */
        addEventListeners() {
            this.ws.onopen = () => {
                if (this.opts.autoUnref) {
                    this.ws._socket.unref();
                }
                this.onOpen();
            };
            this.ws.onclose = (closeEvent) => this.onClose({
                description: "websocket connection closed",
                context: closeEvent,
            });
            this.ws.onmessage = (ev) => this.onData(ev.data);
            this.ws.onerror = (e) => this.onError("websocket error", e);
        }
        write(packets) {
            this.writable = false;
            // encodePacket efficient as it uses WS framing
            // no need for encodePayload
            for (let i = 0; i < packets.length; i++) {
                const packet = packets[i];
                const lastPacket = i === packets.length - 1;
                encodePacket(packet, this.supportsBinary, (data) => {
                    // always create a new object (GH-437)
                    const opts = {};
                    // Sometimes the websocket has already been closed but the browser didn't
                    // have a chance of informing us about it yet, in that case send will
                    // throw an error
                    try {
                        if (usingBrowserWebSocket) {
                            // TypeError is thrown when passing the second argument on Safari
                            this.ws.send(data);
                        }
                    }
                    catch (e) {
                    }
                    if (lastPacket) {
                        // fake drain
                        // defer to next tick to allow Socket to clear writeBuffer
                        nextTick$3(() => {
                            this.writable = true;
                            this.emitReserved("drain");
                        }, this.setTimeoutFn);
                    }
                });
            }
        }
        doClose() {
            if (typeof this.ws !== "undefined") {
                this.ws.close();
                this.ws = null;
            }
        }
        /**
         * Generates uri for connection.
         *
         * @private
         */
        uri() {
            let query = this.query || {};
            const schema = this.opts.secure ? "wss" : "ws";
            let port = "";
            // avoid port if default for schema
            if (this.opts.port &&
                (("wss" === schema && Number(this.opts.port) !== 443) ||
                    ("ws" === schema && Number(this.opts.port) !== 80))) {
                port = ":" + this.opts.port;
            }
            // append timestamp to URI
            if (this.opts.timestampRequests) {
                query[this.opts.timestampParam] = yeast();
            }
            // communicate binary support capabilities
            if (!this.supportsBinary) {
                query.b64 = 1;
            }
            const encodedQuery = encode(query);
            const ipv6 = this.opts.hostname.indexOf(":") !== -1;
            return (schema +
                "://" +
                (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
                port +
                this.opts.path +
                (encodedQuery.length ? "?" + encodedQuery : ""));
        }
        /**
         * Feature detection for WebSocket.
         *
         * @return {Boolean} whether this transport is available.
         * @private
         */
        check() {
            return !!WebSocket;
        }
    }

    const transports = {
        websocket: WS,
        polling: Polling,
    };

    // imported from https://github.com/galkn/parseuri
    /**
     * Parses a URI
     *
     * Note: we could also have used the built-in URL object, but it isn't supported on all platforms.
     *
     * See:
     * - https://developer.mozilla.org/en-US/docs/Web/API/URL
     * - https://caniuse.com/url
     * - https://www.rfc-editor.org/rfc/rfc3986#appendix-B
     *
     * History of the parse() method:
     * - first commit: https://github.com/socketio/socket.io-client/commit/4ee1d5d94b3906a9c052b459f1a818b15f38f91c
     * - export into its own module: https://github.com/socketio/engine.io-client/commit/de2c561e4564efeb78f1bdb1ba39ef81b2822cb3
     * - reimport: https://github.com/socketio/engine.io-client/commit/df32277c3f6d622eec5ed09f493cae3f3391d242
     *
     * @author Steven Levithan <stevenlevithan.com> (MIT license)
     * @api private
     */
    const re = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
    const parts = [
        'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
    ];
    function parse(str) {
        const src = str, b = str.indexOf('['), e = str.indexOf(']');
        if (b != -1 && e != -1) {
            str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
        }
        let m = re.exec(str || ''), uri = {}, i = 14;
        while (i--) {
            uri[parts[i]] = m[i] || '';
        }
        if (b != -1 && e != -1) {
            uri.source = src;
            uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
            uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
            uri.ipv6uri = true;
        }
        uri.pathNames = pathNames(uri, uri['path']);
        uri.queryKey = queryKey(uri, uri['query']);
        return uri;
    }
    function pathNames(obj, path) {
        const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
        if (path.slice(0, 1) == '/' || path.length === 0) {
            names.splice(0, 1);
        }
        if (path.slice(-1) == '/') {
            names.splice(names.length - 1, 1);
        }
        return names;
    }
    function queryKey(uri, query) {
        const data = {};
        query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
            if ($1) {
                data[$1] = $2;
            }
        });
        return data;
    }

    class Socket$1 extends Emitter {
        /**
         * Socket constructor.
         *
         * @param {String|Object} uri - uri or options
         * @param {Object} opts - options
         */
        constructor(uri, opts = {}) {
            super();
            this.writeBuffer = [];
            if (uri && "object" === typeof uri) {
                opts = uri;
                uri = null;
            }
            if (uri) {
                uri = parse(uri);
                opts.hostname = uri.host;
                opts.secure = uri.protocol === "https" || uri.protocol === "wss";
                opts.port = uri.port;
                if (uri.query)
                    opts.query = uri.query;
            }
            else if (opts.host) {
                opts.hostname = parse(opts.host).host;
            }
            installTimerFunctions(this, opts);
            this.secure =
                null != opts.secure
                    ? opts.secure
                    : typeof location !== "undefined" && "https:" === location.protocol;
            if (opts.hostname && !opts.port) {
                // if no port is specified manually, use the protocol default
                opts.port = this.secure ? "443" : "80";
            }
            this.hostname =
                opts.hostname ||
                    (typeof location !== "undefined" ? location.hostname : "localhost");
            this.port =
                opts.port ||
                    (typeof location !== "undefined" && location.port
                        ? location.port
                        : this.secure
                            ? "443"
                            : "80");
            this.transports = opts.transports || ["polling", "websocket"];
            this.writeBuffer = [];
            this.prevBufferLen = 0;
            this.opts = Object.assign({
                path: "/engine.io",
                agent: false,
                withCredentials: false,
                upgrade: true,
                timestampParam: "t",
                rememberUpgrade: false,
                addTrailingSlash: true,
                rejectUnauthorized: true,
                perMessageDeflate: {
                    threshold: 1024,
                },
                transportOptions: {},
                closeOnBeforeunload: true,
            }, opts);
            this.opts.path =
                this.opts.path.replace(/\/$/, "") +
                    (this.opts.addTrailingSlash ? "/" : "");
            if (typeof this.opts.query === "string") {
                this.opts.query = decode(this.opts.query);
            }
            // set on handshake
            this.id = null;
            this.upgrades = null;
            this.pingInterval = null;
            this.pingTimeout = null;
            // set on heartbeat
            this.pingTimeoutTimer = null;
            if (typeof addEventListener === "function") {
                if (this.opts.closeOnBeforeunload) {
                    // Firefox closes the connection when the "beforeunload" event is emitted but not Chrome. This event listener
                    // ensures every browser behaves the same (no "disconnect" event at the Socket.IO level when the page is
                    // closed/reloaded)
                    this.beforeunloadEventListener = () => {
                        if (this.transport) {
                            // silently close the transport
                            this.transport.removeAllListeners();
                            this.transport.close();
                        }
                    };
                    addEventListener("beforeunload", this.beforeunloadEventListener, false);
                }
                if (this.hostname !== "localhost") {
                    this.offlineEventListener = () => {
                        this.onClose("transport close", {
                            description: "network connection lost",
                        });
                    };
                    addEventListener("offline", this.offlineEventListener, false);
                }
            }
            this.open();
        }
        /**
         * Creates transport of the given type.
         *
         * @param {String} name - transport name
         * @return {Transport}
         * @private
         */
        createTransport(name) {
            const query = Object.assign({}, this.opts.query);
            // append engine.io protocol identifier
            query.EIO = protocol$1;
            // transport name
            query.transport = name;
            // session id if we already have one
            if (this.id)
                query.sid = this.id;
            const opts = Object.assign({}, this.opts.transportOptions[name], this.opts, {
                query,
                socket: this,
                hostname: this.hostname,
                secure: this.secure,
                port: this.port,
            });
            return new transports[name](opts);
        }
        /**
         * Initializes transport to use and starts probe.
         *
         * @private
         */
        open() {
            let transport;
            if (this.opts.rememberUpgrade &&
                Socket$1.priorWebsocketSuccess &&
                this.transports.indexOf("websocket") !== -1) {
                transport = "websocket";
            }
            else if (0 === this.transports.length) {
                // Emit error on next tick so it can be listened to
                this.setTimeoutFn(() => {
                    this.emitReserved("error", "No transports available");
                }, 0);
                return;
            }
            else {
                transport = this.transports[0];
            }
            this.readyState = "opening";
            // Retry with the next transport if the transport is disabled (jsonp: false)
            try {
                transport = this.createTransport(transport);
            }
            catch (e) {
                this.transports.shift();
                this.open();
                return;
            }
            transport.open();
            this.setTransport(transport);
        }
        /**
         * Sets the current transport. Disables the existing one (if any).
         *
         * @private
         */
        setTransport(transport) {
            if (this.transport) {
                this.transport.removeAllListeners();
            }
            // set up transport
            this.transport = transport;
            // set up transport listeners
            transport
                .on("drain", this.onDrain.bind(this))
                .on("packet", this.onPacket.bind(this))
                .on("error", this.onError.bind(this))
                .on("close", (reason) => this.onClose("transport close", reason));
        }
        /**
         * Probes a transport.
         *
         * @param {String} name - transport name
         * @private
         */
        probe(name) {
            let transport = this.createTransport(name);
            let failed = false;
            Socket$1.priorWebsocketSuccess = false;
            const onTransportOpen = () => {
                if (failed)
                    return;
                transport.send([{ type: "ping", data: "probe" }]);
                transport.once("packet", (msg) => {
                    if (failed)
                        return;
                    if ("pong" === msg.type && "probe" === msg.data) {
                        this.upgrading = true;
                        this.emitReserved("upgrading", transport);
                        if (!transport)
                            return;
                        Socket$1.priorWebsocketSuccess = "websocket" === transport.name;
                        this.transport.pause(() => {
                            if (failed)
                                return;
                            if ("closed" === this.readyState)
                                return;
                            cleanup();
                            this.setTransport(transport);
                            transport.send([{ type: "upgrade" }]);
                            this.emitReserved("upgrade", transport);
                            transport = null;
                            this.upgrading = false;
                            this.flush();
                        });
                    }
                    else {
                        const err = new Error("probe error");
                        // @ts-ignore
                        err.transport = transport.name;
                        this.emitReserved("upgradeError", err);
                    }
                });
            };
            function freezeTransport() {
                if (failed)
                    return;
                // Any callback called by transport should be ignored since now
                failed = true;
                cleanup();
                transport.close();
                transport = null;
            }
            // Handle any error that happens while probing
            const onerror = (err) => {
                const error = new Error("probe error: " + err);
                // @ts-ignore
                error.transport = transport.name;
                freezeTransport();
                this.emitReserved("upgradeError", error);
            };
            function onTransportClose() {
                onerror("transport closed");
            }
            // When the socket is closed while we're probing
            function onclose() {
                onerror("socket closed");
            }
            // When the socket is upgraded while we're probing
            function onupgrade(to) {
                if (transport && to.name !== transport.name) {
                    freezeTransport();
                }
            }
            // Remove all listeners on the transport and on self
            const cleanup = () => {
                transport.removeListener("open", onTransportOpen);
                transport.removeListener("error", onerror);
                transport.removeListener("close", onTransportClose);
                this.off("close", onclose);
                this.off("upgrading", onupgrade);
            };
            transport.once("open", onTransportOpen);
            transport.once("error", onerror);
            transport.once("close", onTransportClose);
            this.once("close", onclose);
            this.once("upgrading", onupgrade);
            transport.open();
        }
        /**
         * Called when connection is deemed open.
         *
         * @private
         */
        onOpen() {
            this.readyState = "open";
            Socket$1.priorWebsocketSuccess = "websocket" === this.transport.name;
            this.emitReserved("open");
            this.flush();
            // we check for `readyState` in case an `open`
            // listener already closed the socket
            if ("open" === this.readyState && this.opts.upgrade) {
                let i = 0;
                const l = this.upgrades.length;
                for (; i < l; i++) {
                    this.probe(this.upgrades[i]);
                }
            }
        }
        /**
         * Handles a packet.
         *
         * @private
         */
        onPacket(packet) {
            if ("opening" === this.readyState ||
                "open" === this.readyState ||
                "closing" === this.readyState) {
                this.emitReserved("packet", packet);
                // Socket is live - any packet counts
                this.emitReserved("heartbeat");
                switch (packet.type) {
                    case "open":
                        this.onHandshake(JSON.parse(packet.data));
                        break;
                    case "ping":
                        this.resetPingTimeout();
                        this.sendPacket("pong");
                        this.emitReserved("ping");
                        this.emitReserved("pong");
                        break;
                    case "error":
                        const err = new Error("server error");
                        // @ts-ignore
                        err.code = packet.data;
                        this.onError(err);
                        break;
                    case "message":
                        this.emitReserved("data", packet.data);
                        this.emitReserved("message", packet.data);
                        break;
                }
            }
        }
        /**
         * Called upon handshake completion.
         *
         * @param {Object} data - handshake obj
         * @private
         */
        onHandshake(data) {
            this.emitReserved("handshake", data);
            this.id = data.sid;
            this.transport.query.sid = data.sid;
            this.upgrades = this.filterUpgrades(data.upgrades);
            this.pingInterval = data.pingInterval;
            this.pingTimeout = data.pingTimeout;
            this.maxPayload = data.maxPayload;
            this.onOpen();
            // In case open handler closes socket
            if ("closed" === this.readyState)
                return;
            this.resetPingTimeout();
        }
        /**
         * Sets and resets ping timeout timer based on server pings.
         *
         * @private
         */
        resetPingTimeout() {
            this.clearTimeoutFn(this.pingTimeoutTimer);
            this.pingTimeoutTimer = this.setTimeoutFn(() => {
                this.onClose("ping timeout");
            }, this.pingInterval + this.pingTimeout);
            if (this.opts.autoUnref) {
                this.pingTimeoutTimer.unref();
            }
        }
        /**
         * Called on `drain` event
         *
         * @private
         */
        onDrain() {
            this.writeBuffer.splice(0, this.prevBufferLen);
            // setting prevBufferLen = 0 is very important
            // for example, when upgrading, upgrade packet is sent over,
            // and a nonzero prevBufferLen could cause problems on `drain`
            this.prevBufferLen = 0;
            if (0 === this.writeBuffer.length) {
                this.emitReserved("drain");
            }
            else {
                this.flush();
            }
        }
        /**
         * Flush write buffers.
         *
         * @private
         */
        flush() {
            if ("closed" !== this.readyState &&
                this.transport.writable &&
                !this.upgrading &&
                this.writeBuffer.length) {
                const packets = this.getWritablePackets();
                this.transport.send(packets);
                // keep track of current length of writeBuffer
                // splice writeBuffer and callbackBuffer on `drain`
                this.prevBufferLen = packets.length;
                this.emitReserved("flush");
            }
        }
        /**
         * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
         * long-polling)
         *
         * @private
         */
        getWritablePackets() {
            const shouldCheckPayloadSize = this.maxPayload &&
                this.transport.name === "polling" &&
                this.writeBuffer.length > 1;
            if (!shouldCheckPayloadSize) {
                return this.writeBuffer;
            }
            let payloadSize = 1; // first packet type
            for (let i = 0; i < this.writeBuffer.length; i++) {
                const data = this.writeBuffer[i].data;
                if (data) {
                    payloadSize += byteLength(data);
                }
                if (i > 0 && payloadSize > this.maxPayload) {
                    return this.writeBuffer.slice(0, i);
                }
                payloadSize += 2; // separator + packet type
            }
            return this.writeBuffer;
        }
        /**
         * Sends a message.
         *
         * @param {String} msg - message.
         * @param {Object} options.
         * @param {Function} callback function.
         * @return {Socket} for chaining.
         */
        write(msg, options, fn) {
            this.sendPacket("message", msg, options, fn);
            return this;
        }
        send(msg, options, fn) {
            this.sendPacket("message", msg, options, fn);
            return this;
        }
        /**
         * Sends a packet.
         *
         * @param {String} type: packet type.
         * @param {String} data.
         * @param {Object} options.
         * @param {Function} fn - callback function.
         * @private
         */
        sendPacket(type, data, options, fn) {
            if ("function" === typeof data) {
                fn = data;
                data = undefined;
            }
            if ("function" === typeof options) {
                fn = options;
                options = null;
            }
            if ("closing" === this.readyState || "closed" === this.readyState) {
                return;
            }
            options = options || {};
            options.compress = false !== options.compress;
            const packet = {
                type: type,
                data: data,
                options: options,
            };
            this.emitReserved("packetCreate", packet);
            this.writeBuffer.push(packet);
            if (fn)
                this.once("flush", fn);
            this.flush();
        }
        /**
         * Closes the connection.
         */
        close() {
            const close = () => {
                this.onClose("forced close");
                this.transport.close();
            };
            const cleanupAndClose = () => {
                this.off("upgrade", cleanupAndClose);
                this.off("upgradeError", cleanupAndClose);
                close();
            };
            const waitForUpgrade = () => {
                // wait for upgrade to finish since we can't send packets while pausing a transport
                this.once("upgrade", cleanupAndClose);
                this.once("upgradeError", cleanupAndClose);
            };
            if ("opening" === this.readyState || "open" === this.readyState) {
                this.readyState = "closing";
                if (this.writeBuffer.length) {
                    this.once("drain", () => {
                        if (this.upgrading) {
                            waitForUpgrade();
                        }
                        else {
                            close();
                        }
                    });
                }
                else if (this.upgrading) {
                    waitForUpgrade();
                }
                else {
                    close();
                }
            }
            return this;
        }
        /**
         * Called upon transport error
         *
         * @private
         */
        onError(err) {
            Socket$1.priorWebsocketSuccess = false;
            this.emitReserved("error", err);
            this.onClose("transport error", err);
        }
        /**
         * Called upon transport close.
         *
         * @private
         */
        onClose(reason, description) {
            if ("opening" === this.readyState ||
                "open" === this.readyState ||
                "closing" === this.readyState) {
                // clear timers
                this.clearTimeoutFn(this.pingTimeoutTimer);
                // stop event from firing again for transport
                this.transport.removeAllListeners("close");
                // ensure transport won't stay open
                this.transport.close();
                // ignore further transport communication
                this.transport.removeAllListeners();
                if (typeof removeEventListener === "function") {
                    removeEventListener("beforeunload", this.beforeunloadEventListener, false);
                    removeEventListener("offline", this.offlineEventListener, false);
                }
                // set ready state
                this.readyState = "closed";
                // clear session id
                this.id = null;
                // emit close event
                this.emitReserved("close", reason, description);
                // clean buffers after, so users can still
                // grab the buffers on `close` event
                this.writeBuffer = [];
                this.prevBufferLen = 0;
            }
        }
        /**
         * Filters upgrades, returning only those matching client transports.
         *
         * @param {Array} upgrades - server upgrades
         * @private
         */
        filterUpgrades(upgrades) {
            const filteredUpgrades = [];
            let i = 0;
            const j = upgrades.length;
            for (; i < j; i++) {
                if (~this.transports.indexOf(upgrades[i]))
                    filteredUpgrades.push(upgrades[i]);
            }
            return filteredUpgrades;
        }
    }
    Socket$1.protocol = protocol$1;

    /**
     * URL parser.
     *
     * @param uri - url
     * @param path - the request path of the connection
     * @param loc - An object meant to mimic window.location.
     *        Defaults to window.location.
     * @public
     */
    function url(uri, path = "", loc) {
        let obj = uri;
        // default to window.location
        loc = loc || (typeof location !== "undefined" && location);
        if (null == uri)
            uri = loc.protocol + "//" + loc.host;
        // relative path support
        if (typeof uri === "string") {
            if ("/" === uri.charAt(0)) {
                if ("/" === uri.charAt(1)) {
                    uri = loc.protocol + uri;
                }
                else {
                    uri = loc.host + uri;
                }
            }
            if (!/^(https?|wss?):\/\//.test(uri)) {
                if ("undefined" !== typeof loc) {
                    uri = loc.protocol + "//" + uri;
                }
                else {
                    uri = "https://" + uri;
                }
            }
            // parse
            obj = parse(uri);
        }
        // make sure we treat `localhost:80` and `localhost` equally
        if (!obj.port) {
            if (/^(http|ws)$/.test(obj.protocol)) {
                obj.port = "80";
            }
            else if (/^(http|ws)s$/.test(obj.protocol)) {
                obj.port = "443";
            }
        }
        obj.path = obj.path || "/";
        const ipv6 = obj.host.indexOf(":") !== -1;
        const host = ipv6 ? "[" + obj.host + "]" : obj.host;
        // define unique id
        obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
        // define href
        obj.href =
            obj.protocol +
                "://" +
                host +
                (loc && loc.port === obj.port ? "" : ":" + obj.port);
        return obj;
    }

    const withNativeArrayBuffer = typeof ArrayBuffer === "function";
    const isView = (obj) => {
        return typeof ArrayBuffer.isView === "function"
            ? ArrayBuffer.isView(obj)
            : obj.buffer instanceof ArrayBuffer;
    };
    const toString = Object.prototype.toString;
    const withNativeBlob = typeof Blob === "function" ||
        (typeof Blob !== "undefined" &&
            toString.call(Blob) === "[object BlobConstructor]");
    const withNativeFile = typeof File === "function" ||
        (typeof File !== "undefined" &&
            toString.call(File) === "[object FileConstructor]");
    /**
     * Returns true if obj is a Buffer, an ArrayBuffer, a Blob or a File.
     *
     * @private
     */
    function isBinary(obj) {
        return ((withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj))) ||
            (withNativeBlob && obj instanceof Blob) ||
            (withNativeFile && obj instanceof File));
    }
    function hasBinary(obj, toJSON) {
        if (!obj || typeof obj !== "object") {
            return false;
        }
        if (Array.isArray(obj)) {
            for (let i = 0, l = obj.length; i < l; i++) {
                if (hasBinary(obj[i])) {
                    return true;
                }
            }
            return false;
        }
        if (isBinary(obj)) {
            return true;
        }
        if (obj.toJSON &&
            typeof obj.toJSON === "function" &&
            arguments.length === 1) {
            return hasBinary(obj.toJSON(), true);
        }
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Replaces every Buffer | ArrayBuffer | Blob | File in packet with a numbered placeholder.
     *
     * @param {Object} packet - socket.io event packet
     * @return {Object} with deconstructed packet and list of buffers
     * @public
     */
    function deconstructPacket(packet) {
        const buffers = [];
        const packetData = packet.data;
        const pack = packet;
        pack.data = _deconstructPacket(packetData, buffers);
        pack.attachments = buffers.length; // number of binary 'attachments'
        return { packet: pack, buffers: buffers };
    }
    function _deconstructPacket(data, buffers) {
        if (!data)
            return data;
        if (isBinary(data)) {
            const placeholder = { _placeholder: true, num: buffers.length };
            buffers.push(data);
            return placeholder;
        }
        else if (Array.isArray(data)) {
            const newData = new Array(data.length);
            for (let i = 0; i < data.length; i++) {
                newData[i] = _deconstructPacket(data[i], buffers);
            }
            return newData;
        }
        else if (typeof data === "object" && !(data instanceof Date)) {
            const newData = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    newData[key] = _deconstructPacket(data[key], buffers);
                }
            }
            return newData;
        }
        return data;
    }
    /**
     * Reconstructs a binary packet from its placeholder packet and buffers
     *
     * @param {Object} packet - event packet with placeholders
     * @param {Array} buffers - binary buffers to put in placeholder positions
     * @return {Object} reconstructed packet
     * @public
     */
    function reconstructPacket(packet, buffers) {
        packet.data = _reconstructPacket(packet.data, buffers);
        delete packet.attachments; // no longer useful
        return packet;
    }
    function _reconstructPacket(data, buffers) {
        if (!data)
            return data;
        if (data && data._placeholder === true) {
            const isIndexValid = typeof data.num === "number" &&
                data.num >= 0 &&
                data.num < buffers.length;
            if (isIndexValid) {
                return buffers[data.num]; // appropriate buffer (should be natural order anyway)
            }
            else {
                throw new Error("illegal attachments");
            }
        }
        else if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                data[i] = _reconstructPacket(data[i], buffers);
            }
        }
        else if (typeof data === "object") {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    data[key] = _reconstructPacket(data[key], buffers);
                }
            }
        }
        return data;
    }

    /**
     * Protocol version.
     *
     * @public
     */
    const protocol = 5;
    var PacketType;
    (function (PacketType) {
        PacketType[PacketType["CONNECT"] = 0] = "CONNECT";
        PacketType[PacketType["DISCONNECT"] = 1] = "DISCONNECT";
        PacketType[PacketType["EVENT"] = 2] = "EVENT";
        PacketType[PacketType["ACK"] = 3] = "ACK";
        PacketType[PacketType["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
        PacketType[PacketType["BINARY_EVENT"] = 5] = "BINARY_EVENT";
        PacketType[PacketType["BINARY_ACK"] = 6] = "BINARY_ACK";
    })(PacketType || (PacketType = {}));
    /**
     * A socket.io Encoder instance
     */
    class Encoder {
        /**
         * Encoder constructor
         *
         * @param {function} replacer - custom replacer to pass down to JSON.parse
         */
        constructor(replacer) {
            this.replacer = replacer;
        }
        /**
         * Encode a packet as a single string if non-binary, or as a
         * buffer sequence, depending on packet type.
         *
         * @param {Object} obj - packet object
         */
        encode(obj) {
            if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
                if (hasBinary(obj)) {
                    return this.encodeAsBinary({
                        type: obj.type === PacketType.EVENT
                            ? PacketType.BINARY_EVENT
                            : PacketType.BINARY_ACK,
                        nsp: obj.nsp,
                        data: obj.data,
                        id: obj.id,
                    });
                }
            }
            return [this.encodeAsString(obj)];
        }
        /**
         * Encode packet as string.
         */
        encodeAsString(obj) {
            // first is type
            let str = "" + obj.type;
            // attachments if we have them
            if (obj.type === PacketType.BINARY_EVENT ||
                obj.type === PacketType.BINARY_ACK) {
                str += obj.attachments + "-";
            }
            // if we have a namespace other than `/`
            // we append it followed by a comma `,`
            if (obj.nsp && "/" !== obj.nsp) {
                str += obj.nsp + ",";
            }
            // immediately followed by the id
            if (null != obj.id) {
                str += obj.id;
            }
            // json data
            if (null != obj.data) {
                str += JSON.stringify(obj.data, this.replacer);
            }
            return str;
        }
        /**
         * Encode packet as 'buffer sequence' by removing blobs, and
         * deconstructing packet into object with placeholders and
         * a list of buffers.
         */
        encodeAsBinary(obj) {
            const deconstruction = deconstructPacket(obj);
            const pack = this.encodeAsString(deconstruction.packet);
            const buffers = deconstruction.buffers;
            buffers.unshift(pack); // add packet info to beginning of data list
            return buffers; // write all the buffers
        }
    }
    /**
     * A socket.io Decoder instance
     *
     * @return {Object} decoder
     */
    class Decoder extends Emitter {
        /**
         * Decoder constructor
         *
         * @param {function} reviver - custom reviver to pass down to JSON.stringify
         */
        constructor(reviver) {
            super();
            this.reviver = reviver;
        }
        /**
         * Decodes an encoded packet string into packet JSON.
         *
         * @param {String} obj - encoded packet
         */
        add(obj) {
            let packet;
            if (typeof obj === "string") {
                if (this.reconstructor) {
                    throw new Error("got plaintext data when reconstructing a packet");
                }
                packet = this.decodeString(obj);
                const isBinaryEvent = packet.type === PacketType.BINARY_EVENT;
                if (isBinaryEvent || packet.type === PacketType.BINARY_ACK) {
                    packet.type = isBinaryEvent ? PacketType.EVENT : PacketType.ACK;
                    // binary packet's json
                    this.reconstructor = new BinaryReconstructor(packet);
                    // no attachments, labeled binary but no binary data to follow
                    if (packet.attachments === 0) {
                        super.emitReserved("decoded", packet);
                    }
                }
                else {
                    // non-binary full packet
                    super.emitReserved("decoded", packet);
                }
            }
            else if (isBinary(obj) || obj.base64) {
                // raw binary data
                if (!this.reconstructor) {
                    throw new Error("got binary data when not reconstructing a packet");
                }
                else {
                    packet = this.reconstructor.takeBinaryData(obj);
                    if (packet) {
                        // received final buffer
                        this.reconstructor = null;
                        super.emitReserved("decoded", packet);
                    }
                }
            }
            else {
                throw new Error("Unknown type: " + obj);
            }
        }
        /**
         * Decode a packet String (JSON data)
         *
         * @param {String} str
         * @return {Object} packet
         */
        decodeString(str) {
            let i = 0;
            // look up type
            const p = {
                type: Number(str.charAt(0)),
            };
            if (PacketType[p.type] === undefined) {
                throw new Error("unknown packet type " + p.type);
            }
            // look up attachments if type binary
            if (p.type === PacketType.BINARY_EVENT ||
                p.type === PacketType.BINARY_ACK) {
                const start = i + 1;
                while (str.charAt(++i) !== "-" && i != str.length) { }
                const buf = str.substring(start, i);
                if (buf != Number(buf) || str.charAt(i) !== "-") {
                    throw new Error("Illegal attachments");
                }
                p.attachments = Number(buf);
            }
            // look up namespace (if any)
            if ("/" === str.charAt(i + 1)) {
                const start = i + 1;
                while (++i) {
                    const c = str.charAt(i);
                    if ("," === c)
                        break;
                    if (i === str.length)
                        break;
                }
                p.nsp = str.substring(start, i);
            }
            else {
                p.nsp = "/";
            }
            // look up id
            const next = str.charAt(i + 1);
            if ("" !== next && Number(next) == next) {
                const start = i + 1;
                while (++i) {
                    const c = str.charAt(i);
                    if (null == c || Number(c) != c) {
                        --i;
                        break;
                    }
                    if (i === str.length)
                        break;
                }
                p.id = Number(str.substring(start, i + 1));
            }
            // look up json data
            if (str.charAt(++i)) {
                const payload = this.tryParse(str.substr(i));
                if (Decoder.isPayloadValid(p.type, payload)) {
                    p.data = payload;
                }
                else {
                    throw new Error("invalid payload");
                }
            }
            return p;
        }
        tryParse(str) {
            try {
                return JSON.parse(str, this.reviver);
            }
            catch (e) {
                return false;
            }
        }
        static isPayloadValid(type, payload) {
            switch (type) {
                case PacketType.CONNECT:
                    return typeof payload === "object";
                case PacketType.DISCONNECT:
                    return payload === undefined;
                case PacketType.CONNECT_ERROR:
                    return typeof payload === "string" || typeof payload === "object";
                case PacketType.EVENT:
                case PacketType.BINARY_EVENT:
                    return Array.isArray(payload) && payload.length > 0;
                case PacketType.ACK:
                case PacketType.BINARY_ACK:
                    return Array.isArray(payload);
            }
        }
        /**
         * Deallocates a parser's resources
         */
        destroy() {
            if (this.reconstructor) {
                this.reconstructor.finishedReconstruction();
                this.reconstructor = null;
            }
        }
    }
    /**
     * A manager of a binary event's 'buffer sequence'. Should
     * be constructed whenever a packet of type BINARY_EVENT is
     * decoded.
     *
     * @param {Object} packet
     * @return {BinaryReconstructor} initialized reconstructor
     */
    class BinaryReconstructor {
        constructor(packet) {
            this.packet = packet;
            this.buffers = [];
            this.reconPack = packet;
        }
        /**
         * Method to be called when binary data received from connection
         * after a BINARY_EVENT packet.
         *
         * @param {Buffer | ArrayBuffer} binData - the raw binary data received
         * @return {null | Object} returns null if more binary data is expected or
         *   a reconstructed packet object if all buffers have been received.
         */
        takeBinaryData(binData) {
            this.buffers.push(binData);
            if (this.buffers.length === this.reconPack.attachments) {
                // done with buffer list
                const packet = reconstructPacket(this.reconPack, this.buffers);
                this.finishedReconstruction();
                return packet;
            }
            return null;
        }
        /**
         * Cleans up binary packet reconstruction variables.
         */
        finishedReconstruction() {
            this.reconPack = null;
            this.buffers = [];
        }
    }

    var parser = /*#__PURE__*/Object.freeze({
        __proto__: null,
        protocol: protocol,
        get PacketType () { return PacketType; },
        Encoder: Encoder,
        Decoder: Decoder
    });

    function on(obj, ev, fn) {
        obj.on(ev, fn);
        return function subDestroy() {
            obj.off(ev, fn);
        };
    }

    /**
     * Internal events.
     * These events can't be emitted by the user.
     */
    const RESERVED_EVENTS = Object.freeze({
        connect: 1,
        connect_error: 1,
        disconnect: 1,
        disconnecting: 1,
        // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
        newListener: 1,
        removeListener: 1,
    });
    /**
     * A Socket is the fundamental class for interacting with the server.
     *
     * A Socket belongs to a certain Namespace (by default /) and uses an underlying {@link Manager} to communicate.
     *
     * @example
     * const socket = io();
     *
     * socket.on("connect", () => {
     *   console.log("connected");
     * });
     *
     * // send an event to the server
     * socket.emit("foo", "bar");
     *
     * socket.on("foobar", () => {
     *   // an event was received from the server
     * });
     *
     * // upon disconnection
     * socket.on("disconnect", (reason) => {
     *   console.log(`disconnected due to ${reason}`);
     * });
     */
    class Socket extends Emitter {
        /**
         * `Socket` constructor.
         */
        constructor(io, nsp, opts) {
            super();
            /**
             * Whether the socket is currently connected to the server.
             *
             * @example
             * const socket = io();
             *
             * socket.on("connect", () => {
             *   console.log(socket.connected); // true
             * });
             *
             * socket.on("disconnect", () => {
             *   console.log(socket.connected); // false
             * });
             */
            this.connected = false;
            /**
             * Whether the connection state was recovered after a temporary disconnection. In that case, any missed packets will
             * be transmitted by the server.
             */
            this.recovered = false;
            /**
             * Buffer for packets received before the CONNECT packet
             */
            this.receiveBuffer = [];
            /**
             * Buffer for packets that will be sent once the socket is connected
             */
            this.sendBuffer = [];
            /**
             * The queue of packets to be sent with retry in case of failure.
             *
             * Packets are sent one by one, each waiting for the server acknowledgement, in order to guarantee the delivery order.
             * @private
             */
            this._queue = [];
            /**
             * A sequence to generate the ID of the {@link QueuedPacket}.
             * @private
             */
            this._queueSeq = 0;
            this.ids = 0;
            this.acks = {};
            this.flags = {};
            this.io = io;
            this.nsp = nsp;
            if (opts && opts.auth) {
                this.auth = opts.auth;
            }
            this._opts = Object.assign({}, opts);
            if (this.io._autoConnect)
                this.open();
        }
        /**
         * Whether the socket is currently disconnected
         *
         * @example
         * const socket = io();
         *
         * socket.on("connect", () => {
         *   console.log(socket.disconnected); // false
         * });
         *
         * socket.on("disconnect", () => {
         *   console.log(socket.disconnected); // true
         * });
         */
        get disconnected() {
            return !this.connected;
        }
        /**
         * Subscribe to open, close and packet events
         *
         * @private
         */
        subEvents() {
            if (this.subs)
                return;
            const io = this.io;
            this.subs = [
                on(io, "open", this.onopen.bind(this)),
                on(io, "packet", this.onpacket.bind(this)),
                on(io, "error", this.onerror.bind(this)),
                on(io, "close", this.onclose.bind(this)),
            ];
        }
        /**
         * Whether the Socket will try to reconnect when its Manager connects or reconnects.
         *
         * @example
         * const socket = io();
         *
         * console.log(socket.active); // true
         *
         * socket.on("disconnect", (reason) => {
         *   if (reason === "io server disconnect") {
         *     // the disconnection was initiated by the server, you need to manually reconnect
         *     console.log(socket.active); // false
         *   }
         *   // else the socket will automatically try to reconnect
         *   console.log(socket.active); // true
         * });
         */
        get active() {
            return !!this.subs;
        }
        /**
         * "Opens" the socket.
         *
         * @example
         * const socket = io({
         *   autoConnect: false
         * });
         *
         * socket.connect();
         */
        connect() {
            if (this.connected)
                return this;
            this.subEvents();
            if (!this.io["_reconnecting"])
                this.io.open(); // ensure open
            if ("open" === this.io._readyState)
                this.onopen();
            return this;
        }
        /**
         * Alias for {@link connect()}.
         */
        open() {
            return this.connect();
        }
        /**
         * Sends a `message` event.
         *
         * This method mimics the WebSocket.send() method.
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
         *
         * @example
         * socket.send("hello");
         *
         * // this is equivalent to
         * socket.emit("message", "hello");
         *
         * @return self
         */
        send(...args) {
            args.unshift("message");
            this.emit.apply(this, args);
            return this;
        }
        /**
         * Override `emit`.
         * If the event is in `events`, it's emitted normally.
         *
         * @example
         * socket.emit("hello", "world");
         *
         * // all serializable datastructures are supported (no need to call JSON.stringify)
         * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
         *
         * // with an acknowledgement from the server
         * socket.emit("hello", "world", (val) => {
         *   // ...
         * });
         *
         * @return self
         */
        emit(ev, ...args) {
            if (RESERVED_EVENTS.hasOwnProperty(ev)) {
                throw new Error('"' + ev.toString() + '" is a reserved event name');
            }
            args.unshift(ev);
            if (this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) {
                this._addToQueue(args);
                return this;
            }
            const packet = {
                type: PacketType.EVENT,
                data: args,
            };
            packet.options = {};
            packet.options.compress = this.flags.compress !== false;
            // event ack callback
            if ("function" === typeof args[args.length - 1]) {
                const id = this.ids++;
                const ack = args.pop();
                this._registerAckCallback(id, ack);
                packet.id = id;
            }
            const isTransportWritable = this.io.engine &&
                this.io.engine.transport &&
                this.io.engine.transport.writable;
            const discardPacket = this.flags.volatile && (!isTransportWritable || !this.connected);
            if (discardPacket) ;
            else if (this.connected) {
                this.notifyOutgoingListeners(packet);
                this.packet(packet);
            }
            else {
                this.sendBuffer.push(packet);
            }
            this.flags = {};
            return this;
        }
        /**
         * @private
         */
        _registerAckCallback(id, ack) {
            var _a;
            const timeout = (_a = this.flags.timeout) !== null && _a !== void 0 ? _a : this._opts.ackTimeout;
            if (timeout === undefined) {
                this.acks[id] = ack;
                return;
            }
            // @ts-ignore
            const timer = this.io.setTimeoutFn(() => {
                delete this.acks[id];
                for (let i = 0; i < this.sendBuffer.length; i++) {
                    if (this.sendBuffer[i].id === id) {
                        this.sendBuffer.splice(i, 1);
                    }
                }
                ack.call(this, new Error("operation has timed out"));
            }, timeout);
            this.acks[id] = (...args) => {
                // @ts-ignore
                this.io.clearTimeoutFn(timer);
                ack.apply(this, [null, ...args]);
            };
        }
        /**
         * Emits an event and waits for an acknowledgement
         *
         * @example
         * // without timeout
         * const response = await socket.emitWithAck("hello", "world");
         *
         * // with a specific timeout
         * try {
         *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
         * } catch (err) {
         *   // the server did not acknowledge the event in the given delay
         * }
         *
         * @return a Promise that will be fulfilled when the server acknowledges the event
         */
        emitWithAck(ev, ...args) {
            // the timeout flag is optional
            const withErr = this.flags.timeout !== undefined || this._opts.ackTimeout !== undefined;
            return new Promise((resolve, reject) => {
                args.push((arg1, arg2) => {
                    if (withErr) {
                        return arg1 ? reject(arg1) : resolve(arg2);
                    }
                    else {
                        return resolve(arg1);
                    }
                });
                this.emit(ev, ...args);
            });
        }
        /**
         * Add the packet to the queue.
         * @param args
         * @private
         */
        _addToQueue(args) {
            let ack;
            if (typeof args[args.length - 1] === "function") {
                ack = args.pop();
            }
            const packet = {
                id: this._queueSeq++,
                tryCount: 0,
                pending: false,
                args,
                flags: Object.assign({ fromQueue: true }, this.flags),
            };
            args.push((err, ...responseArgs) => {
                if (packet !== this._queue[0]) {
                    // the packet has already been acknowledged
                    return;
                }
                const hasError = err !== null;
                if (hasError) {
                    if (packet.tryCount > this._opts.retries) {
                        this._queue.shift();
                        if (ack) {
                            ack(err);
                        }
                    }
                }
                else {
                    this._queue.shift();
                    if (ack) {
                        ack(null, ...responseArgs);
                    }
                }
                packet.pending = false;
                return this._drainQueue();
            });
            this._queue.push(packet);
            this._drainQueue();
        }
        /**
         * Send the first packet of the queue, and wait for an acknowledgement from the server.
         * @param force - whether to resend a packet that has not been acknowledged yet
         *
         * @private
         */
        _drainQueue(force = false) {
            if (!this.connected || this._queue.length === 0) {
                return;
            }
            const packet = this._queue[0];
            if (packet.pending && !force) {
                return;
            }
            packet.pending = true;
            packet.tryCount++;
            this.flags = packet.flags;
            this.emit.apply(this, packet.args);
        }
        /**
         * Sends a packet.
         *
         * @param packet
         * @private
         */
        packet(packet) {
            packet.nsp = this.nsp;
            this.io._packet(packet);
        }
        /**
         * Called upon engine `open`.
         *
         * @private
         */
        onopen() {
            if (typeof this.auth == "function") {
                this.auth((data) => {
                    this._sendConnectPacket(data);
                });
            }
            else {
                this._sendConnectPacket(this.auth);
            }
        }
        /**
         * Sends a CONNECT packet to initiate the Socket.IO session.
         *
         * @param data
         * @private
         */
        _sendConnectPacket(data) {
            this.packet({
                type: PacketType.CONNECT,
                data: this._pid
                    ? Object.assign({ pid: this._pid, offset: this._lastOffset }, data)
                    : data,
            });
        }
        /**
         * Called upon engine or manager `error`.
         *
         * @param err
         * @private
         */
        onerror(err) {
            if (!this.connected) {
                this.emitReserved("connect_error", err);
            }
        }
        /**
         * Called upon engine `close`.
         *
         * @param reason
         * @param description
         * @private
         */
        onclose(reason, description) {
            this.connected = false;
            delete this.id;
            this.emitReserved("disconnect", reason, description);
        }
        /**
         * Called with socket packet.
         *
         * @param packet
         * @private
         */
        onpacket(packet) {
            const sameNamespace = packet.nsp === this.nsp;
            if (!sameNamespace)
                return;
            switch (packet.type) {
                case PacketType.CONNECT:
                    if (packet.data && packet.data.sid) {
                        this.onconnect(packet.data.sid, packet.data.pid);
                    }
                    else {
                        this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                    }
                    break;
                case PacketType.EVENT:
                case PacketType.BINARY_EVENT:
                    this.onevent(packet);
                    break;
                case PacketType.ACK:
                case PacketType.BINARY_ACK:
                    this.onack(packet);
                    break;
                case PacketType.DISCONNECT:
                    this.ondisconnect();
                    break;
                case PacketType.CONNECT_ERROR:
                    this.destroy();
                    const err = new Error(packet.data.message);
                    // @ts-ignore
                    err.data = packet.data.data;
                    this.emitReserved("connect_error", err);
                    break;
            }
        }
        /**
         * Called upon a server event.
         *
         * @param packet
         * @private
         */
        onevent(packet) {
            const args = packet.data || [];
            if (null != packet.id) {
                args.push(this.ack(packet.id));
            }
            if (this.connected) {
                this.emitEvent(args);
            }
            else {
                this.receiveBuffer.push(Object.freeze(args));
            }
        }
        emitEvent(args) {
            if (this._anyListeners && this._anyListeners.length) {
                const listeners = this._anyListeners.slice();
                for (const listener of listeners) {
                    listener.apply(this, args);
                }
            }
            super.emit.apply(this, args);
            if (this._pid && args.length && typeof args[args.length - 1] === "string") {
                this._lastOffset = args[args.length - 1];
            }
        }
        /**
         * Produces an ack callback to emit with an event.
         *
         * @private
         */
        ack(id) {
            const self = this;
            let sent = false;
            return function (...args) {
                // prevent double callbacks
                if (sent)
                    return;
                sent = true;
                self.packet({
                    type: PacketType.ACK,
                    id: id,
                    data: args,
                });
            };
        }
        /**
         * Called upon a server acknowlegement.
         *
         * @param packet
         * @private
         */
        onack(packet) {
            const ack = this.acks[packet.id];
            if ("function" === typeof ack) {
                ack.apply(this, packet.data);
                delete this.acks[packet.id];
            }
        }
        /**
         * Called upon server connect.
         *
         * @private
         */
        onconnect(id, pid) {
            this.id = id;
            this.recovered = pid && this._pid === pid;
            this._pid = pid; // defined only if connection state recovery is enabled
            this.connected = true;
            this.emitBuffered();
            this.emitReserved("connect");
            this._drainQueue(true);
        }
        /**
         * Emit buffered events (received and emitted).
         *
         * @private
         */
        emitBuffered() {
            this.receiveBuffer.forEach((args) => this.emitEvent(args));
            this.receiveBuffer = [];
            this.sendBuffer.forEach((packet) => {
                this.notifyOutgoingListeners(packet);
                this.packet(packet);
            });
            this.sendBuffer = [];
        }
        /**
         * Called upon server disconnect.
         *
         * @private
         */
        ondisconnect() {
            this.destroy();
            this.onclose("io server disconnect");
        }
        /**
         * Called upon forced client/server side disconnections,
         * this method ensures the manager stops tracking us and
         * that reconnections don't get triggered for this.
         *
         * @private
         */
        destroy() {
            if (this.subs) {
                // clean subscriptions to avoid reconnections
                this.subs.forEach((subDestroy) => subDestroy());
                this.subs = undefined;
            }
            this.io["_destroy"](this);
        }
        /**
         * Disconnects the socket manually. In that case, the socket will not try to reconnect.
         *
         * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
         *
         * @example
         * const socket = io();
         *
         * socket.on("disconnect", (reason) => {
         *   // console.log(reason); prints "io client disconnect"
         * });
         *
         * socket.disconnect();
         *
         * @return self
         */
        disconnect() {
            if (this.connected) {
                this.packet({ type: PacketType.DISCONNECT });
            }
            // remove socket from pool
            this.destroy();
            if (this.connected) {
                // fire events
                this.onclose("io client disconnect");
            }
            return this;
        }
        /**
         * Alias for {@link disconnect()}.
         *
         * @return self
         */
        close() {
            return this.disconnect();
        }
        /**
         * Sets the compress flag.
         *
         * @example
         * socket.compress(false).emit("hello");
         *
         * @param compress - if `true`, compresses the sending data
         * @return self
         */
        compress(compress) {
            this.flags.compress = compress;
            return this;
        }
        /**
         * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
         * ready to send messages.
         *
         * @example
         * socket.volatile.emit("hello"); // the server may or may not receive it
         *
         * @returns self
         */
        get volatile() {
            this.flags.volatile = true;
            return this;
        }
        /**
         * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
         * given number of milliseconds have elapsed without an acknowledgement from the server:
         *
         * @example
         * socket.timeout(5000).emit("my-event", (err) => {
         *   if (err) {
         *     // the server did not acknowledge the event in the given delay
         *   }
         * });
         *
         * @returns self
         */
        timeout(timeout) {
            this.flags.timeout = timeout;
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback.
         *
         * @example
         * socket.onAny((event, ...args) => {
         *   console.log(`got ${event}`);
         * });
         *
         * @param listener
         */
        onAny(listener) {
            this._anyListeners = this._anyListeners || [];
            this._anyListeners.push(listener);
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback. The listener is added to the beginning of the listeners array.
         *
         * @example
         * socket.prependAny((event, ...args) => {
         *   console.log(`got event ${event}`);
         * });
         *
         * @param listener
         */
        prependAny(listener) {
            this._anyListeners = this._anyListeners || [];
            this._anyListeners.unshift(listener);
            return this;
        }
        /**
         * Removes the listener that will be fired when any event is emitted.
         *
         * @example
         * const catchAllListener = (event, ...args) => {
         *   console.log(`got event ${event}`);
         * }
         *
         * socket.onAny(catchAllListener);
         *
         * // remove a specific listener
         * socket.offAny(catchAllListener);
         *
         * // or remove all listeners
         * socket.offAny();
         *
         * @param listener
         */
        offAny(listener) {
            if (!this._anyListeners) {
                return this;
            }
            if (listener) {
                const listeners = this._anyListeners;
                for (let i = 0; i < listeners.length; i++) {
                    if (listener === listeners[i]) {
                        listeners.splice(i, 1);
                        return this;
                    }
                }
            }
            else {
                this._anyListeners = [];
            }
            return this;
        }
        /**
         * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
         * e.g. to remove listeners.
         */
        listenersAny() {
            return this._anyListeners || [];
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback.
         *
         * Note: acknowledgements sent to the server are not included.
         *
         * @example
         * socket.onAnyOutgoing((event, ...args) => {
         *   console.log(`sent event ${event}`);
         * });
         *
         * @param listener
         */
        onAnyOutgoing(listener) {
            this._anyOutgoingListeners = this._anyOutgoingListeners || [];
            this._anyOutgoingListeners.push(listener);
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback. The listener is added to the beginning of the listeners array.
         *
         * Note: acknowledgements sent to the server are not included.
         *
         * @example
         * socket.prependAnyOutgoing((event, ...args) => {
         *   console.log(`sent event ${event}`);
         * });
         *
         * @param listener
         */
        prependAnyOutgoing(listener) {
            this._anyOutgoingListeners = this._anyOutgoingListeners || [];
            this._anyOutgoingListeners.unshift(listener);
            return this;
        }
        /**
         * Removes the listener that will be fired when any event is emitted.
         *
         * @example
         * const catchAllListener = (event, ...args) => {
         *   console.log(`sent event ${event}`);
         * }
         *
         * socket.onAnyOutgoing(catchAllListener);
         *
         * // remove a specific listener
         * socket.offAnyOutgoing(catchAllListener);
         *
         * // or remove all listeners
         * socket.offAnyOutgoing();
         *
         * @param [listener] - the catch-all listener (optional)
         */
        offAnyOutgoing(listener) {
            if (!this._anyOutgoingListeners) {
                return this;
            }
            if (listener) {
                const listeners = this._anyOutgoingListeners;
                for (let i = 0; i < listeners.length; i++) {
                    if (listener === listeners[i]) {
                        listeners.splice(i, 1);
                        return this;
                    }
                }
            }
            else {
                this._anyOutgoingListeners = [];
            }
            return this;
        }
        /**
         * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
         * e.g. to remove listeners.
         */
        listenersAnyOutgoing() {
            return this._anyOutgoingListeners || [];
        }
        /**
         * Notify the listeners for each packet sent
         *
         * @param packet
         *
         * @private
         */
        notifyOutgoingListeners(packet) {
            if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
                const listeners = this._anyOutgoingListeners.slice();
                for (const listener of listeners) {
                    listener.apply(this, packet.data);
                }
            }
        }
    }

    /**
     * Initialize backoff timer with `opts`.
     *
     * - `min` initial timeout in milliseconds [100]
     * - `max` max timeout [10000]
     * - `jitter` [0]
     * - `factor` [2]
     *
     * @param {Object} opts
     * @api public
     */
    function Backoff(opts) {
        opts = opts || {};
        this.ms = opts.min || 100;
        this.max = opts.max || 10000;
        this.factor = opts.factor || 2;
        this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
        this.attempts = 0;
    }
    /**
     * Return the backoff duration.
     *
     * @return {Number}
     * @api public
     */
    Backoff.prototype.duration = function () {
        var ms = this.ms * Math.pow(this.factor, this.attempts++);
        if (this.jitter) {
            var rand = Math.random();
            var deviation = Math.floor(rand * this.jitter * ms);
            ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
        }
        return Math.min(ms, this.max) | 0;
    };
    /**
     * Reset the number of attempts.
     *
     * @api public
     */
    Backoff.prototype.reset = function () {
        this.attempts = 0;
    };
    /**
     * Set the minimum duration
     *
     * @api public
     */
    Backoff.prototype.setMin = function (min) {
        this.ms = min;
    };
    /**
     * Set the maximum duration
     *
     * @api public
     */
    Backoff.prototype.setMax = function (max) {
        this.max = max;
    };
    /**
     * Set the jitter
     *
     * @api public
     */
    Backoff.prototype.setJitter = function (jitter) {
        this.jitter = jitter;
    };

    class Manager extends Emitter {
        constructor(uri, opts) {
            var _a;
            super();
            this.nsps = {};
            this.subs = [];
            if (uri && "object" === typeof uri) {
                opts = uri;
                uri = undefined;
            }
            opts = opts || {};
            opts.path = opts.path || "/socket.io";
            this.opts = opts;
            installTimerFunctions(this, opts);
            this.reconnection(opts.reconnection !== false);
            this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
            this.reconnectionDelay(opts.reconnectionDelay || 1000);
            this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
            this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
            this.backoff = new Backoff({
                min: this.reconnectionDelay(),
                max: this.reconnectionDelayMax(),
                jitter: this.randomizationFactor(),
            });
            this.timeout(null == opts.timeout ? 20000 : opts.timeout);
            this._readyState = "closed";
            this.uri = uri;
            const _parser = opts.parser || parser;
            this.encoder = new _parser.Encoder();
            this.decoder = new _parser.Decoder();
            this._autoConnect = opts.autoConnect !== false;
            if (this._autoConnect)
                this.open();
        }
        reconnection(v) {
            if (!arguments.length)
                return this._reconnection;
            this._reconnection = !!v;
            return this;
        }
        reconnectionAttempts(v) {
            if (v === undefined)
                return this._reconnectionAttempts;
            this._reconnectionAttempts = v;
            return this;
        }
        reconnectionDelay(v) {
            var _a;
            if (v === undefined)
                return this._reconnectionDelay;
            this._reconnectionDelay = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
            return this;
        }
        randomizationFactor(v) {
            var _a;
            if (v === undefined)
                return this._randomizationFactor;
            this._randomizationFactor = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
            return this;
        }
        reconnectionDelayMax(v) {
            var _a;
            if (v === undefined)
                return this._reconnectionDelayMax;
            this._reconnectionDelayMax = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
            return this;
        }
        timeout(v) {
            if (!arguments.length)
                return this._timeout;
            this._timeout = v;
            return this;
        }
        /**
         * Starts trying to reconnect if reconnection is enabled and we have not
         * started reconnecting yet
         *
         * @private
         */
        maybeReconnectOnOpen() {
            // Only try to reconnect if it's the first time we're connecting
            if (!this._reconnecting &&
                this._reconnection &&
                this.backoff.attempts === 0) {
                // keeps reconnection from firing twice for the same reconnection loop
                this.reconnect();
            }
        }
        /**
         * Sets the current transport `socket`.
         *
         * @param {Function} fn - optional, callback
         * @return self
         * @public
         */
        open(fn) {
            if (~this._readyState.indexOf("open"))
                return this;
            this.engine = new Socket$1(this.uri, this.opts);
            const socket = this.engine;
            const self = this;
            this._readyState = "opening";
            this.skipReconnect = false;
            // emit `open`
            const openSubDestroy = on(socket, "open", function () {
                self.onopen();
                fn && fn();
            });
            // emit `error`
            const errorSub = on(socket, "error", (err) => {
                self.cleanup();
                self._readyState = "closed";
                this.emitReserved("error", err);
                if (fn) {
                    fn(err);
                }
                else {
                    // Only do this if there is no fn to handle the error
                    self.maybeReconnectOnOpen();
                }
            });
            if (false !== this._timeout) {
                const timeout = this._timeout;
                if (timeout === 0) {
                    openSubDestroy(); // prevents a race condition with the 'open' event
                }
                // set timer
                const timer = this.setTimeoutFn(() => {
                    openSubDestroy();
                    socket.close();
                    // @ts-ignore
                    socket.emit("error", new Error("timeout"));
                }, timeout);
                if (this.opts.autoUnref) {
                    timer.unref();
                }
                this.subs.push(function subDestroy() {
                    clearTimeout(timer);
                });
            }
            this.subs.push(openSubDestroy);
            this.subs.push(errorSub);
            return this;
        }
        /**
         * Alias for open()
         *
         * @return self
         * @public
         */
        connect(fn) {
            return this.open(fn);
        }
        /**
         * Called upon transport open.
         *
         * @private
         */
        onopen() {
            // clear old subs
            this.cleanup();
            // mark as open
            this._readyState = "open";
            this.emitReserved("open");
            // add new subs
            const socket = this.engine;
            this.subs.push(on(socket, "ping", this.onping.bind(this)), on(socket, "data", this.ondata.bind(this)), on(socket, "error", this.onerror.bind(this)), on(socket, "close", this.onclose.bind(this)), on(this.decoder, "decoded", this.ondecoded.bind(this)));
        }
        /**
         * Called upon a ping.
         *
         * @private
         */
        onping() {
            this.emitReserved("ping");
        }
        /**
         * Called with data.
         *
         * @private
         */
        ondata(data) {
            try {
                this.decoder.add(data);
            }
            catch (e) {
                this.onclose("parse error", e);
            }
        }
        /**
         * Called when parser fully decodes a packet.
         *
         * @private
         */
        ondecoded(packet) {
            // the nextTick call prevents an exception in a user-provided event listener from triggering a disconnection due to a "parse error"
            nextTick$3(() => {
                this.emitReserved("packet", packet);
            }, this.setTimeoutFn);
        }
        /**
         * Called upon socket error.
         *
         * @private
         */
        onerror(err) {
            this.emitReserved("error", err);
        }
        /**
         * Creates a new socket for the given `nsp`.
         *
         * @return {Socket}
         * @public
         */
        socket(nsp, opts) {
            let socket = this.nsps[nsp];
            if (!socket) {
                socket = new Socket(this, nsp, opts);
                this.nsps[nsp] = socket;
            }
            else if (this._autoConnect && !socket.active) {
                socket.connect();
            }
            return socket;
        }
        /**
         * Called upon a socket close.
         *
         * @param socket
         * @private
         */
        _destroy(socket) {
            const nsps = Object.keys(this.nsps);
            for (const nsp of nsps) {
                const socket = this.nsps[nsp];
                if (socket.active) {
                    return;
                }
            }
            this._close();
        }
        /**
         * Writes a packet.
         *
         * @param packet
         * @private
         */
        _packet(packet) {
            const encodedPackets = this.encoder.encode(packet);
            for (let i = 0; i < encodedPackets.length; i++) {
                this.engine.write(encodedPackets[i], packet.options);
            }
        }
        /**
         * Clean up transport subscriptions and packet buffer.
         *
         * @private
         */
        cleanup() {
            this.subs.forEach((subDestroy) => subDestroy());
            this.subs.length = 0;
            this.decoder.destroy();
        }
        /**
         * Close the current socket.
         *
         * @private
         */
        _close() {
            this.skipReconnect = true;
            this._reconnecting = false;
            this.onclose("forced close");
            if (this.engine)
                this.engine.close();
        }
        /**
         * Alias for close()
         *
         * @private
         */
        disconnect() {
            return this._close();
        }
        /**
         * Called upon engine close.
         *
         * @private
         */
        onclose(reason, description) {
            this.cleanup();
            this.backoff.reset();
            this._readyState = "closed";
            this.emitReserved("close", reason, description);
            if (this._reconnection && !this.skipReconnect) {
                this.reconnect();
            }
        }
        /**
         * Attempt a reconnection.
         *
         * @private
         */
        reconnect() {
            if (this._reconnecting || this.skipReconnect)
                return this;
            const self = this;
            if (this.backoff.attempts >= this._reconnectionAttempts) {
                this.backoff.reset();
                this.emitReserved("reconnect_failed");
                this._reconnecting = false;
            }
            else {
                const delay = this.backoff.duration();
                this._reconnecting = true;
                const timer = this.setTimeoutFn(() => {
                    if (self.skipReconnect)
                        return;
                    this.emitReserved("reconnect_attempt", self.backoff.attempts);
                    // check again for the case socket closed in above events
                    if (self.skipReconnect)
                        return;
                    self.open((err) => {
                        if (err) {
                            self._reconnecting = false;
                            self.reconnect();
                            this.emitReserved("reconnect_error", err);
                        }
                        else {
                            self.onreconnect();
                        }
                    });
                }, delay);
                if (this.opts.autoUnref) {
                    timer.unref();
                }
                this.subs.push(function subDestroy() {
                    clearTimeout(timer);
                });
            }
        }
        /**
         * Called upon successful reconnect.
         *
         * @private
         */
        onreconnect() {
            const attempt = this.backoff.attempts;
            this._reconnecting = false;
            this.backoff.reset();
            this.emitReserved("reconnect", attempt);
        }
    }

    /**
     * Managers cache.
     */
    const cache = {};
    function lookup(uri, opts) {
        if (typeof uri === "object") {
            opts = uri;
            uri = undefined;
        }
        opts = opts || {};
        const parsed = url(uri, opts.path || "/socket.io");
        const source = parsed.source;
        const id = parsed.id;
        const path = parsed.path;
        const sameNamespace = cache[id] && path in cache[id]["nsps"];
        const newConnection = opts.forceNew ||
            opts["force new connection"] ||
            false === opts.multiplex ||
            sameNamespace;
        let io;
        if (newConnection) {
            io = new Manager(source, opts);
        }
        else {
            if (!cache[id]) {
                cache[id] = new Manager(source, opts);
            }
            io = cache[id];
        }
        if (parsed.query && !opts.query) {
            opts.query = parsed.queryKey;
        }
        return io.socket(parsed.path, opts);
    }
    // so that "lookup" can be used both as a function (e.g. `io(...)`) and as a
    // namespace (e.g. `io.connect(...)`), for backward compatibility
    Object.assign(lookup, {
        Manager,
        Socket,
        io: lookup,
        connect: lookup,
    });

    const {
      PermissionStore,
      VoiceStateStore,
      ChannelStore,
      GuildStore,
      UserStore,
      InviteActions,
      FluxDispatcher,
      SelectedGuildStore,
      Router: {
        transitionTo
      },
      React,
      modals: {
        actions: {
          open: openModal
        },
        components: {
          Root: ModalRoot
        }
      },
      VoiceActions: {
        selectVoiceChannel
      },
      constants: {
        Permissions
      },
      moment
    } = common__default["default"];

    function getAllVoiceStates(rawString) {
      return Object.fromEntries(getAllVoiceStatesEntries(rawString));
    }
    function getAllVoiceStatesEntries(rawString) {
      return Object.values(VoiceStateStore.getAllVoiceStates()).map((i) => Object.values(i)).flat().map((i) => [
        i.userId,
        getUserVoiceStates(i.userId, rawString)
      ]).filter((i) => i[1]?.length);
    }
    function getVoiceChannelMembers(channelId, raw = false) {
      let states = VoiceStateStore.getVoiceStatesForChannel(channelId);
      return states ? Object.keys(states).map((userId) => {
        return raw ? makeRawArray(states[userId]) : rawToParsed(makeRawArray(states[userId]));
      }) : [];
    }
    function getUserVoiceStates(userId, rawString) {
      return Object.values(VoiceStateStore.__getLocalVars().users[userId] || {}).map((i) => rawString ? makeRawArray(i).join(";") : makeRawArray(i));
    }
    function makeRawArray(i) {
      let channel = ChannelStore.getChannel(i.channelId);
      let guild = GuildStore.getGuild(channel?.guild_id);
      let user = UserStore.getUser(i.userId);
      return [
        i.selfDeaf || i.deaf ? `${i.deaf ? "guildDeaf" : "deaf"}` : i.selfMute || i.mute || i.suppress ? `${i.mute ? "guildMute" : "mute"}` : i.selfVideo ? "video" : i.selfStream ? "stream" : "normal",
        user.id,
        user.tag,
        user.avatar || "",
        i.channelId || "",
        !channel ? "" : channel.name || [...new Map([...channel.recipients.map((i2) => [i2, UserStore.getUser(i2)]), [UserStore.getCurrentUser().id, UserStore.getCurrentUser()]]).values()].filter((i2) => i2).map((i2) => i2.username).sort((a, b) => a > b).join(", ") || "Unknown",
        !channel ? "" : channel?.icon || "",
        !channel ? "" : "",
        !guild ? "" : guild.id,
        !guild ? "" : guild.name,
        !guild ? "" : guild?.vanityURLCode || "",
        !guild ? "" : guild?.icon || ""
      ].map((i2) => `${i2}`.replaceAll(";", ""));
    }
    function rawToParsed(raw) {
      if (typeof raw == "string")
        raw = raw.split(";");
      return {
        state: raw[0],
        userId: raw[1],
        userTag: raw[2],
        userAvatar: raw[3],
        channelId: raw[4],
        channelName: raw[5],
        channelIcon: raw[6],
        channelRedacted: raw[7] == "true",
        guildId: raw[8],
        guildName: raw[9],
        guildVanity: raw[10],
        guildIcon: raw[11],
        createdAt: raw[12],
        joinedAt: raw[13]
      };
    }

    const socket = lookup("https://voice-indicators.acord.app/", {
      transports: ["websocket"]
    });
    socket.on("connect", async () => {
      let acordToken = authentication__default["default"].token;
      if (acordToken) {
        socket.emit(":login", { acordToken });
      }
    });
    socket.on(":kill", () => {
      socket.disconnect();
    });
    socket.on("channelStates", ({ id }, cb) => {
      cb({ ok: true, data: getVoiceChannelMembers(id, true) });
    });
    function awaitResponse(eventName, data, timeout = Infinity) {
      return new Promise((resolve) => {
        let done = false;
        socket.emit(eventName, data, (r) => {
          if (done)
            return;
          resolve(r);
        });
        if (timeout != Infinity) {
          setTimeout(() => {
            done = true;
            resolve({ ok: false, error: "Timeout" });
          }, timeout);
        }
      });
    }

    class Patches {
      constructor() {
        this.patches = [];
      }
      add(...unPatchers) {
        this.patches.push(...unPatchers);
      }
      remove(unPatcher) {
        let [f] = this.patches.splice(this.patches.indexOf((i) => i == unPatcher), 1);
        f();
      }
      removeAll() {
        let l = this.patches.splice(0, this.patches.length);
        for (let i = 0; i < l.length; i++) {
          l[i]();
        }
      }
    }
    var patchContainer = new Patches();

    function patchUpdater() {
      patchContainer.add((() => {
        let interval = setInterval(() => {
          document.querySelectorAll(".vi--icon-container").forEach((e) => {
            e.render();
          });
        }, 100);
        return () => {
          clearInterval(interval);
        };
      })());
      patchContainer.add(
        events__default["default"].on("AuthenticationSuccess", async () => {
          socket.connect();
          socket.emit(":login", { acordToken: authentication__default["default"].token });
        })
      );
      patchContainer.add(
        events__default["default"].on("AuthenticationFailure", async () => {
          socket.disconnect();
        })
      );
    }

    const localCache = {
      lastVoiceStates: [],
      responseCache: /* @__PURE__ */ new Map(),
      stateRequestCache: []
    };

    async function fetchUserVoiceStates(userId) {
      return getAllVoiceStates()[userId].map((i) => rawToParsed(i));
    }
    async function fetchVoiceMembers(id) {
      let cached = localCache.responseCache.get(`VoiceMembers:${id}`);
      if (cached)
        return cached.members;
      let dataOnServer = [];
      let dataOnMe = getVoiceChannelMembers(id, false);
      let members = [];
      if (dataOnMe.length) {
        members = dataOnMe.map((i) => {
          return {
            ...i,
            joinedAt: dataOnServer.find((j) => j[0] === i.userId)?.[4] ?? -1
          };
        });
      } else {
        members = dataOnServer.map(
          (i) => ({
            userId: i[0],
            userTag: i[1],
            userAvatar: i[2],
            state: i[3],
            joinedAt: i[4]
          })
        );
      }
      localCache.responseCache.set(`VoiceMembers:${id}`, { at: Date.now(), members, ttl: 1e3 });
      return members;
    }

    function DeafIcon$1({ color }) {
      return `
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        class="vi--icon vi--deaf-icon"
        style="color: ${color};"
      >
      <path d="M6.16204 15.0065C6.10859 15.0022 6.05455 15 6 15H4V12C4 7.588 7.589 4 12 4C13.4809 4 14.8691 4.40439 16.0599 5.10859L17.5102 3.65835C15.9292 2.61064 14.0346 2 12 2C6.486 2 2 6.485 2 12V19.1685L6.16204 15.0065Z" fill="currentColor"></path>
      <path d="M19.725 9.91686C19.9043 10.5813 20 11.2796 20 12V15H18C16.896 15 16 15.896 16 17V20C16 21.104 16.896 22 18 22H20C21.105 22 22 21.104 22 20V12C22 10.7075 21.7536 9.47149 21.3053 8.33658L19.725 9.91686Z" fill="currentColor"></path>
      <path d="M3.20101 23.6243L1.7868 22.2101L21.5858 2.41113L23 3.82535L3.20101 23.6243Z" fill="currentColor"></path>
    </svg>
  `;
    }

    function MuteIcon$1({ color }) {
      return `
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      class="vi--icon vi--mute-icon"
      style="color: ${color};"
    >
      <path d="M6.7 11H5C5 12.19 5.34 13.3 5.9 14.28L7.13 13.05C6.86 12.43 6.7 11.74 6.7 11Z" fill="currentColor"></path>
      <path d="M9.01 11.085C9.015 11.1125 9.02 11.14 9.02 11.17L15 5.18V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 11.03 9.005 11.0575 9.01 11.085Z" fill="currentColor"></path>
      <path d="M11.7237 16.0927L10.9632 16.8531L10.2533 17.5688C10.4978 17.633 10.747 17.6839 11 17.72V22H13V17.72C16.28 17.23 19 14.41 19 11H17.3C17.3 14 14.76 16.1 12 16.1C11.9076 16.1 11.8155 16.0975 11.7237 16.0927Z" fill="currentColor"></path>
      <path d="M21 4.27L19.73 3L3 19.73L4.27 21L8.46 16.82L9.69 15.58L11.35 13.92L14.99 10.28L21 4.27Z" fill="currentColor"></path>
    </svg>
  `;
    }

    function VideoIcon$1({ color }) {
      return `
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        class="vi--icon vi--video-icon"
        style="color: ${color};"
      >
        <path d="M21.526 8.149C21.231 7.966 20.862 7.951 20.553 8.105L18 9.382V7C18 5.897 17.103 5 16 5H4C2.897 5 2 5.897 2 7V17C2 18.104 2.897 19 4 19H16C17.103 19 18 18.104 18 17V14.618L20.553 15.894C20.694 15.965 20.847 16 21 16C21.183 16 21.365 15.949 21.526 15.851C21.82 15.668 22 15.347 22 15V9C22 8.653 21.82 8.332 21.526 8.149Z" fill="currentColor"></path>
      </svg>
  `;
    }

    function VoiceIcon$1({ color }) {
      return `
    <svg
      width="60"
      height="61"
      viewBox="0 0 60 61"
      fill="none"
      class="vi--icon vi--voice-icon"
      style="color: ${color};"
    >
      <path d="M28.4623 8.15497C27.5273 7.77127 26.4523 7.98305 25.7373 8.69565L15.0048 20.4212H7.50479C6.12979 20.4212 5.00479 21.5449 5.00479 22.9128V37.8623C5.00479 39.2327 6.12979 40.354 7.50479 40.354H15.0048L25.7373 52.0844C26.4523 52.7971 27.5273 53.0113 28.4623 52.6251C29.3973 52.2389 30.0048 51.3295 30.0048 50.3204V10.4547C30.0048 9.45061 29.3973 8.53619 28.4623 8.15497ZM35.0048 12.9461V17.9293C41.8973 17.9293 47.5048 23.5205 47.5048 30.3875C47.5048 37.2569 41.8973 42.8456 35.0048 42.8456V47.8288C44.6548 47.8288 52.5048 40.0076 52.5048 30.3875C52.5048 20.7723 44.6548 12.9461 35.0048 12.9461ZM35.0048 22.9126C39.1398 22.9126 42.5048 26.2689 42.5048 30.3875C42.5048 34.5111 39.1398 37.8623 35.0048 37.8623V32.8791C36.3823 32.8791 37.5048 31.7604 37.5048 30.3875C37.5048 29.0146 36.3823 27.8959 35.0048 27.8959V22.9126Z" fill="currentColor"></path>
    </svg>
  `;
    }

    const COLORS = {
      DANGER: "#eb3d47",
      SECONDARY: "#8a8e93",
      SUCCESS: "#3aa360",
      PRIMARY: "#5865f2"
    };

    let map = {
      guildDeaf: DeafIcon$1({ color: COLORS.DANGER }),
      deaf: DeafIcon$1({ color: COLORS.SECONDARY }),
      guildMute: MuteIcon$1({ color: COLORS.DANGER }),
      mute: MuteIcon$1({ color: COLORS.SECONDARY }),
      video: VideoIcon$1({ color: COLORS.SECONDARY }),
      stream: '<div class="v--icon vi--red-dot" ></div>',
      normal: VoiceIcon$1({ color: COLORS.SECONDARY })
    };
    function renderIcon(state) {
      return map[state.state] || state.state;
    }

    function ArrowIcon(props = {}) {
      return /* @__PURE__ */ React__namespace.createElement("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        className: "vi--icon vi--arrow-icon",
        style: { color: props.color }
      }, /* @__PURE__ */ React__namespace.createElement("polygon", {
        fill: "currentColor",
        "fill-rule": "nonzero",
        points: "13 20 11 20 11 8 5.5 13.5 4.08 12.08 12 4.16 19.92 12.08 18.5 13.5 13 8"
      }));
    }

    function CloseIcon(props = {}) {
      return /* @__PURE__ */ React__namespace.createElement("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        className: "vi--icon vi--close-icon",
        style: { color: props.color }
      }, /* @__PURE__ */ React__namespace.createElement("path", {
        d: "M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z",
        fill: "currentColor"
      }));
    }

    function DeafIcon(props = {}) {
      return /* @__PURE__ */ React__namespace.createElement("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        className: "vi--icon vi--deaf-icon",
        style: { color: props.color }
      }, /* @__PURE__ */ React__namespace.createElement("path", {
        d: "M6.16204 15.0065C6.10859 15.0022 6.05455 15 6 15H4V12C4 7.588 7.589 4 12 4C13.4809 4 14.8691 4.40439 16.0599 5.10859L17.5102 3.65835C15.9292 2.61064 14.0346 2 12 2C6.486 2 2 6.485 2 12V19.1685L6.16204 15.0065Z",
        fill: "currentColor"
      }), /* @__PURE__ */ React__namespace.createElement("path", {
        d: "M19.725 9.91686C19.9043 10.5813 20 11.2796 20 12V15H18C16.896 15 16 15.896 16 17V20C16 21.104 16.896 22 18 22H20C21.105 22 22 21.104 22 20V12C22 10.7075 21.7536 9.47149 21.3053 8.33658L19.725 9.91686Z",
        fill: "currentColor"
      }), /* @__PURE__ */ React__namespace.createElement("path", {
        d: "M3.20101 23.6243L1.7868 22.2101L21.5858 2.41113L23 3.82535L3.20101 23.6243Z",
        fill: "currentColor"
      }));
    }

    function JoinCallIcon(props = {}) {
      return /* @__PURE__ */ React__namespace.createElement("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        className: "vi--icon vi--join-call-icon",
        style: { color: props.color }
      }, /* @__PURE__ */ React__namespace.createElement("path", {
        fill: "currentColor",
        "fill-rule": "evenodd",
        "clip-rule": "evenodd",
        d: "M11 5V3C16.515 3 21 7.486 21 13H19C19 8.589 15.411 5 11 5ZM17 13H15C15 10.795 13.206 9 11 9V7C14.309 7 17 9.691 17 13ZM11 11V13H13C13 11.896 12.105 11 11 11ZM14 16H18C18.553 16 19 16.447 19 17V21C19 21.553 18.553 22 18 22H13C6.925 22 2 17.075 2 11V6C2 5.447 2.448 5 3 5H7C7.553 5 8 5.447 8 6V10C8 10.553 7.553 11 7 11H6C6.063 14.938 9 18 13 18V17C13 16.447 13.447 16 14 16Z"
      }));
    }

    function MuteIcon(props = {}) {
      return /* @__PURE__ */ React__namespace.createElement("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        className: "vi--icon vi--mute-icon",
        style: { color: props.color }
      }, /* @__PURE__ */ React__namespace.createElement("path", {
        d: "M6.7 11H5C5 12.19 5.34 13.3 5.9 14.28L7.13 13.05C6.86 12.43 6.7 11.74 6.7 11Z",
        fill: "currentColor"
      }), /* @__PURE__ */ React__namespace.createElement("path", {
        d: "M9.01 11.085C9.015 11.1125 9.02 11.14 9.02 11.17L15 5.18V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 11.03 9.005 11.0575 9.01 11.085Z",
        fill: "currentColor"
      }), /* @__PURE__ */ React__namespace.createElement("path", {
        d: "M11.7237 16.0927L10.9632 16.8531L10.2533 17.5688C10.4978 17.633 10.747 17.6839 11 17.72V22H13V17.72C16.28 17.23 19 14.41 19 11H17.3C17.3 14 14.76 16.1 12 16.1C11.9076 16.1 11.8155 16.0975 11.7237 16.0927Z",
        fill: "currentColor"
      }), /* @__PURE__ */ React__namespace.createElement("path", {
        d: "M21 4.27L19.73 3L3 19.73L4.27 21L8.46 16.82L9.69 15.58L11.35 13.92L14.99 10.28L21 4.27Z",
        fill: "currentColor"
      }));
    }

    function VideoIcon(props = {}) {
      return /* @__PURE__ */ React__namespace.createElement("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        className: "vi--icon vi--video-icon",
        style: { color: props.color }
      }, /* @__PURE__ */ React__namespace.createElement("path", {
        d: "M21.526 8.149C21.231 7.966 20.862 7.951 20.553 8.105L18 9.382V7C18 5.897 17.103 5 16 5H4C2.897 5 2 5.897 2 7V17C2 18.104 2.897 19 4 19H16C17.103 19 18 18.104 18 17V14.618L20.553 15.894C20.694 15.965 20.847 16 21 16C21.183 16 21.365 15.949 21.526 15.851C21.82 15.668 22 15.347 22 15V9C22 8.653 21.82 8.332 21.526 8.149Z",
        fill: "currentColor"
      }));
    }

    function VoiceIcon(props = {}) {
      return /* @__PURE__ */ React__namespace.createElement("svg", {
        width: "60",
        height: "61",
        viewBox: "0 0 60 61",
        fill: "none",
        className: "vi--icon vi--voice-icon",
        style: { color: props.color }
      }, /* @__PURE__ */ React__namespace.createElement("path", {
        d: "M28.4623 8.15497C27.5273 7.77127 26.4523 7.98305 25.7373 8.69565L15.0048 20.4212H7.50479C6.12979 20.4212 5.00479 21.5449 5.00479 22.9128V37.8623C5.00479 39.2327 6.12979 40.354 7.50479 40.354H15.0048L25.7373 52.0844C26.4523 52.7971 27.5273 53.0113 28.4623 52.6251C29.3973 52.2389 30.0048 51.3295 30.0048 50.3204V10.4547C30.0048 9.45061 29.3973 8.53619 28.4623 8.15497ZM35.0048 12.9461V17.9293C41.8973 17.9293 47.5048 23.5205 47.5048 30.3875C47.5048 37.2569 41.8973 42.8456 35.0048 42.8456V47.8288C44.6548 47.8288 52.5048 40.0076 52.5048 30.3875C52.5048 20.7723 44.6548 12.9461 35.0048 12.9461ZM35.0048 22.9126C39.1398 22.9126 42.5048 26.2689 42.5048 30.3875C42.5048 34.5111 39.1398 37.8623 35.0048 37.8623V32.8791C36.3823 32.8791 37.5048 31.7604 37.5048 30.3875C37.5048 29.0146 36.3823 27.8959 35.0048 27.8959V22.9126Z",
        fill: "currentColor"
      }));
    }

    function formatSeconds(s) {
      if (isNaN(parseInt(s)))
        s = 0;
      s = Math.floor(s);
      let hours = Math.floor(s / 60 / 60);
      return `${hours > 0 ? `${hours.toString().padStart(2, "0")}:` : ""}${Math.floor(s / 60 % 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
    }

    const indicatorMap = {
      guildDeaf: DeafIcon({ color: COLORS.DANGER }),
      deaf: DeafIcon({ color: COLORS.SECONDARY }),
      guildMute: MuteIcon({ color: COLORS.DANGER }),
      mute: MuteIcon({ color: COLORS.SECONDARY }),
      video: VideoIcon({ color: COLORS.SECONDARY }),
      stream: /* @__PURE__ */ React.createElement("div", {
        class: "v--icon vi--red-dot"
      }),
      normal: VoiceIcon({ color: COLORS.SECONDARY })
    };
    function ModalMember({ member }) {
      const [speaking, setSpeaking] = React.useState(false);
      const [rnd, setRnd] = React.useState();
      React.useEffect(() => {
        function onSpeaking([userId, speaking2]) {
          if (userId != member.userId)
            return;
          setSpeaking(speaking2);
        }
        socket.on("speaking", onSpeaking);
        let interval = utils__default["default"].interval(async () => {
          setRnd(Math.random());
        }, 1e3);
        return () => {
          socket.off("speaking", onSpeaking);
          interval();
        };
      });
      return /* @__PURE__ */ React.createElement("div", {
        className: "member",
        onClick: async (ev) => {
          ev.preventDefault();
          try {
            if (!modals__default["default"].show.user)
              throw Error("Old Acord version");
            if (!UserStore.getUser(member.userId))
              throw Error("Unable to find user.");
            await modals__default["default"].show.user(member.userId);
          } catch {
            utils__default["default"].copyText(member.userTag);
            toasts__default["default"].show(extension.i18n.format("X_COPIED", member.userTag));
          }
        }
      }, /* @__PURE__ */ React.createElement("div", {
        className: "time-elapsed",
        "acord--tooltip-content": moment(member.joinedAt).format("MMM DD, YYYY HH:mm")
      }, member.joinedAt === -1 ? "" : formatSeconds((Date.now() - member.joinedAt) / 1e3)), /* @__PURE__ */ React.createElement("div", {
        className: `avatar ${speaking ? "speaking" : ""}`,
        style: { backgroundImage: `url("${member.userAvatar ? `https://cdn.discordapp.com/avatars/${member.userId}/${member.userAvatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${Number(member.userTag.split("#")[1]) % 5}.png`}")` }
      }), /* @__PURE__ */ React.createElement("div", {
        className: "about"
      }, /* @__PURE__ */ React.createElement("div", {
        className: "name-container"
      }, /* @__PURE__ */ React.createElement("div", {
        className: "name"
      }, member.userTag.split("#")[0]), /* @__PURE__ */ React.createElement("div", {
        className: "discriminator"
      }, "#", member.userTag.split("#")[1])), /* @__PURE__ */ React.createElement("div", {
        className: "state"
      }, indicatorMap[member?.state] || null)));
    }

    function Modal({ e, states }) {
      const [currentData, setCurrentData] = React.useState({ inMyChannels: false, isJoinable: false, state: states[0] });
      const [members, setMembers] = React.useState([]);
      const [rnd, setRnd] = React.useState("");
      async function onChange(state) {
        let oldChannelId = currentData?.state?.channelId;
        if (oldChannelId)
          socket.emit("unsubscribe", ["speaking", [oldChannelId]]);
        socket.emit("subscribe", ["speaking", [state.channelId]]);
        let channel = ChannelStore.getChannel(state.channelId);
        let inMyChannels = !!channel;
        let isJoinable = !inMyChannels ? false : channel.type == 3 ? true : PermissionStore.can(Permissions.CONNECT, channel) && PermissionStore.can(Permissions.VIEW_CHANNEL, channel);
        setCurrentData({ inMyChannels, isJoinable, state });
        setMembers(state.channelRedacted ? [] : await fetchVoiceMembers(state.channelId));
      }
      React.useEffect(() => {
        let state = states[0];
        onChange(state);
        let interval = utils__default["default"].interval(async () => {
          setRnd(Math.random());
        }, 1e3);
        return () => {
          interval();
          socket.emit("unsubscribe", ["speaking", [state.channelId]]);
        };
      }, []);
      return /* @__PURE__ */ React.createElement(ModalRoot, {
        transitionState: e.transitionState,
        size: "large",
        className: "vi--modal-root"
      }, /* @__PURE__ */ React.createElement("div", {
        className: "vi--modal-header"
      }, /* @__PURE__ */ React.createElement("div", {
        className: "title"
      }, extension.i18n.format("VOICE_STATES")), /* @__PURE__ */ React.createElement("div", {
        onClick: e.onClose,
        className: "vi--modal-close"
      }, /* @__PURE__ */ React.createElement(CloseIcon, {
        color: COLORS.SECONDARY
      }))), /* @__PURE__ */ React.createElement("div", {
        className: "vi--modal-content"
      }, /* @__PURE__ */ React.createElement("div", {
        className: `tabs ${custom.scrollerClasses.thin}`
      }, states.map((state) => /* @__PURE__ */ React.createElement("div", {
        className: `item ${state.channelId === currentData.state.channelId ? "active" : ""}`,
        onClick: () => {
          onChange(state);
        }
      }, /* @__PURE__ */ React.createElement("div", {
        className: "content"
      }, /* @__PURE__ */ React.createElement("div", {
        className: "icon",
        style: { backgroundImage: state.guildId ? `url('https://cdn.discordapp.com/icons/${state.guildId}/${state.guildIcon}.png?size=128')` : state.channelId ? `url('https://cdn.discordapp.com/channel-icons/${state.channelId}/${state.channelIcon}.png?size=128')` : null }
      }), /* @__PURE__ */ React.createElement("div", {
        className: "name",
        "acord--tooltip-content": state.guildName || extension.i18n.format("PRIVATE_CALL")
      }, !state.guildId ? extension.i18n.format("PRIVATE_CALL") : state.guildName), !state.guildVanity ? null : /* @__PURE__ */ React.createElement("div", {
        className: "vanity",
        onClick: (ev) => {
          ev.preventDefault();
          if (!state.guildVanity)
            return;
          InviteActions.acceptInviteAndTransitionToInviteChannel({ inviteKey: state.guildVanity });
          e.onClose();
        }
      }, /* @__PURE__ */ React.createElement("div", {
        "acord--tooltip-content": extension.i18n.format("JOIN_GUILD")
      }, /* @__PURE__ */ React.createElement(ArrowIcon, {
        color: COLORS.PRIMARY
      }))))))), /* @__PURE__ */ React.createElement("div", {
        className: "content"
      }, /* @__PURE__ */ React.createElement("div", {
        className: "channel"
      }, /* @__PURE__ */ React.createElement("div", {
        className: "name-container"
      }, /* @__PURE__ */ React.createElement("div", {
        className: "name"
      }, /* @__PURE__ */ React.createElement(VoiceIcon, null), currentData.state.channelName || extension.i18n.format("UNKNOWN")), /* @__PURE__ */ React.createElement("div", {
        className: "controls"
      }, /* @__PURE__ */ React.createElement("div", {
        className: `control ${!currentData.isJoinable ? "vi--cant-click vi--cant-join" : ""}`,
        onClick: (ev) => {
          ev.preventDefault();
          if (!currentData.isJoinable)
            return;
          toasts__default["default"].show(extension.i18n.format("X_JOIN_CHANNEL", currentData.state.channelName));
          selectVoiceChannel(currentData.state.channelId);
          e.onClose();
        }
      }, /* @__PURE__ */ React.createElement("div", {
        "acord--tooltip-content": extension.i18n.format(`${!currentData.isJoinable ? "CANT_" : ""}JOIN`)
      }, /* @__PURE__ */ React.createElement(JoinCallIcon, {
        color: COLORS.SECONDARY
      }))), /* @__PURE__ */ React.createElement("div", {
        className: `control ${!currentData.inMyChannels ? "vi--cant-click" : ""}`,
        onClick: (ev) => {
          ev.preventDefault();
          if (!currentData.inMyChannels)
            return;
          toasts__default["default"].show(extension.i18n.format("X_VIEW_CHANNEL", currentData.state.channelName));
          transitionTo(`/channels/${currentData.state.guildId || "@me"}/${currentData.state.channelId}`);
          e.onClose();
        }
      }, /* @__PURE__ */ React.createElement("div", {
        "acord--tooltip-content": extension.i18n.format(`${!currentData.inMyChannels ? "CANT_" : ""}VIEW`)
      }, /* @__PURE__ */ React.createElement(ArrowIcon, {
        color: COLORS.SECONDARY
      }))))), /* @__PURE__ */ React.createElement("div", {
        className: "members-container"
      }, /* @__PURE__ */ React.createElement("div", {
        className: `members ${custom.scrollerClasses.thin}`
      }, members.map((member) => /* @__PURE__ */ React.createElement(ModalMember, {
        member
      }))))))));
    }

    async function showModal(states) {
      openModal((e) => {
        return /* @__PURE__ */ React__namespace.createElement(Modal, {
          e,
          states
        });
      });
    }

    const selectors = [
      ".nameAndDecorators-3ERwy2",
      ".userText-1_v2Cq h1",
      ".container-3g15px .defaultColor-1EVLSt",
      ".nameAndDecorators-2A8Bbk",
      ".info-3ddo6z .username-Qpc78p"
    ];
    function patchDOM() {
      patchContainer.add(
        dom__default["default"].patch(
          selectors.join(", "),
          (elm) => {
            let user = utils__default["default"].react.getProps(elm, (i) => !!i?.user)?.user;
            if (!user)
              return;
            if (extension.persist.ghost.settings.ignoreBots && user.bot)
              return;
            let indicatorContainer = dom__default["default"].parse(`<span class="vi--icon-container vi--hidden"></span>`);
            let tooltip = ui__default["default"].tooltips.create(indicatorContainer, "");
            let rendering = false;
            let elapsedInterval = null;
            indicatorContainer.render = async () => {
              if (rendering)
                return;
              rendering = true;
              let states = await fetchUserVoiceStates(user.id);
              if (!states.length) {
                indicatorContainer.innerHTML = "";
                indicatorContainer.states = null;
                indicatorContainer.classList.add("vi--hidden");
                indicatorContainer.setAttribute("acord--tooltip-content", "-");
                rendering = false;
                return;
              }
              if (_.isEqual(states, indicatorContainer.states))
                return rendering = false;
              indicatorContainer.states = states;
              let state = states[0];
              let channel = ChannelStore.getChannel(state.channelId);
              indicatorContainer.classList.remove("vi--hidden");
              indicatorContainer.classList[!channel ? "add" : "remove"]("vi--cant-join");
              if (elapsedInterval)
                elapsedInterval();
              let tooltipElm = dom__default["default"].parse(`
            <div class="vi--tooltip">
              <div class="can-connect">${extension.i18n.format(channel ? "CAN_CONNECT" : "CANT_CONNECT")}</div>
              <div class="guild-name">${state.guildId ? state.guildName || "Unknown Guild" : extension.i18n.format("PRIVATE_CALL")}</div>
              <div class="channel-name">${state.channelName || "Plugin Deprecated"}</div>
              ${state.joinedAt !== -1 ? `<div class="time-elapsed">${extension.i18n.format("IN_VOICE_FOR", formatSeconds((Date.now() - state.joinedAt) / 1e3))}</div>` : ""}
              ${states.length > 1 ? `<div class="total-states">${extension.i18n.format("IN_TOTAL_CHANNELS", states.length)}</div>` : ""}
            </div>
          `);
              tooltip.content = tooltipElm;
              if (state.joinedAt !== -1) {
                let timeElapsed = tooltipElm.querySelector(".time-elapsed");
                elapsedInterval = utils__default["default"].interval(() => {
                  timeElapsed.innerHTML = extension.i18n.format("IN_VOICE_FOR", formatSeconds((Date.now() - state.joinedAt) / 1e3));
                }, 1e3);
                if (tooltip?.onDestroy)
                  tooltip.onDestroy(elapsedInterval);
              }
              indicatorContainer.replaceChildren(dom__default["default"].parse(renderIcon(state)));
              rendering = false;
            };
            indicatorContainer.render();
            indicatorContainer.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              showModal(indicatorContainer.states);
            });
            elm.appendChild(indicatorContainer);
            return () => {
              if (elapsedInterval)
                elapsedInterval();
              tooltip.destroy();
            };
          }
        )
      );
    }

    var styles = () => patcher.injectCSS(".vi--icon-container{display:inline-flex;align-items:center;justify-content:center;background-color:#00000080;border-radius:50%;width:18px;height:18px;min-width:18px;min-height:18px;margin-left:4px;z-index:99}.vi--icon{display:flex;transition:filter .1s ease-in-out;color:#fff;width:14px;height:14px}.vi--icon:hover{filter:brightness(1.2)}.vi--red-dot{width:10px;height:10px;border-radius:50%;background-color:#ed4245;box-shadow:0 0 4px #ed4245}.vi--hidden{display:none!important}.vi--modal-root{display:flex;flex-direction:column}.vi--modal-root .vi--modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px}.vi--modal-root .vi--modal-header .title{font-size:28px;font-weight:600;color:#efefef}.vi--modal-root .vi--modal-header .vi--modal-close{width:24px;height:24px}.vi--modal-root .vi--modal-header .vi--modal-close svg{width:24px;height:24px}.vi--modal-root .vi--modal-content{padding:0 16px 16px;display:flex;flex-direction:column}.vi--modal-root .vi--modal-content .tabs{display:flex;gap:4px;overflow-x:auto;padding-bottom:2px}.vi--modal-root .vi--modal-content .tabs .item{width:fit-content;display:flex;align-items:center;justify-content:center;padding:8px;opacity:.75;background-color:#00000040;border-top-left-radius:8px;border-top-right-radius:8px;cursor:pointer;border-bottom:2px solid transparent}.vi--modal-root .vi--modal-content .tabs .item>.content{display:flex;align-items:center;gap:4px}.vi--modal-root .vi--modal-content .tabs .item>.content .icon{width:32px;height:32px;min-width:32px;min-height:32px;background-position:center;background-size:contain;border-radius:50%;background-color:#5865f2}.vi--modal-root .vi--modal-content .tabs .item>.content .name{font-size:16px;color:#efefef;max-width:128px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.vi--modal-root .vi--modal-content .tabs .item>.content .vanity svg{width:14px;height:14px}.vi--modal-root .vi--modal-content .tabs .item:hover{opacity:.85;border-bottom:2px solid rgba(255,255,255,.75)}.vi--modal-root .vi--modal-content .tabs .item.active{opacity:1;border-bottom:2px solid white}.vi--modal-root .vi--modal-content>.content{margin-top:8px}.vi--modal-root .vi--modal-content>.content>.channel>.name-container{display:flex;align-items:center;justify-content:space-between;background-color:#00000040;padding:8px;border-radius:8px}.vi--modal-root .vi--modal-content>.content>.channel>.name-container>.name{display:flex;font-size:20px;font-weight:400;color:#efefef;align-items:center}.vi--modal-root .vi--modal-content>.content>.channel>.name-container>.name svg{margin-right:8px;width:24px;height:24px;pointer-events:none}.vi--modal-root .vi--modal-content>.content>.channel>.name-container>.controls{display:flex}.vi--modal-root .vi--modal-content>.content>.channel>.name-container>.controls>.control{padding:4px;cursor:pointer}.vi--modal-root .vi--modal-content>.content>.channel>.name-container>.controls>.control svg{width:24px;height:24px}.vi--modal-root .vi--modal-content>.content>.channel>.members-container{padding:8px 8px 8px 40px}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members{display:flex;flex-direction:column;overflow:auto;max-height:500px;height:100%;position:relative}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member{display:flex;margin-bottom:4px;cursor:pointer;width:min-content;align-items:center}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.time-elapsed{width:42px;margin-right:8px;font-size:12px;color:#dfdfdf;opacity:.5;text-align:right}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.avatar{width:32px;height:32px;border-radius:50%;background-position:center;background-size:contain;margin-right:8px;background-color:#5865f2}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.avatar.speaking{box-shadow:0 0 0 2px #3ba55d inset}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.about{border-radius:9999px;background-color:#0003;display:flex;align-items:center;padding:8px}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.about>.name-container{display:flex;align-items:center;width:max-content;font-size:16px;color:#dfdfdf}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.about>.name-container .name{width:100%}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.about>.name-container .discriminator{opacity:.5}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.about>.state{background-color:transparent;margin-left:8px}.vi--modal-root .vi--modal-content>.content>.channel>.members-container>.members .member>.about>.state svg{width:16px;height:16px}[class*=userText-] [class*=nameTag-],[class*=topSection-] [class*=nameTag-]{display:flex;align-items:center}[class*=userText-] [class*=nameTag-] *,[class*=topSection-] [class*=nameTag-] *{overflow:hidden}[class*=vi--],[class*=vi--] *{box-sizing:border-box}.vi--cant-join{opacity:.75}.vi--cant-click{cursor:default!important}.vi--tooltip{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start}.vi--tooltip .can-connect,.vi--tooltip .total-states,.vi--tooltip .time-elapsed{font-size:12px;opacity:.75}.vi--tooltip .guild-name{font-size:16px;font-weight:600;padding-left:4px;border-left:4px solid #5865f2}.vi--tooltip .channel-name{font-size:14px;font-weight:400;padding-left:6px;border-left:2px solid #5865f2}.vi--tooltip .total-states{margin-bottom:0}");

    function patchStyles() {
      patchContainer.add(styles());
    }

    function patchBulkUpdater() {
      const wantedGuilds = /* @__PURE__ */ new Set();
      function handleVoiceUpdate(d, alreadyRaw = false) {
        let channel = ChannelStore.getChannel(d.channelId);
        if (!channel?.guild_id || wantedGuilds.has(channel.guild_id)) {
          socket.emit("voiceStateUpdate", [
            d.oldState ? alreadyRaw ? d.oldState : makeRawArray(d.oldState) : null,
            d.newState ? alreadyRaw ? d.newState : makeRawArray(d.newState) : null,
            d.type
          ]);
        }
      }
      let _lastUsers = JSON.parse(JSON.stringify(VoiceStateStore.__getLocalVars().users));
      patchContainer.add((() => {
        function onVoiceStateUpdate(e) {
          let _oldUsers = JSON.parse(JSON.stringify(_lastUsers));
          _lastUsers = JSON.parse(JSON.stringify(VoiceStateStore.__getLocalVars().users));
          e.voiceStates.forEach((ogNS) => {
            let _oldState = _oldUsers?.[ogNS.userId]?.[ogNS.sessionId];
            let oldState = _oldState ? { ..._oldState || {} } : null;
            let _newState = _lastUsers?.[ogNS.userId]?.[ogNS.sessionId];
            let newState = _newState ? { ..._newState || {} } : null;
            handleVoiceUpdate({
              oldState,
              newState,
              type: !newState ? "leave" : !oldState ? "join" : newState.channelId !== oldState.channelId ? "move" : "update"
            });
          });
        }
        FluxDispatcher.subscribe("VOICE_STATE_UPDATES", onVoiceStateUpdate);
        return () => {
          FluxDispatcher.unsubscribe("VOICE_STATE_UPDATES", onVoiceStateUpdate);
          _lastUsers = {};
        };
      })());
      patchContainer.add(
        events__default["default"].on("AuthenticationSuccess", async () => {
          _lastUsers = JSON.parse(JSON.stringify(VoiceStateStore.__getLocalVars().users));
        }),
        events__default["default"].on(
          "DocumentTitleChange",
          _.debounce(() => {
            let guildId = SelectedGuildStore.getGuildId();
            if (guildId)
              wantedGuilds.add(guildId);
          }, 500)
        ),
        () => {
          wantedGuilds.clear();
        }
      );
      patchContainer.add(
        (() => {
          function onSpeaking({ userId, speakingFlags }) {
            socket.emit("speaking", [userId, !!speakingFlags]);
          }
          FluxDispatcher.subscribe("SPEAKING", onSpeaking);
          return () => {
            FluxDispatcher.unsubscribe("SPEAKING", onSpeaking);
          };
        })()
      );
    }

    var src = {};

    var iterator$1 = {};

    var util = {};

    util.isThenable = function isThenable(x) {
      return x != null && typeof x.then === 'function';
    };

    util.isArrayLike = function isArrayLike(x) {
      return x != null && typeof x.length === 'number' && x.length >= 0;
    };

    const { isArrayLike: isArrayLike$1 } = util;

    iterator$1.forEach = function(obj, callback, context) {
      let i = 0;
      let len;

      if (isArrayLike$1(obj)) {
        len = obj.length;

        return {
          next() {
            if (i >= len) {
              return [true, null];
            }

            const value = callback.call(context, obj[i], i, obj);
            i++;
            return [false, value];
          }
        };
      }

      const keys = Object.keys(obj);
      len = keys.length;

      return {
        next() {
          if (i >= len) {
            return [true, null];
          }

          const key = keys[i++];
          const value = callback.call(context, obj[key], key, obj);
          return [false, value];
        }
      };
    };

    iterator$1.repeat = function(count, callback, context) {
      let i;
      let step;
      let done;

      if (count && typeof count === 'object') {
        i = count.start || 0;
        step = count.step || 1;
        done = count.done;
      } else {
        i = 0;
        step = 1;
        done = count;
      }

      return {
        next() {
          const value = callback.call(context, i);

          i += step;
          if (i >= done) {
            return [true, value];
          }
          return [false, value];
        }
      };
    };

    iterator$1.until = function(callback, context) {
      return {
        next() {
          const value = callback.call(context);
          return [false, value];
        }
      };
    };

    iterator$1.forOf = function(iterable, callback, context) {
      const it = iterable[Symbol.iterator]();

      return {
        next() {
          const nextIterator = it.next();

          if (nextIterator.done) {
            return [true, null];
          }
          const value = callback.call(context, nextIterator.value, iterable);
          return [false, value];
        }
      };
    };

    const StopIteration$2 = {};
    var stopIteration = StopIteration$2;

    const nextTick$2 = (() => {
      if (typeof setImmediate === 'function') {
        return task => {
          setImmediate(task);
        };
      }

      if (typeof process === 'object' && typeof process.nextTick === 'function') {
        return task => {
          process.nextTick(task);
        };
      }

      if (typeof MessageChannel === 'function') {
        // http://www.nonblocking.io/2011/06/windownexttick.html
        const channel = new MessageChannel();
        let head = {};
        let tail = head;

        channel.port1.onmessage = () => {
          head = head.next;
          const task = head.task;
          delete head.task;
          task();
        };

        return task => {
          tail = tail.next = { task };
          channel.port2.postMessage(0);
        };
      }

      return task => {
        setTimeout(task, 0);
      };
    })();

    var nextTick_1 = nextTick$2;

    const { isThenable: isThenable$1 } = util;
    const StopIteration$1 = stopIteration;
    const nextTick$1 = nextTick_1;

    const MAX_DELAY = 1500;

    var iterate$1 = function iterate(it, interval = 0) {
      return new Promise((resolve, reject) => {
        let totalTime = 0;

        function doIterate() {
          const cycleStartTime = Date.now();
          let cycleEndTime;

          try {
            for (;;) {
              const [isStop, value] = it.next();

              if (isThenable$1(value)) {
                value.then(awaitedValue => {
                  if (isStop) {
                    resolve(awaitedValue);
                  } else if (awaitedValue === StopIteration$1) {
                    resolve();
                  } else {
                    doIterate();
                  }
                }, reject);
                return;
              }

              if (isStop) {
                resolve(value);
                return;
              }
              if (value === StopIteration$1) {
                resolve();
                return;
              }

              if (interval > 0) {
                break;
              }

              const endTime = Date.now();
              cycleEndTime = endTime - cycleStartTime;
              totalTime += cycleEndTime;

              // Break the loop when the process is continued for more than 1s
              if (totalTime > 1000) {
                break;
              }

              // Delay is not required for fast iteration
              if (cycleEndTime < 10) {
                continue;
              }
              break;
            }
          } catch (e) {
            reject(e);
            return;
          }

          if (interval > 0) {
            // Short timeouts will throttled to >=4ms by the browser, so we execute tasks
            // slowly enough to reduce CPU load
            const delay =  Math.min(MAX_DELAY, Date.now() - cycleStartTime + interval);
            setTimeout(doIterate, delay);
          } else {
            // Add delay corresponding to the processing speed
            const delay = Math.min(MAX_DELAY, cycleEndTime / 3);
            totalTime = 0;

            if (delay > 10) {
              setTimeout(doIterate, delay);
            } else {
              nextTick$1(doIterate);
            }
          }
        }

        // The first call doesn't need to wait, so it will execute a task immediately
        nextTick$1(doIterate);
      });
    };

    var name = "chillout";
    var description = "Reduce CPU usage by non-blocking async loop and psychologically speed up in JavaScript";
    var version = "5.0.0";
    var author = "polygon planet <polygon.planet.aqua@gmail.com>";
    var bugs = {
    	url: "https://github.com/polygonplanet/chillout/issues"
    };
    var devDependencies = {
    	"@babel/core": "^7.8.3",
    	"@babel/preset-env": "^7.8.3",
    	babelify: "^10.0.0",
    	bannerify: "^1.0.1",
    	browserify: "^16.5.0",
    	"es6-shim": "^0.35.5",
    	eslint: "^6.8.0",
    	karma: "^4.4.1",
    	"karma-browserify": "^6.1.0",
    	"karma-chrome-launcher": "^3.1.0",
    	"karma-detect-browsers": "^2.3.3",
    	"karma-es6-shim": "^1.0.0",
    	"karma-firefox-launcher": "^1.3.0",
    	"karma-ie-launcher": "^1.0.0",
    	"karma-mocha": "^1.3.0",
    	"karma-mocha-reporter": "^2.2.5",
    	"karma-safari-launcher": "^1.0.0",
    	mocha: "^7.0.0",
    	"package-json-versionify": "^1.0.4",
    	pidusage: "1.0.2",
    	"power-assert": "^1.6.1",
    	"uglify-js": "^3.7.5",
    	uglifyify: "^5.0.2",
    	watchify: "^3.11.1"
    };
    var engines = {
    	node: ">=8.10.0"
    };
    var files = [
    	"dist/*",
    	"src/*"
    ];
    var homepage = "https://github.com/polygonplanet/chillout";
    var keywords = [
    	"acceleration",
    	"async await",
    	"asynchronous",
    	"cpu use rate",
    	"cpu utilization rate",
    	"heavy processing",
    	"iterate",
    	"iteration",
    	"lightweight",
    	"nextTick",
    	"non-blocking",
    	"optimization",
    	"optimize for loop",
    	"performance",
    	"promise",
    	"reduce cpu usage",
    	"setimmediate",
    	"waitUntil"
    ];
    var license = "MIT";
    var main = "src/index.js";
    var repository = {
    	type: "git",
    	url: "https://github.com/polygonplanet/chillout.git"
    };
    var scripts = {
    	benchmark: "node benchmark/benchmark",
    	build: "npm run compile && npm run minify",
    	compile: "browserify src/index.js -o dist/chillout.js -s chillout -p [ bannerify --file src/banner.js ] --no-bundle-external --bare",
    	minify: "uglifyjs dist/chillout.js -o dist/chillout.min.js --comments -c -m -b ascii_only=true,beautify=false",
    	test: "./node_modules/.bin/eslint . && npm run build && mocha test/**/*.spec.js --timeout 10000 && karma start karma.conf.js",
    	travis: "npm run build && mocha test/**/*.spec.js --timeout 10000 && karma start karma.conf.js --single-run",
    	watch: "watchify src/index.js -o dist/chillout.js -s chillout -p [ bannerify --file src/banner.js ] --no-bundle-external --bare --poll=200 -v"
    };
    var browserify = {
    	transform: [
    		"babelify",
    		"package-json-versionify"
    	]
    };
    var require$$5 = {
    	name: name,
    	description: description,
    	version: version,
    	author: author,
    	bugs: bugs,
    	devDependencies: devDependencies,
    	engines: engines,
    	files: files,
    	homepage: homepage,
    	keywords: keywords,
    	license: license,
    	main: main,
    	repository: repository,
    	scripts: scripts,
    	browserify: browserify
    };

    const iterator = iterator$1;
    const iterate = iterate$1;
    const { isThenable, isArrayLike } = util;
    const nextTick = nextTick_1;
    const StopIteration = stopIteration;

    src.version = require$$5.version;

    /**
     * Executes a provided function once per array or object element.
     * The iteration will break if the callback function returns `chillout.StopIteration`,
     *  or an error occurs.
     * This method can be called like JavaScript `Array forEach`.
     *
     * @param {array|object} obj Target array or object
     * @param {function} callback Function to execute for each element, taking three arguments:
     * - value: The current element being processed in the array/object
     * - key: The key of the current element being processed in the array/object
     * - obj: The array/object that `forEach` is being applied to
     * @param {object} [context] Value to use as `this` when executing callback
     * @return {promise} Return new Promise
     */
    src.forEach = function forEach(obj, callback, context) {
      return iterate(iterator.forEach(obj, callback, context));
    };

    /**
     * Executes a provided function the specified number times.
     * The iteration will break if the callback function returns `chillout.StopIteration`,
     *  or an error occurs.
     * This method can be called like JavaScript `for` statement.
     *
     * @param {number|object} count The number of times or object for execute the
     *   function. Following parameters are available if specify object:
     * - start: The number of start
     * - step: The number of step
     * - end: The number of end
     * @param {function} callback Function to execute for each times, taking one argument:
     * - i: The current number
     * @param {object} [context] Value to use as `this` when executing callback
     * @return {promise} Return new Promise
     */
    src.repeat = function repeat(count, callback, context) {
      return iterate(iterator.repeat(count, callback, context));
    };

    /**
     * Executes a provided function until the `callback` returns `chillout.StopIteration`,
     *  or an error occurs.
     * This method can be called like JavaScript `while (true) { ... }` statement.
     *
     * @param {function} callback The function that is executed for each iteration
     * @param {object} [context] Value to use as `this` when executing callback
     * @return {promise} Return new Promise
     */
    src.until = function until(callback, context) {
      return iterate(iterator.until(callback, context));
    };

    // Minimum setTimeout interval for waitUntil
    const WAIT_UNTIL_INTERVAL = 13;

    /**
     * Executes a provided function until the `callback` returns `chillout.StopIteration`,
     *  or an error occurs.
     * This method can be called like JavaScript `while (true) { ... }` statement,
     *  and it works same as `until`, but it executes tasks with more slowly interval
     *  than `until` to reduce CPU load.
     * This method is useful when you want to wait until some processing done.
     *
     * @param {function} callback The function that is executed for each iteration
     * @param {object} [context] Value to use as `this` when executing callback
     * @return {promise} Return new Promise
     */
    src.waitUntil = function waitUntil(callback, context) {
      return iterate(iterator.until(callback, context), WAIT_UNTIL_INTERVAL);
    };

    /**
     * Iterates the iterable objects, similar to the `for-of` statement.
     * Executes a provided function once per element.
     * The iteration will break if the callback function returns `chillout.StopIteration`,
     *   or an error occurs.
     *
     * @param {array|string|object} iterable Target iterable objects
     * @param {function} callback Function to execute for each element, taking one argument:
     * - value: A value of a property on each iteration
     * @param {object} [context] Value to use as `this` when executing callback
     * @return {promise} Return new Promise
     */
    src.forOf = function forOf(iterable, callback, context) {
      return iterate(iterator.forOf(iterable, callback, context));
    };

    // If you want to stop the loops, return this StopIteration
    // it works like 'break' statement in JavaScript 'for' statement
    src.StopIteration = StopIteration;

    // Exports core methods for user defining other iterations by using chillout
    src.iterate = iterate;
    src.iterator = iterator;
    src.isThenable = isThenable;
    src.isArrayLike = isArrayLike;
    src.nextTick = nextTick;

    function patchLocalCache() {
      patchContainer.add(() => {
        localCache.lastVoiceStates = [];
        localCache.responseCache = /* @__PURE__ */ new Map();
        localCache.stateRequestCache = [];
      });
      patchContainer.add(utils__default["default"].interval(() => {
        localCache.responseCache.forEach((v, k) => {
          if (Date.now() - v.at > v.ttl) {
            localCache.responseCache.delete(k);
          }
        });
      }, 1e3));
      patchContainer.add((() => {
        let STOP = 0;
        async function loop() {
          if (STOP)
            return;
          if (localCache.stateRequestCache.length) {
            (async () => {
              let d = [...localCache.stateRequestCache];
              localCache.stateRequestCache = [];
              let res = (await awaitResponse("bulkState", [...new Set(d.map((i) => i[0]))]))?.data || [];
              await src.forEach(res, (r) => {
                let results = d.filter((i) => i[0] === r[0]);
                results.forEach((v) => {
                  v[1](r[1] || []);
                });
              });
            })();
          }
          setTimeout(loop, extension.persist.ghost.settings.performanceMode ? 100 : 1e3);
        }
        loop();
        return () => {
          STOP = 1;
        };
      })());
    }

    var index = {
      load() {
        patchDOM();
        patchStyles();
        patchUpdater();
        patchLocalCache();
        patchBulkUpdater();
        socket.connect();
      },
      unload() {
        patchContainer.removeAll();
        socket.disconnect();
      }
    };

    return index;

})($acord.authentication, $acord.modules.common, $acord.events, $acord.dom, $acord.utils, $acord.ui, $acord.extension, $acord.modules.common.React, $acord.modules.custom, $acord.ui.toasts, $acord.ui.modals, $acord.patcher);
