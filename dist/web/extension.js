/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

      "use strict";
      module.exports = require("vscode");

      /***/
}),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LatexCompiler)
        /* harmony export */
});
/* harmony import */ var _texlive_js_promisejs_promise_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _texlive_js_promisejs_promise_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_texlive_js_promisejs_promise_js__WEBPACK_IMPORTED_MODULE_0__);

      __webpack_require__(4);

      class LatexCompiler {
        pdf_tex = new PDFTeX;
        #workspace;
        static #path_name_regex = /^(.+)\/(.+?)$/;

        constructor(vscode) {
          this.#workspace = vscode.workspace;

          const mem_promise = pdftex.set_TOTAL_MEMORY(80 * 1024 * 1024);
          (async () => {
            const r = await mem_promise;
            debugger;
            console.log(r);
          })();
        }

        async addFiles() {
          const files_promise = this.#workspace.findFiles('**/*');
          const files = await files_promise;
          for (const { path } of files) {
            try {
              const document = await this.#workspace.openTextDocument(path);
              const content = document.getText();
              const [, parent_path, file_name] = path.match(this.constructor.#path_name_regex);
              const promise = pdf_tex.FS_createDataFile(parent_path, file_name, content, true, true);
              debugger;
            } catch (error) {
              console.warn(error);
            }
          }
        }
      };


      /***/
}),
/* 3 */
/***/ (function (module, exports, __webpack_require__) {

      var __WEBPACK_AMD_DEFINE_RESULT__;/*
 *  Copyright 2012-2013 (c) Pierre Duquesne <stackp@online.fr>
 *  Licensed under the New BSD License.
 *  https://github.com/stackp/promisejs
 */

<<<<<<< HEAD
      (function (exports) {

        function Promise() {
          this._callbacks = [];
        }

        Promise.prototype.then = function (func, context) {
          var p;
          if (this._isdone) {
            p = func.apply(context, this.result);
          } else {
            p = new Promise();
            this._callbacks.push(function () {
              var res = func.apply(context, arguments);
              if (res && typeof res.then === 'function')
                res.then(p.done, p);
            });
          }
          return p;
        };

        Promise.prototype.done = function () {
          this.result = arguments;
          this._isdone = true;
          for (var i = 0; i < this._callbacks.length; i++) {
            this._callbacks[i].apply(null, arguments);
          }
          this._callbacks = [];
        };

        function join(promises) {
          var p = new Promise();
          var total = promises.length;
          var numdone = 0;
          var results = [];

          function notifier(i) {
            return function () {
              numdone += 1;
              results[i] = Array.prototype.slice.call(arguments);
              if (numdone === total) {
                p.done(results);
              }
            };
          }

          for (var i = 0; i < total; i++) {
            promises[i].then(notifier(i));
          }

          return p;
        }

        function chain(funcs, args) {
          var p = new Promise();
          if (funcs.length === 0) {
            p.done.apply(p, args);
          } else {
            funcs[0].apply(null, args).then(function () {
              funcs.splice(0, 1);
              chain(funcs, arguments).then(function () {
                p.done.apply(p, arguments);
              });
            });
          }
          return p;
        }

        /*
         * AJAX requests
         */

        function _encode(data) {
          var result = "";
          if (typeof data === "string") {
            result = data;
          } else {
            var e = encodeURIComponent;
            for (var k in data) {
              if (data.hasOwnProperty(k)) {
                result += '&' + e(k) + '=' + e(data[k]);
              }
            }
          }
          return result;
        }

        function new_xhr() {
          var xhr;
          if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
          } else if (window.ActiveXObject) {
            try {
              xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
              xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
          }
          return xhr;
        }


        function ajax(method, url, data, headers) {
          var p = new Promise();
          var xhr, payload;
          data = data || {};
          headers = headers || {};

          try {
            xhr = new_xhr();
          } catch (e) {
            p.done(promise.ENOXHR, "");
            return p;
          }

          payload = _encode(data);
          if (method === 'GET' && payload) {
            url += '?' + payload;
            payload = null;
          }

          xhr.open(method, url);
          xhr.setRequestHeader('Content-type',
            'application/x-www-form-urlencoded');
          for (var h in headers) {
            if (headers.hasOwnProperty(h)) {
              xhr.setRequestHeader(h, headers[h]);
            }
          }

          function onTimeout() {
            xhr.abort();
            p.done(promise.ETIMEOUT, "", xhr);
          }

          var timeout = promise.ajaxTimeout;
          if (timeout) {
            var tid = setTimeout(onTimeout, timeout);
          }

          xhr.onreadystatechange = function () {
            if (timeout) {
              clearTimeout(tid);
            }
            if (xhr.readyState === 4) {
              var err = (!xhr.status ||
                (xhr.status < 200 || xhr.status >= 300) &&
                xhr.status !== 304);
              p.done(err, xhr.responseText, xhr);
            }
          };

          xhr.send(payload);
          return p;
        }

        function _ajaxer(method) {
          return function (url, data, headers) {
            return ajax(method, url, data, headers);
          };
        }

        var promise = {
          Promise: Promise,
          join: join,
          chain: chain,
          ajax: ajax,
          get: _ajaxer('GET'),
          post: _ajaxer('POST'),
          put: _ajaxer('PUT'),
          del: _ajaxer('DELETE'),

          /* Error codes */
          ENOXHR: 1,
          ETIMEOUT: 2,

          /**
           * Configuration parameter: time in milliseconds after which a
           * pending AJAX request is considered unresponsive and is
           * aborted. Useful to deal with bad connectivity (e.g. on a
           * mobile network). A 0 value disables AJAX timeouts.
           *
           * Aborted requests resolve the promise with a ETIMEOUT error
           * code.
           */
          ajaxTimeout: 0
        };

        if (true) {
          /* AMD support */
          !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
            return promise;
          }).call(exports, __webpack_require__, exports, module),
            __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        } else { }

      })(this);


      /***/
}),
/* 4 */
/***/ (() => {

      var PDFTeX = function (opt_workerPath) {
        if (!opt_workerPath) {
          opt_workerPath = 'pdftex-worker.js';
        }
        var worker = new Worker(opt_workerPath);
        var self = this;
        var initialized = false;

        self.on_stdout = function (msg) {
          console.log(msg);
        }

        self.on_stderr = function (msg) {
          console.log(msg);
        }


        worker.onmessage = function (ev) {
          var data = JSON.parse(ev.data);
          var msg_id;

          if (!('command' in data))
            console.log("missing command!", data);
          switch (data['command']) {
            case 'ready':
              onready.done(true);
              break;
            case 'stdout':
            case 'stderr':
              self['on_' + data['command']](data['contents']);
              break;
            default:
              //console.debug('< received', data);
              msg_id = data['msg_id'];
              if (('msg_id' in data) && (msg_id in promises)) {
                promises[msg_id].done(data['result']);
              }
              else
                console.warn('Unknown worker message ' + msg_id + '!');
          }
        }

        var onready = new promise.Promise();
        var promises = [];
        var chunkSize = undefined;

        var sendCommand = function (cmd) {
          var p = new promise.Promise();
          var msg_id = promises.push(p) - 1;

          onready.then(function () {
            cmd['msg_id'] = msg_id;
            //console.debug('> sending', cmd);
            worker.postMessage(JSON.stringify(cmd));
          });

          return p;
        };

        var determineChunkSize = function () {
          var size = 1024;
          var max = undefined;
          var min = undefined;
          var delta = size;
          var success = true;
          var buf;

          while (Math.abs(delta) > 100) {
            if (success) {
              min = size;
              if (typeof (max) === 'undefined')
                delta = size;
              else
                delta = (max - size) / 2;
            }
            else {
              max = size;
              if (typeof (min) === 'undefined')
                delta = -1 * size / 2;
              else
                delta = -1 * (size - min) / 2;
            }
            size += delta;

            success = true;
            try {
              buf = String.fromCharCode.apply(null, new Uint8Array(size));
              sendCommand({
                command: 'test',
                data: buf,
              });
            }
            catch (e) {
              success = false;
            }
          }

          return size;
        };


        var createCommand = function (command) {
          self[command] = function () {
            var args = [].concat.apply([], arguments);

            return sendCommand({
              'command': command,
              'arguments': args,
            });
          }
        }
        createCommand('FS_createDataFile'); // parentPath, filename, data, canRead, canWrite
        createCommand('FS_readFile'); // filename
        createCommand('FS_unlink'); // filename
        createCommand('FS_createFolder'); // parent, name, canRead, canWrite
        createCommand('FS_createPath'); // parent, name, canRead, canWrite
        createCommand('FS_createLazyFile'); // parent, name, canRead, canWrite
        createCommand('FS_createLazyFilesFromList'); // parent, list, parent_url, canRead, canWrite
        createCommand('set_TOTAL_MEMORY'); // size

        var curry = function (obj, fn, args) {
          return function () {
            return obj[fn].apply(obj, args);
          }
        }

        self.compile = function (source_code) {
          var p = new promise.Promise();

          self.compileRaw(source_code).then(function (binary_pdf) {
            if (binary_pdf === false)
              return p.done(false);

            pdf_dataurl = 'data:application/pdf;charset=binary;base64,' + window.btoa(binary_pdf);

            return p.done(pdf_dataurl);
          });
          return p;
        }

        self.compileRaw = function (source_code) {
          if (typeof (chunkSize) === "undefined")
            chunkSize = determineChunkSize();

          var commands;
          if (initialized)
            commands = [
              curry(self, 'FS_unlink', ['/input.tex']),
            ];
          else
            commands = [
              curry(self, 'FS_createDataFile', ['/', 'input.tex', source_code, true, true]),
              curry(self, 'FS_createLazyFilesFromList', ['/', 'texlive.lst', './texlive', true, true]),
            ];

          var sendCompile = function () {
            initialized = true;
            return sendCommand({
              'command': 'run',
              'arguments': ['-interaction=nonstopmode', '-output-format', 'pdf', 'input.tex'],
              //        'arguments': ['-debug-format', '-output-format', 'pdf', '&latex', 'input.tex'],
            });
          };

          var getPDF = function () {
            console.log(arguments);
            return self.FS_readFile('/input.pdf');
          }

          return promise.chain(commands)
            .then(sendCompile)
            .then(getPDF);
        };
      };


      /***/
})
/******/]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
=======
(function(exports) {

    function Promise() {
        this._callbacks = [];
    }

    Promise.prototype.then = function(func, context) {
        var p;
        if (this._isdone) {
            p = func.apply(context, this.result);
        } else {
            p = new Promise();
            this._callbacks.push(function () {
                var res = func.apply(context, arguments);
                if (res && typeof res.then === 'function')
                    res.then(p.done, p);
            });
        }
        return p;
    };

    Promise.prototype.done = function() {
        this.result = arguments;
        this._isdone = true;
        for (var i = 0; i < this._callbacks.length; i++) {
            this._callbacks[i].apply(null, arguments);
        }
        this._callbacks = [];
    };

    function join(promises) {
        var p = new Promise();
        var total = promises.length;
        var numdone = 0;
        var results = [];

        function notifier(i) {
            return function() {
                numdone += 1;
                results[i] = Array.prototype.slice.call(arguments);
                if (numdone === total) {
                    p.done(results);
                }
            };
        }

        for (var i = 0; i < total; i++) {
            promises[i].then(notifier(i));
        }

        return p;
    }

    function chain(funcs, args) {
        var p = new Promise();
        if (funcs.length === 0) {
            p.done.apply(p, args);
        } else {
            funcs[0].apply(null, args).then(function() {
                funcs.splice(0, 1);
                chain(funcs, arguments).then(function() {
                    p.done.apply(p, arguments);
                });
            });
        }
        return p;
    }

    /*
     * AJAX requests
     */

    function _encode(data) {
        var result = "";
        if (typeof data === "string") {
            result = data;
        } else {
            var e = encodeURIComponent;
            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    result += '&' + e(k) + '=' + e(data[k]);
                }
            }
        }
        return result;
    }

    function new_xhr() {
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }
        return xhr;
    }


    function ajax(method, url, data, headers) {
        var p = new Promise();
        var xhr, payload;
        data = data || {};
        headers = headers || {};

        try {
            xhr = new_xhr();
        } catch (e) {
            p.done(promise.ENOXHR, "");
            return p;
        }

        payload = _encode(data);
        if (method === 'GET' && payload) {
            url += '?' + payload;
            payload = null;
        }

        xhr.open(method, url);
        xhr.setRequestHeader('Content-type',
                             'application/x-www-form-urlencoded');
        for (var h in headers) {
            if (headers.hasOwnProperty(h)) {
                xhr.setRequestHeader(h, headers[h]);
            }
        }

        function onTimeout() {
            xhr.abort();
            p.done(promise.ETIMEOUT, "", xhr);
        }

        var timeout = promise.ajaxTimeout;
        if (timeout) {
            var tid = setTimeout(onTimeout, timeout);
        }

        xhr.onreadystatechange = function() {
            if (timeout) {
                clearTimeout(tid);
            }
            if (xhr.readyState === 4) {
                var err = (!xhr.status ||
                           (xhr.status < 200 || xhr.status >= 300) &&
                           xhr.status !== 304);
                p.done(err, xhr.responseText, xhr);
            }
        };

        xhr.send(payload);
        return p;
    }

    function _ajaxer(method) {
        return function(url, data, headers) {
            return ajax(method, url, data, headers);
        };
    }

    var promise = {
        Promise: Promise,
        join: join,
        chain: chain,
        ajax: ajax,
        get: _ajaxer('GET'),
        post: _ajaxer('POST'),
        put: _ajaxer('PUT'),
        del: _ajaxer('DELETE'),

        /* Error codes */
        ENOXHR: 1,
        ETIMEOUT: 2,

        /**
         * Configuration parameter: time in milliseconds after which a
         * pending AJAX request is considered unresponsive and is
         * aborted. Useful to deal with bad connectivity (e.g. on a
         * mobile network). A 0 value disables AJAX timeouts.
         *
         * Aborted requests resolve the promise with a ETIMEOUT error
         * code.
         */
        ajaxTimeout: 0
    };

    if (true) {
        /* AMD support */
        !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
            return promise;
        }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}

})(this);


