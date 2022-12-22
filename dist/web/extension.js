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



const url_base = 'https://jamtis.github.io/web-latex/src/web/texlive.js/';

class LatexCompiler {
    #pdf_tex = new _texlive_js_pdftex_js__WEBPACK_IMPORTED_MODULE_1__["default"](url_base + 'pdftex-worker.js');
    // #pdf_tex = new PDFTeX('./texlive.js/pdftex-worker.js');
    static #path_name_regex = /^(.+)\/(.+?)$/;
    static memory_size = 80*1024*1024;
    static #decoder = new TextDecoder;

    constructor() {
        this.#pdf_tex.on_stdout =
        this.#pdf_tex.on_stderr = message => {
            console.log(message);
        };
    }

    async addFiles() {
        const files_promise = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.findFiles('**/*');
        const files = await files_promise;
        console.log("files", files);
        const files_promise2 = __findFiles();
        const files2 = await files_promise2;
        console.log("files2", files2);
        for (const file of files) {
            const content_array = await vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.fs.readFile(file);
            // remove first 9 bits: BUG?????????????????????
            const content = this.constructor.#decoder.decode(content_array.buffer).substr(9);
            try {
                await this.addLazyFile(file.path, toDataURI(content));
            } catch (error) {
                console.warn(file_uri, error);
            }
        }
    }

    async addTexliveFiles() {
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
        await this.setMemorySize(this.memory_size);
        await this.addTexliveFiles();
        const binary_pdf = await this.#pdf_tex.compileToBinary(main_file);
        return this.#pdf_tex.binaryToDataURI(binary_pdf);
    }

    async setMemorySize(size) {
        this.memory_size = size;
        const result_size = await this.#pdf_tex.set_TOTAL_MEMORY(size);
        return size == result_size;
    }

    async addLazyFile(file_uri, content_uri) {
        const [, parent_path, file_name] = file_uri.match(this.constructor.#path_name_regex);
        const folder_promise = this.#pdf_tex.FS_createPath('/', parent_path, true, true);
        const folder_success = await folder_promise;
        if (!folder_success) {
            throw new Error(`creating folder '${parent}' failed`);
        }

        if (!file_name.match(/^(?:\.|)$/)) {
            const file_promise = this.#pdf_tex.FS_createLazyFile(parent_path, file_name, content_uri, true, true);
            // const file_promise = this.#pdf_tex.FS_createDataFile(parent_path, file_name, content_view, true, true);
            const file_result = await file_promise;
            if (!folder_success) {
                console.warn(`creating file '${file_uri}' failed`);
            } else {
                console.log(`added file '${file_uri}'`);
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
async function __findFiles() {
    const file_uris = [];
    for (const folder of vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders) {
        await __readDirectory(folder.uri);
    }
    return file_uris;

    async function __readDirectory(uri) {
        const entries = await vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.fs.readDirectory(uri);
        console.log("read", uri.path, entries);
        for (const [name, type] of entries) {
            const new_uri = Object.assign({}, uri);
            new_uri.path += "/" + name;
            switch (type) {
            // type == 1 is directory
            case 1:
                console.log("add", new_uri.path, "from", uri.path);
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
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ExtendedPromise_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);


const PDFTeX = function (opt_workerPath) {
    if (!opt_workerPath) {
        opt_workerPath = 'pdftex-worker.js';
    }
    const worker = new Worker(opt_workerPath);
    const self = this;

    self.on_stdout = function (msg) {
        console.log(msg);
    }

    self.on_stderr = function (msg) {
        console.log(msg);
    }


    worker.onmessage = function (ev) {
        const data = JSON.parse(ev.data);

        if (!('command' in data))
            console.log("missing command!", data);
        switch (data.command) {
            case 'ready':
                onready.resolve(true);
                break;
            case 'stdout':
            case 'stderr':
                self['on_' + data.command](data.contents);
                break;
            default:
                //console.debug('< received', data);
                const msg_id = data['msg_id'];
                if (('msg_id' in data) && (msg_id in promises)) {
                    const promise = promises[msg_id];
                    if ('error' in data) {
                        promise.reject(data.error);
                    } else {
                        promise.resolve(data.result);
                    }
                } else
                    console.warn('Unknown worker message ' + msg_id + '!');
        }
    }

    const onready = new _ExtendedPromise_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
    const promises = [];
    const chunkSize = undefined;

    const sendCommand = function (cmd) {
        const p = new _ExtendedPromise_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
        const msg_id = promises.push(p) - 1;

        onready.then(function () {
            cmd['msg_id'] = msg_id;
            //console.debug('> sending', cmd);
            worker.postMessage(JSON.stringify(cmd));
        });

        return p;
    };


    const createCommand = function (command) {
        self[command] = function () {
            const args = [].concat.apply([], arguments);

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

    self.compileToBinary = async function(main_file) {
        await sendCommand({
            'command': 'run',
            'arguments': ['-interaction=nonstopmode', '-output-format', 'pdf', main_file],
        });
        const output_file = main_file.match(/^(.*?)(?:\.tex)?$/)[1] + '.pdf';
        const binary_pdf = await self.FS_readFile(output_file);
        return binary_pdf;
    };

    self.binaryToDataURI = function(binary) {
        return 'data:application/pdf;charset=binary;base64,' + btoa(binary);
    };
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

    resolve(value) {
        this.#resolve(value);
    }

    reject(value) {
        this.#reject(value);
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
    console.log('activating web-latex');

    const compile_command = vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand('latex-js.compile', async () => {
        try {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage('web-latex compile!');

            const file_name = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInputBox();

            const compiler = new _LatexCompiler_js__WEBPACK_IMPORTED_MODULE_1__["default"];
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