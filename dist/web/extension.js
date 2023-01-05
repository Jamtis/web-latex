/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LatexCompiler)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _texlive_js_pdftex_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _texlive_js_pdftex_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_texlive_js_pdftex_js__WEBPACK_IMPORTED_MODULE_1__);



const url_base = 'https://foc.ethz.ch/people/nicholasbrandt/web-latex/src/web/texlive.js/';

class LatexCompiler {
    #pdf_tex = new (_texlive_js_pdftex_js__WEBPACK_IMPORTED_MODULE_1___default())(url_base + 'pdftex-worker.js');
    static #path_name_split_regex = /^(.*?)([^\/]+)$/;
    static #path_suffix_regex = /^\/(?:.*?)\/(?:.*?)(\/.+)$/;
    #memory_size = 80 * 1024 * 1024;
    static #decoder = new TextDecoder;

    constructor() {
        this.#pdf_tex.on_stdout =
            this.#pdf_tex.on_stderr = message => {
                console.log(message);
            };
    }

    async addFiles() {
        const content_array = await vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.fs.readFile({ external: 'vscode-vfs://github/Jamtis/paper/input.tex', path: '/Jamtis/paper/input.tex', scheme: 'vscode-vfs', authority: 'github' });
        // remove first 9 bits: BUG?????????????????????
        const content = this.constructor.#decoder.decode(content_array.buffer).substr(9);
        // await this.addLazyFile(suffix_path, toDataURI(content));
        await this.addPreloadedFile('/input.tex', content);
        return;
        // use patch until bug is fixed
        // const files_promise = workspace.findFiles('**/*');
        // const files = await files_promise;
        // console.log("files", files);
        const files_promise = __findAllFiles();
        const files = await files_promise;
        // console.log('files', files);
        for (const file of files) {
            try {
                const [, suffix_path] = file.path.match(this.constructor.#path_suffix_regex);
                const content_array = await vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.fs.readFile(file);
                // remove first 9 bits: BUG?????????????????????
                const content = this.constructor.#decoder.decode(content_array.buffer).substr(9);
                // await this.addLazyFile(suffix_path, toDataURI(content));
                await this.addPreloadedFile(suffix_path, content);
            } catch (error) {
                console.warn(file, error);
            }
        }
    }

    async addTexliveFiles() {
        return await this.#pdf_tex.FS_createLazyFilesFromList('/', url_base + 'texlive.lst', url_base + 'texlive', true, true);
        const request = await fetch(url_base + 'texlive.lst');
        const list = (await request.text()).split('\n');
        for (const file_uri of list) {
            const absolute_uri = url_base + 'texlive/' + file_uri;
            try {
                await this.addLazyFile(file_uri, absolute_uri);
            } catch (error) {
                console.warn(file_uri, error);
            }
        }
    }

    async compileToDataURI(main_file) {
        await this.addTexliveFiles();
        // this.#pdf_tex.FS_readdir('/');
        // console.log('result', result);
        const binary_pdf = await this.#pdf_tex.compileToBinary(main_file);
        return this.#pdf_tex.binaryToDataURI(binary_pdf);
    }

    async setMemorySize(size = this.#memory_size) {
        if (isNaN(size) || size < 0 || size == Infinity) {
            throw new Error('invalid size');
        }
        this.#memory_size = size;
        const result_size = await this.#pdf_tex.set_TOTAL_MEMORY(size);
        return size == result_size;
    }

    async addLazyFile(file_uri, content_uri) {
        const [, parent_path, file_name] = file_uri.match(this.constructor.#path_name_split_regex);
        const folder_promise = this.#pdf_tex.FS_createPath('/', parent_path, true, true);
        const folder_success = await folder_promise;
        if (!folder_success) {
            throw new Error(`creating folder '${parent}' failed`);
        }

        if (!file_name.match(/^(?:\.|)$/)) {
            const file_promise = this.#pdf_tex.FS_createLazyFile(parent_path, file_name, content_uri, true, true);
            // const file_promise = this.#pdf_tex.FS_createDataFile(parent_path, file_name, content_view, true, true);
            const file_result = await file_promise;
            if (!file_result) {
                console.warn(`creating file '${file_uri}' failed`);
            } else {
                // console.log(`added file '${file_uri}'`);
            }
        } else {
            console.log("skipping file: " + file_uri);
        }
    }

    async addPreloadedFile(file_uri, content_view) {
        const [, parent_path, file_name] = file_uri.match(this.constructor.#path_name_split_regex);
        /*const folder_promise = this.#pdf_tex.FS_createPath('/', parent_path, true, true);
        const folder_success = await folder_promise;
        if (!folder_success) {
            throw new Error(`creating folder '${parent}' failed`);
        }*/

        if (!file_name.match(/^(?:\.|)$/)) {
            const file_promise = this.#pdf_tex.FS_createDataFile(parent_path, file_name, content_view, true, true);
            const file_result = await file_promise;
            if (!file_result) {
                console.warn(`creating file '${file_uri}' failed`);
            } else {
                // console.log(`added file '${file_uri}'`);
            }
        } else {
            console.log("skipping file: " + file_uri);
        }
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

// workaround https://stackoverflow.com/questions/74891363/vscode-findfiles-remote-web-version-ignores-local-files
async function __findAllFiles() {
    const file_uris = [];
    for (const folder of vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders) {
        await __readDirectory(folder.uri);
    }
    const path_map = new Map;
    for (const file_uri of file_uris) {
        path_map.set(file_uri.path, file_uri);
    }
    return [...path_map.values()];

    async function __readDirectory(uri) {
        const entries = await vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.fs.readDirectory(uri);
        // console.log("read", uri.path, entries);
        for (const [name, type] of entries) {
            const new_uri = Object.assign({}, uri);
            new_uri.path += "/" + name;
            switch (type) {
                // type == 1 is directory
                case 1:
                    // console.log("add", new_uri.path, "from", uri.path);
                    file_uris.push(new_uri);
                    break;
                // type == 2 is directory
                case 2:
                    await __readDirectory(new_uri);
                // type == 0 is other (submodule, ...)
            }
        }
    }
}

/***/ }),
/* 3 */
/***/ (() => {

var TeXLive = function(opt_workerPath) {
  //var self=this;
  var chunksize= determineChunkSize();
  if (!opt_workerPath) {
    opt_workerPath = '';
  }


  var component = function(workerPath) {
    var self = this;
    var worker = new Worker(workerPath);
    self.terminate = function(){worker.terminate()};
    self.initialized=false;
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
    self.sendCommand = function(cmd) {
      var p = new promise.Promise();
      var msg_id = promises.push(p)-1;
      onready.then(function() {
        cmd['msg_id'] = msg_id;
        worker.postMessage(JSON.stringify(cmd));
      });
      return p;
    };
    self.createCommand = function(command) {
      self[command] = function() {
        var args = [].concat.apply([], arguments);

        return self.sendCommand({
          'command':  command,
          'arguments': args,
        });
      }
    }
    self.createCommand('FS_createDataFile'); // parentPath, filename, data, canRead, canWrite
    self.createCommand('FS_readFile'); // filename
    self.createCommand('FS_unlink'); // filename
    self.createCommand('FS_createFolder'); // parent, name, canRead, canWrite
    self.createCommand('FS_createPath'); // parent, name, canRead, canWrite
    self.createCommand('FS_createLazyFile'); // parent, name, canRead, canWrite
    self.createCommand('FS_createLazyFilesFromList'); // parent, list, parent_url, canRead, canWrite
    self.createCommand('set_TOTAL_MEMORY'); // size
  };

  var pdftex=new component(opt_workerPath+'pdftex-worker.js');
  pdftex.compile = function(source_code) {
    var self=this;
    var p = new promise.Promise();
    pdftex.compileRaw(source_code).then(
      function(binary_pdf) {
        if(binary_pdf === false)
          return p.done(false);
        pdf_dataurl = 'data:application/pdf;charset=binary;base64,' + window.btoa(binary_pdf);
        return p.done(pdf_dataurl);
      });
    return p;
  };
  pdftex.compileRaw = function(source_code) {
     var self=this;
     return pdftex.run(source_code).then(
      function() {
        return self.FS_readFile('/input.pdf');
      }
    );
  };
  pdftex.run = function(source_code) {
    var self=this;
    var commands;
    if(self.initialized)
      commands = [
        curry(self, 'FS_unlink', ['/input.tex']),
        curry(self, 'FS_createDataFile', ['/', 'input.tex', source_code, true, true])
      ];
    else
      commands = [
        curry(self, 'FS_createDataFile', ['/', 'input.tex', source_code, true, true]),
        curry(self, 'FS_createLazyFilesFromList', ['/', 'texlive.lst', './texlive', true, true]),
      ];

    var sendCompile = function() {
      self.initialized = true;
      return self.sendCommand({
        'command': 'run',
        'arguments': ['-interaction=nonstopmode', '-output-format', 'pdf', 'input.tex'],
  //        'arguments': ['-debug-format', '-output-format', 'pdf', '&latex', 'input.tex'],
      });
    };
    return promise.chain(commands)
      .then(sendCompile)
  };
  TeXLive.prototype.pdftex = pdftex;

  var bibtex = new component(opt_workerPath+'bibtex-worker.js');
  bibtex.compile = function(aux){
    var self=this;
    var p = new promise.Promise();
    bibtex.compileRaw(aux).then(
      function(binary_bbl) {
        if(binary_bbl === false)
          return p.done(false);
        pdf_dataurl = 'data:text/plain;charset=binary;base64,' + window.btoa(binary_bbl);
        return p.done(pdf_dataurl);
      });
    return p;
  };
  bibtex.compileRaw = function(aux) {
     var self=this;
     return bibtex.run(aux).then(
      function() {
        return self.FS_readFile('/input.bbl');
      }
    );
  };
  bibtex.run = function(source_code) {
    var self=this;
    var commands;
    if(self.initialized)
      commands = [
        curry(self, 'FS_unlink', ['/input.aux']),
        curry(self, 'FS_createDataFile', ['/', 'input.aux', aux, true, true])
      ];
    else
      commands = [
        curry(self, 'FS_createDataFile', ['/', 'input.aux', aux, true, true]),
        curry(self, 'FS_createLazyFilesFromList', ['/', 'texlive.lst', './texlive', true, true]),
      ];
    var sendCompile = function() {
      self.initialized = true;
      return self.sendCommand({
        'command': 'run',
        'arguments': ['input.aux'],
      });
    };
    return promise.chain(commands)
      .then(sendCompile)
  };
  TeXLive.prototype.bibtex=bibtex;
  TeXLive.prototype.terminate = function(){
    pdftex.terminate();
    bibtex.terminate();
  }
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

    curry = function(obj, fn, args) {
    return function() {
      return obj[fn].apply(obj, args);
    }
  }


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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "activate": () => (/* binding */ activate),
/* harmony export */   "deactivate": () => (/* binding */ deactivate)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _LatexCompiler_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);



function activate(context) {
    console.log('activating web-latex', context.extensionUri);

    const compile_command = vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand('latex-js.compile', async () => {
        try {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage('web-latex compile!');

            const file_name = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInputBox() || 'input.tex';

            const compiler = new _LatexCompiler_js__WEBPACK_IMPORTED_MODULE_1__["default"];
            await compiler.setMemorySize();
            await compiler.addFiles();
            const data_uri = await compiler.compileToDataURI(file_name);
            console.log(data_uri);
        } catch (error) {
            console.error(error);
        }
    });
    context.subscriptions.push(compile_command);

    const find_command = vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand('latex-js.listfiles', async () => {
        try {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage('web-latex listFiles!');
            const files_promise = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.findFiles('**/*');
            const files = await files_promise;
            console.log(files);
            const files_promise2 = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.findFiles('*');
            const files2 = await files_promise2;
            console.log(files2);

            const uri = vscode__WEBPACK_IMPORTED_MODULE_0__.Uri.joinPath(context.extensionUri, 'src', 'web', 'texlive');
            const entries = await vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.fs.readDirectory(uri);
            console.log('absolutepath', uri, entries);
        } catch (error) {
            console.error(error);
        }
    });
    context.subscriptions.push(find_command);
}

function deactivate() {}
})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=extension.js.map