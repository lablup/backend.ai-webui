/* ansi_up.js
 * author : Dru Nelson
 * license : MIT
 * http://github.com/drudru/ansi_up
 */
'use strict';
// Used internally when breaking up the raw text into packets
var PacketKind;
(function (PacketKind) {
  PacketKind[(PacketKind['EOS'] = 0)] = 'EOS';
  PacketKind[(PacketKind['Text'] = 1)] = 'Text';
  PacketKind[(PacketKind['Incomplete'] = 2)] = 'Incomplete';
  PacketKind[(PacketKind['ESC'] = 3)] = 'ESC';
  PacketKind[(PacketKind['Unknown'] = 4)] = 'Unknown';
  PacketKind[(PacketKind['SGR'] = 5)] = 'SGR';
  PacketKind[(PacketKind['OSCURL'] = 6)] = 'OSCURL';
})(PacketKind || (PacketKind = {}));
//
// MAIN CLASS
//
var AnsiUp = /** @class */ (function () {
  function AnsiUp() {
    this.VERSION = '4.0.3';
    // All construction occurs here
    this.setup_palettes();
    this._use_classes = false;
    this._escape_for_html = true;
    this.bold = false;
    this.fg = this.bg = null;
    this._buffer = '';
    this._url_whitelist = { http: 1, https: 1 };
  }
  Object.defineProperty(AnsiUp.prototype, 'use_classes', {
    get: function () {
      return this._use_classes;
    },
    set: function (arg) {
      this._use_classes = arg;
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(AnsiUp.prototype, 'escape_for_html', {
    get: function () {
      return this._escape_for_html;
    },
    set: function (arg) {
      this._escape_for_html = arg;
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(AnsiUp.prototype, 'url_whitelist', {
    get: function () {
      return this._url_whitelist;
    },
    set: function (arg) {
      this._url_whitelist = arg;
    },
    enumerable: true,
    configurable: true,
  });
  AnsiUp.prototype.setup_palettes = function () {
    var _this = this;
    this.ansi_colors = [
      // Normal colors
      [
        { rgb: [0, 0, 0], class_name: 'ansi-black' },
        { rgb: [187, 0, 0], class_name: 'ansi-red' },
        { rgb: [0, 187, 0], class_name: 'ansi-green' },
        { rgb: [187, 187, 0], class_name: 'ansi-yellow' },
        { rgb: [0, 0, 187], class_name: 'ansi-blue' },
        { rgb: [187, 0, 187], class_name: 'ansi-magenta' },
        { rgb: [0, 187, 187], class_name: 'ansi-cyan' },
        { rgb: [255, 255, 255], class_name: 'ansi-white' },
      ],
      // Bright colors
      [
        { rgb: [85, 85, 85], class_name: 'ansi-bright-black' },
        { rgb: [255, 85, 85], class_name: 'ansi-bright-red' },
        { rgb: [0, 255, 0], class_name: 'ansi-bright-green' },
        { rgb: [255, 255, 85], class_name: 'ansi-bright-yellow' },
        { rgb: [85, 85, 255], class_name: 'ansi-bright-blue' },
        { rgb: [255, 85, 255], class_name: 'ansi-bright-magenta' },
        { rgb: [85, 255, 255], class_name: 'ansi-bright-cyan' },
        { rgb: [255, 255, 255], class_name: 'ansi-bright-white' },
      ],
    ];
    this.palette_256 = [];
    // Index 0..15 : Ansi-Colors
    this.ansi_colors.forEach(function (palette) {
      palette.forEach(function (rec) {
        _this.palette_256.push(rec);
      });
    });
    // Index 16..231 : RGB 6x6x6
    // https://gist.github.com/jasonm23/2868981#file-xterm-256color-yaml
    var levels = [0, 95, 135, 175, 215, 255];
    for (var r = 0; r < 6; ++r) {
      for (var g = 0; g < 6; ++g) {
        for (var b = 0; b < 6; ++b) {
          var col = {
            rgb: [levels[r], levels[g], levels[b]],
            class_name: 'truecolor',
          };
          this.palette_256.push(col);
        }
      }
    }
    // Index 232..255 : Grayscale
    var grey_level = 8;
    for (var i = 0; i < 24; ++i, grey_level += 10) {
      var gry = {
        rgb: [grey_level, grey_level, grey_level],
        class_name: 'truecolor',
      };
      this.palette_256.push(gry);
    }
  };
  AnsiUp.prototype.escape_txt_for_html = function (txt) {
    return txt.replace(/[&<>]/gm, function (str) {
      if (str === '&') return '&amp;';
      if (str === '<') return '&lt;';
      if (str === '>') return '&gt;';
    });
  };
  AnsiUp.prototype.append_buffer = function (txt) {
    var str = this._buffer + txt;
    this._buffer = str;
  };
  AnsiUp.prototype.__makeTemplateObject = function (cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, 'raw', { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  };

  AnsiUp.prototype.get_next_packet = function () {
    var pkt = {
      kind: PacketKind.EOS,
      text: '',
      url: '',
    };
    var len = this._buffer.length;
    if (len == 0) return pkt;
    var pos = this._buffer.indexOf('\x1B');
    // The most common case, no ESC codes
    if (pos == -1) {
      pkt.kind = PacketKind.Text;
      pkt.text = this._buffer;
      this._buffer = '';
      return pkt;
    }
    if (pos > 0) {
      pkt.kind = PacketKind.Text;
      pkt.text = this._buffer.slice(0, pos);
      this._buffer = this._buffer.slice(pos);
      return pkt;
    }
    // NOW WE HANDLE ESCAPES
    if (pos == 0) {
      if (len == 1) {
        // Lone ESC in Buffer, We don't know yet
        pkt.kind = PacketKind.Incomplete;
        return pkt;
      }
      var next_char = this._buffer.charAt(1);
      // We treat this as a single ESC
      // Which effecitvely shows
      if (next_char != '[' && next_char != ']') {
        // DeMorgan
        pkt.kind = PacketKind.ESC;
        pkt.text = this._buffer.slice(0, 1);
        this._buffer = this._buffer.slice(1);
        return pkt;
      }
      // OK is this an SGR or OSC that we handle
      // SGR CHECK
      if (next_char == '[') {
        // We do this regex initialization here so
        // we can keep the regex close to its use (Readability)
        // All ansi codes are typically in the following format.
        // We parse it and focus specifically on the
        // graphics commands (SGR)
        //
        // CONTROL-SEQUENCE-INTRODUCER CSI             (ESC, '[')
        // PRIVATE-MODE-CHAR                           (!, <, >, ?)
        // Numeric parameters separated by semicolons  ('0' - '9', ';')
        // Intermediate-modifiers                      (0x20 - 0x2f)
        // COMMAND-CHAR                                (0x40 - 0x7e)
        //
        if (!this._csi_regex) {
          this._csi_regex = rgx(
            this.__makeTemplateObject(
              [
                '\n                        ^                           # beginning of line\n                                                    #\n                                                    # First attempt\n                        (?:                         # legal sequence\n                          \u001B[                      # CSI\n                          ([<-?]?)              # private-mode char\n                          ([d;]*)                    # any digits or semicolons\n                          ([ -/]?               # an intermediate modifier\n                          [@-~])                # the command\n                        )\n                        |                           # alternate (second attempt)\n                        (?:                         # illegal sequence\n                          \u001B[                      # CSI\n                          [ -~]*                # anything legal\n                          ([\0-\u001F:])              # anything illegal\n                        )\n                    ',
              ],
              [
                '\n                        ^                           # beginning of line\n                                                    #\n                                                    # First attempt\n                        (?:                         # legal sequence\n                          \\x1b\\[                      # CSI\n                          ([\\x3c-\\x3f]?)              # private-mode char\n                          ([\\d;]*)                    # any digits or semicolons\n                          ([\\x20-\\x2f]?               # an intermediate modifier\n                          [\\x40-\\x7e])                # the command\n                        )\n                        |                           # alternate (second attempt)\n                        (?:                         # illegal sequence\n                          \\x1b\\[                      # CSI\n                          [\\x20-\\x7e]*                # anything legal\n                          ([\\x00-\\x1f:])              # anything illegal\n                        )\n                    ',
              ],
            ),
          );
        }
        var match = this._buffer.match(this._csi_regex);
        // This match is guaranteed to terminate (even on
        // invalid input). The key is to match on legal and
        // illegal sequences.
        // The first alternate matches everything legal and
        // the second matches everything illegal.
        //
        // If it doesn't match, then we have not received
        // either the full sequence or an illegal sequence.
        // If it does match, the presence of field 4 tells
        // us whether it was legal or illegal.
        if (match === null) {
          pkt.kind = PacketKind.Incomplete;
          return pkt;
        }
        // match is an array
        // 0 - total match
        // 1 - private mode chars group
        // 2 - digits and semicolons group
        // 3 - command
        // 4 - illegal char
        if (match[4]) {
          // Illegal sequence, just remove the ESC
          pkt.kind = PacketKind.ESC;
          pkt.text = this._buffer.slice(0, 1);
          this._buffer = this._buffer.slice(1);
          return pkt;
        }
        // If not a valid SGR, we don't handle
        if (match[1] != '' || match[3] != 'm') pkt.kind = PacketKind.Unknown;
        else pkt.kind = PacketKind.SGR;
        pkt.text = match[2]; // Just the parameters
        var rpos = match[0].length;
        this._buffer = this._buffer.slice(rpos);
        return pkt;
      }
      // OSC CHECK
      if (next_char == ']') {
        if (len < 4) {
          pkt.kind = PacketKind.Incomplete;
          return pkt;
        }
        if (this._buffer.charAt(2) != '8' || this._buffer.charAt(3) != ';') {
          // This is not a match, so we'll just treat it as ESC
          pkt.kind = PacketKind.ESC;
          pkt.text = this._buffer.slice(0, 1);
          this._buffer = this._buffer.slice(1);
          return pkt;
        }
        // We do this regex initialization here so
        // we can keep the regex close to its use (Readability)
        // Matching a Hyperlink OSC with a regex is difficult
        // because Javascript's regex engine doesn't support
        // 'partial match' support.
        //
        // Therefore, we require the system to match the
        // string-terminator(ST) before attempting a match.
        // Once we find it, we attempt the Hyperlink-Begin
        // match.
        // If that goes ok, we scan forward for the next
        // ST.
        // Finally, we try to match it all and return
        // the sequence.
        // Also, it is important to note that we consider
        // certain control characters as an invalidation of
        // the entire sequence.
        // We do regex initializations here so
        // we can keep the regex close to its use (Readability)
        // STRING-TERMINATOR
        // This is likely to terminate in most scenarios
        // because it will terminate on a newline
        if (!this._osc_st) {
          this._osc_st = rgxG(
            this.__makeTemplateObject(
              [
                '\n                        (?:                         # legal sequence\n                          (\u001B\\)                    # ESC                           |                           # alternate\n                          (\u0007)                      # BEL (what xterm did)\n                        )\n                        |                           # alternate (second attempt)\n                        (                           # illegal sequence\n                          [\0-\u0006]                 # anything illegal\n                          |                           # alternate\n                          [\b-\u001A]                 # anything illegal\n                          |                           # alternate\n                          [\u001C-\u001F]                 # anything illegal\n                        )\n                    ',
              ],
              [
                '\n                        (?:                         # legal sequence\n                          (\\x1b\\\\)                    # ESC \\\n                          |                           # alternate\n                          (\\x07)                      # BEL (what xterm did)\n                        )\n                        |                           # alternate (second attempt)\n                        (                           # illegal sequence\n                          [\\x00-\\x06]                 # anything illegal\n                          |                           # alternate\n                          [\\x08-\\x1a]                 # anything illegal\n                          |                           # alternate\n                          [\\x1c-\\x1f]                 # anything illegal\n                        )\n                    ',
              ],
            ),
          );
        }
        // VERY IMPORTANT
        // We do a stateful regex match with exec.
        // If the regex is global, and it used with 'exec',
        // then it will search starting at the 'lastIndex'
        // If it matches, the regex can be used again to
        // find the next match.
        this._osc_st.lastIndex = 0;
        {
          var match_1 = this._osc_st.exec(this._buffer);
          if (match_1 === null) {
            pkt.kind = PacketKind.Incomplete;
            return pkt;
          }
          // If an illegal character was found, bail on the match
          if (match_1[3]) {
            // Illegal sequence, just remove the ESC
            pkt.kind = PacketKind.ESC;
            pkt.text = this._buffer.slice(0, 1);
            this._buffer = this._buffer.slice(1);
            return pkt;
          }
        }
        // OK - we might have the prefix and URI
        // Lets start our search for the next ST
        // past this index
        {
          var match_2 = this._osc_st.exec(this._buffer);
          if (match_2 === null) {
            pkt.kind = PacketKind.Incomplete;
            return pkt;
          }
          // If an illegal character was found, bail on the match
          if (match_2[3]) {
            // Illegal sequence, just remove the ESC
            pkt.kind = PacketKind.ESC;
            pkt.text = this._buffer.slice(0, 1);
            this._buffer = this._buffer.slice(1);
            return pkt;
          }
        }
        // OK, at this point we should have a FULL match!
        //
        // Lets try to match that now
        if (!this._osc_regex) {
          this._osc_regex = rgx(
            this.__makeTemplateObject(
              [
                '\n                        ^                           # beginning of line\n                                                    #\n                        \u001B]8;                    # OSC Hyperlink\n                        [ -:<-~]*       # params (excluding ;)\n                        ;                           # end of params\n                        ([!-~]{0,512})        # URL capture\n                        (?:                         # ST\n                          (?:\u001B\\)                  # ESC                           |                           # alternate\n                          (?:\u0007)                    # BEL (what xterm did)\n                        )\n                        ([!-~]+)              # TEXT capture\n                        \u001B]8;;                   # OSC Hyperlink End\n                        (?:                         # ST\n                          (?:\u001B\\)                  # ESC                           |                           # alternate\n                          (?:\u0007)                    # BEL (what xterm did)\n                        )\n                    ',
              ],
              [
                '\n                        ^                           # beginning of line\n                                                    #\n                        \\x1b\\]8;                    # OSC Hyperlink\n                        [\\x20-\\x3a\\x3c-\\x7e]*       # params (excluding ;)\n                        ;                           # end of params\n                        ([\\x21-\\x7e]{0,512})        # URL capture\n                        (?:                         # ST\n                          (?:\\x1b\\\\)                  # ESC \\\n                          |                           # alternate\n                          (?:\\x07)                    # BEL (what xterm did)\n                        )\n                        ([\\x21-\\x7e]+)              # TEXT capture\n                        \\x1b\\]8;;                   # OSC Hyperlink End\n                        (?:                         # ST\n                          (?:\\x1b\\\\)                  # ESC \\\n                          |                           # alternate\n                          (?:\\x07)                    # BEL (what xterm did)\n                        )\n                    ',
              ],
            ),
          );
        }
        var match = this._buffer.match(this._osc_regex);
        if (match === null) {
          // Illegal sequence, just remove the ESC
          pkt.kind = PacketKind.ESC;
          pkt.text = this._buffer.slice(0, 1);
          this._buffer = this._buffer.slice(1);
          return pkt;
        }
        // match is an array
        // 0 - total match
        // 1 - URL
        // 2 - Text
        // If a valid SGR
        pkt.kind = PacketKind.OSCURL;
        pkt.url = match[1];
        pkt.text = match[2];
        var rpos = match[0].length;
        this._buffer = this._buffer.slice(rpos);
        return pkt;
      }
    }
  };
  AnsiUp.prototype.ansi_to_html = function (txt) {
    this.append_buffer(txt);
    var blocks = [];
    while (true) {
      var packet = this.get_next_packet();
      if (packet.kind == PacketKind.EOS || packet.kind == PacketKind.Incomplete)
        break;
      //Drop single ESC or Unknown CSI
      if (packet.kind == PacketKind.ESC || packet.kind == PacketKind.Unknown)
        continue;
      if (packet.kind == PacketKind.Text)
        blocks.push(this.transform_to_html(this.with_state(packet)));
      else if (packet.kind == PacketKind.SGR) this.process_ansi(packet);
      else if (packet.kind == PacketKind.OSCURL)
        blocks.push(this.process_hyperlink(packet));
    }
    return blocks.join('');
  };
  AnsiUp.prototype.with_state = function (pkt) {
    return { bold: this.bold, fg: this.fg, bg: this.bg, text: pkt.text };
  };
  AnsiUp.prototype.process_ansi = function (pkt) {
    // Ok - we have a valid "SGR" (Select Graphic Rendition)
    var sgr_cmds = pkt.text.split(';');
    // Each of these params affects the SGR state
    // Why do we shift through the array instead of a forEach??
    // ... because some commands consume the params that follow !
    while (sgr_cmds.length > 0) {
      var sgr_cmd_str = sgr_cmds.shift();
      var num = parseInt(sgr_cmd_str, 10);
      if (isNaN(num) || num === 0) {
        this.fg = this.bg = null;
        this.bold = false;
      } else if (num === 1) {
        this.bold = true;
      } else if (num === 22) {
        this.bold = false;
      } else if (num === 39) {
        this.fg = null;
      } else if (num === 49) {
        this.bg = null;
      } else if (num >= 30 && num < 38) {
        this.fg = this.ansi_colors[0][num - 30];
      } else if (num >= 40 && num < 48) {
        this.bg = this.ansi_colors[0][num - 40];
      } else if (num >= 90 && num < 98) {
        this.fg = this.ansi_colors[1][num - 90];
      } else if (num >= 100 && num < 108) {
        this.bg = this.ansi_colors[1][num - 100];
      } else if (num === 38 || num === 48) {
        // extended set foreground/background color
        // validate that param exists
        if (sgr_cmds.length > 0) {
          // extend color (38=fg, 48=bg)
          var is_foreground = num === 38;
          var mode_cmd = sgr_cmds.shift();
          // MODE '5' - 256 color palette
          if (mode_cmd === '5' && sgr_cmds.length > 0) {
            var palette_index = parseInt(sgr_cmds.shift(), 10);
            if (palette_index >= 0 && palette_index <= 255) {
              if (is_foreground) this.fg = this.palette_256[palette_index];
              else this.bg = this.palette_256[palette_index];
            }
          }
          // MODE '2' - True Color
          if (mode_cmd === '2' && sgr_cmds.length > 2) {
            var r = parseInt(sgr_cmds.shift(), 10);
            var g = parseInt(sgr_cmds.shift(), 10);
            var b = parseInt(sgr_cmds.shift(), 10);
            if (
              r >= 0 &&
              r <= 255 &&
              g >= 0 &&
              g <= 255 &&
              b >= 0 &&
              b <= 255
            ) {
              var c = { rgb: [r, g, b], class_name: 'truecolor' };
              if (is_foreground) this.fg = c;
              else this.bg = c;
            }
          }
        }
      }
    }
  };
  AnsiUp.prototype.transform_to_html = function (fragment) {
    var txt = fragment.text;
    if (txt.length === 0) return txt;
    if (this._escape_for_html) txt = this.escape_txt_for_html(txt);
    // If colors not set, default style is used
    if (!fragment.bold && fragment.fg === null && fragment.bg === null)
      return txt;
    var styles = [];
    var classes = [];
    var fg = fragment.fg;
    var bg = fragment.bg;
    // Note on bold: https://stackoverflow.com/questions/6737005/what-are-some-advantages-to-using-span-style-font-weightbold-rather-than-b?rq=1
    if (fragment.bold) styles.push('font-weight:bold');
    if (!this._use_classes) {
      // USE INLINE STYLES
      if (fg) styles.push('color:rgb(' + fg.rgb.join(',') + ')');
      if (bg) styles.push('background-color:rgb(' + bg.rgb + ')');
    } else {
      // USE CLASSES
      if (fg) {
        if (fg.class_name !== 'truecolor') {
          classes.push(fg.class_name + '-fg');
        } else {
          styles.push('color:rgb(' + fg.rgb.join(',') + ')');
        }
      }
      if (bg) {
        if (bg.class_name !== 'truecolor') {
          classes.push(bg.class_name + '-bg');
        } else {
          styles.push('background-color:rgb(' + bg.rgb.join(',') + ')');
        }
      }
    }
    var class_string = '';
    var style_string = '';
    if (classes.length) class_string = ' class="' + classes.join(' ') + '"';
    if (styles.length) style_string = ' style="' + styles.join(';') + '"';
    return '<span' + style_string + class_string + '>' + txt + '</span>';
  };
  AnsiUp.prototype.process_hyperlink = function (pkt) {
    // Check URL scheme
    var parts = pkt.url.split(':');
    if (parts.length < 1) return '';
    if (!this._url_whitelist[parts[0]]) return '';
    var result =
      '<a href="' +
      this.escape_txt_for_html(pkt.url) +
      '">' +
      this.escape_txt_for_html(pkt.text) +
      '</a>';
    return result;
  };
  return AnsiUp;
})();
//
// PRIVATE FUNCTIONS
//
// ES5 template string transformer
function rgx(tmplObj) {
  var subst = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    subst[_i - 1] = arguments[_i];
  }
  // Use the 'raw' value so we don't have to double backslash in a template string
  var regexText = tmplObj.raw[0];
  // Remove white-space and comments
  var wsrgx = /^\s+|\s+\n|\s*#[\s\S]*?\n|\n/gm;
  var txt2 = regexText.replace(wsrgx, '');
  return new RegExp(txt2);
}
// ES5 template string transformer
// Multi-Line On
function rgxG(tmplObj) {
  var subst = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    subst[_i - 1] = arguments[_i];
  }
  // Use the 'raw' value so we don't have to double backslash in a template string
  var regexText = tmplObj.raw[0];
  // Remove white-space and comments
  var wsrgx = /^\s+|\s+\n|\s*#[\s\S]*?\n|\n/gm;
  var txt2 = regexText.replace(wsrgx, '');
  return new RegExp(txt2, 'g');
}

export default AnsiUp;