/***/ }),
/* 4 */
/***/ (() => {

var PDFTeX = function(opt_workerPath) {
  if (!opt_workerPath) {
    opt_workerPath = 'pdftex-worker.js';
  }
  var worker = new Worker(opt_workerPath);
  var self = this;
  var initialized = false;

  self.on_stdout = function(msg) {
    console.log(msg);
  }

  self.on_stderr = function(msg) {
    console.log(msg);
  }


  worker.onmessage = function(ev) {
    var data = JSON.parse(ev.data);
    var msg_id;

    if(!('command' in data))
      console.log("missing command!", data);
    switch(data['command']) {
      case 'ready':
        onready.done(true);
        break;
      case 'stdout':
      case 'stderr':
        self['on_'+data['command']](data['contents']);
        break;
      default:
        //console.debug('< received', data);
        msg_id = data['msg_id'];
        if(('msg_id' in data) && (msg_id in promises)) {
          promises[msg_id].done(data['result']);
        }
        else
          console.warn('Unknown worker message '+msg_id+'!');
    }
  }

  var onready = new promise.Promise();
  var promises = [];
  var chunkSize = undefined;

  var sendCommand = function(cmd) {
    var p = new promise.Promise();
    var msg_id = promises.push(p)-1;

    onready.then(function() {
      cmd['msg_id'] = msg_id;
      //console.debug('> sending', cmd);
      worker.postMessage(JSON.stringify(cmd));
    });

    return p;
  };

  var determineChunkSize = function() {
    var size = 1024;
    var max = undefined; 
    var min = undefined;
    var delta = size;
    var success = true;
    var buf;

    while(Math.abs(delta) > 100) {
      if(success) {
        min = size;
        if(typeof(max) === 'undefined')
          delta = size;
        else
          delta = (max-size)/2;
      }
      else {
        max = size;
        if(typeof(min) === 'undefined')
          delta = -1*size/2;
        else
          delta = -1*(size-min)/2;
      }
      size += delta;

      success = true;
      try {
        buf = String.fromCharCode.apply(null, new Uint8Array(size));
        sendCommand({
          command: 'test',
          data: buf,
        });
      }
      catch(e) {
        success = false;
      }
    }

    return size;
  };


  var createCommand = function(command) {
    self[command] = function() {
      var args = [].concat.apply([], arguments);

      return sendCommand({
        'command':  command,
        'arguments': args,
      });
    }
  }
  createCommand('FS_createDataFile'); // parentPath, filename, data, canRead, canWrite
  createCommand('FS_readFile'); // filename
  createCommand('FS_unlink'); // filename
  createCommand('FS_createFolder'); // parent, name, canRead, canWrite
  createCommand('FS_createPath'); // parent, name, canRead, canWrite
  createCommand('FS_createLazyFile'); // parent, name, canRead, canWrite
  createCommand('FS_createLazyFilesFromList'); // parent, list, parent_url, canRead, canWrite
  createCommand('set_TOTAL_MEMORY'); // size

  var curry = function(obj, fn, args) {
    return function() {
      return obj[fn].apply(obj, args);
    }
  }

  self.compile = function(source_code) {
    var p = new promise.Promise();

    self.compileRaw(source_code).then(function(binary_pdf) {
      if(binary_pdf === false)
        return p.done(false);

      pdf_dataurl = 'data:application/pdf;charset=binary;base64,' + window.btoa(binary_pdf);

      return p.done(pdf_dataurl);
    });
    return p;
  }

  self.compileRaw = function(source_code) {
    if(typeof(chunkSize) === "undefined")
      chunkSize = determineChunkSize();

    var commands;
    if(initialized)
      commands = [
        curry(self, 'FS_unlink', ['/input.tex']),
      ];
    else
      commands = [
        curry(self, 'FS_createDataFile', ['/', 'input.tex', source_code, true, true]),
        curry(self, 'FS_createLazyFilesFromList', ['/', 'texlive.lst', './texlive', true, true]),
      ];

    var sendCompile = function() {
      initialized = true;
      return sendCommand({
        'command': 'run',
        'arguments': ['-interaction=nonstopmode', '-output-format', 'pdf', 'input.tex'],
//        'arguments': ['-debug-format', '-output-format', 'pdf', '&latex', 'input.tex'],
      });
    };

    var getPDF = function() {
      console.log(arguments);
      return self.FS_readFile('/input.pdf');
    }

    return promise.chain(commands)
      .then(sendCompile)
      .then(getPDF);
  };
};


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
>>>>>>> d74f8566dd9e22814ae6a044dc689e952e1b79ea
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
<<<<<<< HEAD
      /******/
}
=======
/******/ 		}
>>>>>>> d74f8566dd9e22814ae6a044dc689e952e1b79ea
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
<<<<<<< HEAD
      /******/
};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
    /******/
}
/******/
=======
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
>>>>>>> d74f8566dd9e22814ae6a044dc689e952e1b79ea
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
<<<<<<< HEAD
      /******/
};
    /******/
})();
/******/
=======
/******/ 		};
/******/ 	})();
/******/ 	
>>>>>>> d74f8566dd9e22814ae6a044dc689e952e1b79ea
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
<<<<<<< HEAD
/******/ 			for (var key in definition) {
/******/ 				if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
          /******/
}
        /******/
}
      /******/
};
    /******/
})();
/******/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
    /******/
})();
/******/
=======
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
>>>>>>> d74f8566dd9e22814ae6a044dc689e952e1b79ea
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
<<<<<<< HEAD
/******/ 			if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        /******/
}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
      /******/
};
    /******/
})();
  /******/
  /************************************************************************/
  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be in strict mode.
  (() => {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "activate": () => (/* binding */ activate),
/* harmony export */   "deactivate": () => (/* binding */ deactivate)
      /* harmony export */
});
=======
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "activate": () => (/* binding */ activate),
/* harmony export */   "deactivate": () => (/* binding */ deactivate)
/* harmony export */ });
>>>>>>> d74f8566dd9e22814ae6a044dc689e952e1b79ea
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _LatexCompiler_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);



<<<<<<< HEAD
    function activate(context) {
      console.log('Congratulations, your extension "latex-js" is now active in the web extension host!');

      const disposable = vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand('latex-js.helloWorld', () => {
=======
function activate(context) {
    console.log('Congratulations, your extension "latex-js" is now active in the web extension host!');

    const disposable = vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand('latex-js.helloWorld', () => {
>>>>>>> d74f8566dd9e22814ae6a044dc689e952e1b79ea
        vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage('Hello World from latex-js in a web extension host!');

        const compiler = new _LatexCompiler_js__WEBPACK_IMPORTED_MODULE_1__["default"];
        debugger;
<<<<<<< HEAD
      });

      context.subscriptions.push(disposable);
    }

    function deactivate() { }
  })();

  var __webpack_export_target__ = exports;
  for (var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
  if (__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
  /******/
})()
  ;
=======
    });

    context.subscriptions.push(disposable);
}

function deactivate() { }
})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
>>>>>>> d74f8566dd9e22814ae6a044dc689e952e1b79ea
//# sourceMappingURL=extension.js.map