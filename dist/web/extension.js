/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LatexCompiler)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _texlive_js_pdftex_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);



class LatexCompiler {
    #pdf_tex = new _texlive_js_pdftex_js__WEBPACK_IMPORTED_MODULE_1__["default"]('https://jamtis.github.io/web-latex/src/web/texlive.js/pdftex-worker.js');
    static #path_name_regex = /^(.+)\/(.+?)$/;
    static memory_size = 80*1024*1024;
    static #decoder = new TextDecoder;

    async addFiles() {
        const files_promise = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.findFiles('**/*');
        const files = await files_promise;
        for (const file_uri of files) {
            const content_array = await vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.fs.readFile(file_uri);
            const content_view = new DataView(content_array.buffer);
            const [, parent_path, file_name] = file_uri.path.match(this.constructor.#path_name_regex);
            const folder_promise = this.#pdf_tex.FS_createPath('/', parent_path, true, true);
            const folder_success = await folder_promise;
            if (!folder_success) {
                throw new Error(`creating folder '${parent}' failed`);
            }

            // const content = (new TextDecoder).decode(content_array.buffer);
            const content = this.constructor.#decoder.decode(content_array.buffer).substr(9); // remove first 9 bits: BUG?????????????????????
            const file_promise = this.#pdf_tex.FS_createLazyFile(parent_path, file_name, toDataURI(content), true, true);
            // const file_promise = this.#pdf_tex.FS_createDataFile(parent_path, file_name, content_view, true, true);
            const file_result = await file_promise;
            if (!folder_success) {
                throw new Error(`creating file '${file_uri.path}/' failed`);
            }
            console.log(`added file '${file_uri.path}'`);
        }
    }

    async compile(main_file) {
        await this.setMemorySize(this.memory_size);
        return await this.#pdf_tex._compile(main_file);
    }

    async setMemorySize(size) {
        this.memory_size = size;
        const result_size = await this.#pdf_tex.set_TOTAL_MEMORY(size);
        return size == result_size;
    }
};

function toDataURI(string) {
    try {
        // don't know why this works
        return `data:text/plain;charset=utf-8;base64,` + btoa(unescape(encodeURIComponent(string)));
    } catch (error) {
        console.warn(error);
    }
    return '';
}

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ExtendedPromise_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);


const PDFTeX = function(opt_workerPath) {
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
              } else
                  console.warn('Unknown worker message ' + msg_id + '!');
      }
  }

  var onready = new _ExtendedPromise_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
  var promises = [];
  var chunkSize = undefined;

  var sendCommand = function(cmd) {
      var p = new _ExtendedPromise_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
      var msg_id = promises.push(p) - 1;

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

      while (Math.abs(delta) > 100) {
          if (success) {
              min = size;
              if (typeof(max) === 'undefined')
                  delta = size;
              else
                  delta = (max - size) / 2;
          } else {
              max = size;
              if (typeof(min) === 'undefined')
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
          } catch (e) {
              success = false;
          }
      }

      return size;
  };


  var createCommand = function(command) {
      self[command] = function() {
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

  var curry = function(obj, fn, args) {
      return function() {
          return obj[fn].apply(obj, args);
      }
  }

  self.compile = function(source_code) {
      var p = new _ExtendedPromise_js__WEBPACK_IMPORTED_MODULE_0__["default"]();

      self.compileRaw(source_code).then(function(binary_pdf) {
          if (binary_pdf === false)
              return p.done(false);

          pdf_dataurl = 'data:application/pdf;charset=binary;base64,' + window.btoa(binary_pdf);

          return p.done(pdf_dataurl);
      });
      return p;
  }

  self.compileRaw = function(source_code) {
      if (typeof(chunkSize) === "undefined")
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

      var sendCompile = function() {
          initialized = true;
          return sendCommand({
              'command': 'run',
              'arguments': ['-interaction=nonstopmode', '-output-format', 'pdf', 'input.tex'],
                    //  'arguments': ['-debug-format', '-output-format', 'pdf', '&latex', 'input.tex'],
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

  self._compile = async function(main_file) {
    await sendCommand({
        'command': 'run',
        'arguments': ['-interaction=nonstopmode', '-output-format', 'pdf', main_file],
    });
    const output_file = main_file.match(/^(.*?)(?:\.tex)?$/) + '.pdf';
    return await self.FS_readFile(output_file);
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PDFTeX);

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ExtendedPromise)
/* harmony export */ });
class ExtendedPromise extends Promise {
    #resolve;
    #reject;
    constructor(callback) {
        let _resolve;
        let _reject;
        super((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
        });
        this.#resolve = _resolve;
        this.#reject = _reject;
        callback?.(_resolve, _reject);
    }

    done(value) {
        this.#resolve(value);
    }
};

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
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
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
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
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "activate": () => (/* binding */ activate),
/* harmony export */   "deactivate": () => (/* binding */ deactivate)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _LatexCompiler_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);



function activate(context) {
    console.log('Congratulations, your extension "latex-js" is now active in the web extension host!');

    const disposable = vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand('latex-js.helloWorld', async () => {
        try {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage('Hello World from latex-js in a web extension host!');

            const compiler = new _LatexCompiler_js__WEBPACK_IMPORTED_MODULE_1__["default"](vscode__WEBPACK_IMPORTED_MODULE_0__);
            await compiler.addFiles();
            const result = await compiler.compile('paper.tex');
            console.log(result);
        } catch (error) {
            console.error(error);
        }
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
//# sourceMappingURL=extension.js.map