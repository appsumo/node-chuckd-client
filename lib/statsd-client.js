/*
 * Set up the statsd-client.
 *
 * Requires the `hostname`. Options currently allows for `port` and `debug` to
 * be set.
 */
function StatsDClient(options) {
    this.options = options || {};
    this._helpers = undefined;

    // Set defaults
    this.options.prefix = this.options.prefix || "";

    // Prefix?
    if (this.options.prefix && this.options.prefix !== "") {
        // Add trailing dot if it's missing
        var p = this.options.prefix;
        this.options.prefix = p[p.length - 1] === '.' ? p : p + ".";
    }

    // Figure out which socket to use
    if (this.options._socket) {
        // Re-use given socket
        this._socket = this.options._socket;
    } else if(this.options.tcp) {
        //User specifically wants a tcp socket
        this._socket = new (require('./TCPSocket'))(this.options);
    } else if (this.options.host && this.options.host.match(/^http(s?):\/\//i)) {
        // Starts with 'http://', then create a HTTP socket
        this._socket = new (require('./HttpSocket'))(this.options);
    } else {
        // Fall back to a UDP ephemeral socket
        this._socket = new (require('./EphemeralSocket'))(this.options);
    }
}

/*
 * Get a "child" client with a sub-prefix.
 */
StatsDClient.prototype.getChildClient = function (extraPrefix) {
    return new StatsDClient({
        prefix: this.options.prefix + extraPrefix,
        _socket: this._socket
    });
};

/*
 * single(appId, hashKey, rangeKey, name, value)
 */
StatsDClient.prototype.single = function (appId, hashKey, rangeKey, name, value, cmd, type) {
  var key = [appId.replace(/:/g, '_'), hashKey.replace(/:/g, '_')];
  if (rangeKey) key.push(rangeKey.replace(/:/g, '_'));
  this._socket.send(key.join('--') + ':' + [name, value, cmd, type || 'S'].join('|'));
};

/*
 * put(appId, hashKey, rangeKey, name, value)
 */
StatsDClient.prototype.put = function (appId, hashKey, rangeKey, name, value, type) {
  this.single(appId, hashKey, rangeKey, name, value, 'p', type || 'S');
};

/*
 * increment(appId, hashKey, rangeKey, name, delta)
 */
StatsDClient.prototype.increment = function (appId, hashKey, rangeKey, name, delta) {
  this.single(appId, hashKey, rangeKey, name, Math.abs(delta || 1), 'a', 'N');
};

/*
 * decrement(appId, hashKey, rangeKey, name, delta)
 */
StatsDClient.prototype.decrement = function (appId, hashKey, rangeKey, name, delta) {
  this.single(appId, hashKey, rangeKey, name, -1 * Math.abs(delta || 1), 'a', 'N');
};

/*
 * Close the socket, if in use and cancel the interval-check, if running.
 */
StatsDClient.prototype.close = function () {
    this._socket.close();
};

/*
 * Return an object with available helpers.
 */
StatsDClient.prototype.__defineGetter__('helpers', function () {
    if (!(this._helpers)) {
        var helpers = {},
            that = this,
            files = require('fs').readdirSync(__dirname + '/helpers');

        files.forEach(function (filename) {
            if (/\.js$/.test(filename) && filename !== 'index.js') {
                var name = filename.replace(/\.js$/, '');
                helpers[name] = require('./helpers/' + filename)(that);
            }
        });
        this._helpers = helpers;
    }

    return this._helpers;
});

module.exports = StatsDClient;
