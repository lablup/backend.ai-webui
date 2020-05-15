const logger = require('./logger')(__filename);
let _n = 0;

const name = stream => stream._sig || "tcp";

module.exports = function(s1, s2) {
  const n = _n++;
  const debug_log = (stream, msg) => {
    logger.debug(`${n} ${name(stream)} ${msg}`);
  };
  const error_log = (stream, msg) => {
    logger.warn(`LOGGGGGG ${n} ${name(stream)} ${msg}`);
  };

  // add stop:  end() once wrapper
  const stop = function() {
    if (!this._stop) {
      debug_log(this, 'stop');
      this._stop = true;
      return this.end();
    }
  };
  s1.stop = stop;
  s2.stop = stop;
  // bind error handlers
  s1.on('error', function(err) { error_log(s1, err); s1.stop(); return s2.stop(); });
  s2.on('error', function(err) { error_log(s2, err); s2.stop(); return s1.stop(); });

  const manualPipe = function() {
    s1.on('data', function(data) { if (!s2._stop) { return s2.write(data); } });
    s2.on('data', function(data) { if (!s1._stop) { return s1.write(data); } });

    s1.on('finish', function() { debug_log(s1, 'finish'); return s2.stop(); });
    s1.on('end', function() { debug_log(s1, 'end'); return s2.stop(); });
    s1.on('close', function() { debug_log(s1, 'close'); return s2.stop(); });
    s2.on('finish', function() { debug_log(s2, 'finish'); return s1.stop(); });
    s2.on('end', function() { debug_log(s2, 'end'); return s1.stop(); });
    return s2.on('close', function() { debug_log(s2, 'close'); return s1.stop(); });
  };

  const autoPipe = function() {
    s1.on('close', function() {
      debug_log(s1, 'close');
      return s2.stop();
    });
    s2.on('close', function() {
      debug_log(s2, 'close');
      return s1.stop();
    });
    return s1.pipe(s2, { end: true })
      .on('error', function(err) { error_log(s2, err); s1.stop(); return s2.stop();})
      .pipe(s1, { end: true })
      .on('error', function(err) { error_log(s1, err); s1.stop(); return s2.stop();});
  };

  autoPipe();
  //manualPipe();
};
