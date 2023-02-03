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

__webpack_require__(3);

class LatexCompiler {
    #pdftex_engine = (async () => {
        const engine = new PdfTeXEngine;
        await engine.loadEngine();
        return engine;
    })();
    static #path_name_split_regex = /^(.*?)([^\/]+)$/;
    static #path_suffix_regex = /^\/(?:.*?)\/(?:.*?)(\/.+)$/;
    #memory_size = 80 * 1024 * 1024;
    static #decoder = new TextDecoder;

    constructor() {
    }

    async addFiles() {
        const content_array = await vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.fs.readFile({ external: 'vscode-vfs://github/Jamtis/paper/input.tex', path: '/Jamtis/paper/input.tex', scheme: 'vscode-vfs', authority: 'github' });
        // remove first 9 bits: BUG?????????????????????
        const content = this.constructor.#decoder.decode(content_array.buffer).substr(9);
        // await this.addLazyFile(suffix_path, toDataURI(content));
        const engine = await this.#pdftex_engine;
        engine.writeMemFSFile('/input.tex', content);
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
                await this.addFile(suffix_path, content);
            } catch (error) {
                console.warn(file, error);
            }
        }
    }

    async compileToDataURI(main_file) {
        const engine = await this.#pdftex_engine;
        engine.setEngineMainFile(main_file);
        const binary_pdf = await engine.compileLaTeX();
        console.log(binary_pdf);
        // return this.#pdf_tex.binaryToDataURI(binary_pdf);
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
/***/ (function() {


/********************************************************************************
 * Copyright (C) 2019 Elliott Wen.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
var exports = {};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.PdfTeXEngine = exports.CompileResult = exports.EngineStatus = void 0;
var EngineStatus;
(function (EngineStatus) {
    EngineStatus[EngineStatus["Init"] = 1] = "Init";
    EngineStatus[EngineStatus["Ready"] = 2] = "Ready";
    EngineStatus[EngineStatus["Busy"] = 3] = "Busy";
    EngineStatus[EngineStatus["Error"] = 4] = "Error";
})(EngineStatus = exports.EngineStatus || (exports.EngineStatus = {}));
var ENGINE_PATH = 'swiftlatexpdftex.js';
var CompileResult = /** @class */ (function () {
    function CompileResult() {
        this.pdf = undefined;
        this.status = -254;
        this.log = 'No log';
    }
    return CompileResult;
}());
exports.CompileResult = CompileResult;
var PdfTeXEngine = /** @class */ (function () {
    function PdfTeXEngine() {
        this.latexWorker = undefined;
        this.latexWorkerStatus = EngineStatus.Init;
    }
    PdfTeXEngine.prototype.loadEngine = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.latexWorker !== undefined) {
                            throw new Error('Other instance is running, abort()');
                        }
                        this.latexWorkerStatus = EngineStatus.Init;
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                _this.latexWorker = new Worker(ENGINE_PATH);
                                _this.latexWorker.onmessage = function (ev) {
                                    var data = ev['data'];
                                    var cmd = data['result'];
                                    if (cmd === 'ok') {
                                        _this.latexWorkerStatus = EngineStatus.Ready;
                                        resolve();
                                    }
                                    else {
                                        _this.latexWorkerStatus = EngineStatus.Error;
                                        reject();
                                    }
                                };
                            })];
                    case 1:
                        _a.sent();
                        this.latexWorker.onmessage = function (_) {
                        };
                        this.latexWorker.onerror = function (_) {
                        };
                        return [2 /*return*/];
                }
            });
        });
    };
    PdfTeXEngine.prototype.isReady = function () {
        return this.latexWorkerStatus === EngineStatus.Ready;
    };
    PdfTeXEngine.prototype.checkEngineStatus = function () {
        if (!this.isReady()) {
            throw Error('Engine is still spinning or not ready yet!');
        }
    };
    PdfTeXEngine.prototype.compileLaTeX = function () {
        return __awaiter(this, void 0, void 0, function () {
            var start_compile_time, res;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkEngineStatus();
                        this.latexWorkerStatus = EngineStatus.Busy;
                        start_compile_time = performance.now();
                        return [4 /*yield*/, new Promise(function (resolve, _) {
                                _this.latexWorker.onmessage = function (ev) {
                                    var data = ev['data'];
                                    var cmd = data['cmd'];
                                    if (cmd !== "compile")
                                        return;
                                    var result = data['result'];
                                    var log = data['log'];
                                    var status = data['status'];
                                    _this.latexWorkerStatus = EngineStatus.Ready;
                                    console.log('Engine compilation finish ' + (performance.now() - start_compile_time));
                                    var nice_report = new CompileResult();
                                    nice_report.status = status;
                                    nice_report.log = log;
                                    if (result === 'ok') {
                                        var pdf = new Uint8Array(data['pdf']);
                                        nice_report.pdf = pdf;
                                    }
                                    resolve(nice_report);
                                };
                                _this.latexWorker.postMessage({ 'cmd': 'compilelatex' });
                                console.log('Engine compilation start');
                            })];
                    case 1:
                        res = _a.sent();
                        this.latexWorker.onmessage = function (_) {
                        };
                        return [2 /*return*/, res];
                }
            });
        });
    };
    /* Internal Use */
    PdfTeXEngine.prototype.compileFormat = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkEngineStatus();
                        this.latexWorkerStatus = EngineStatus.Busy;
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                _this.latexWorker.onmessage = function (ev) {
                                    var data = ev['data'];
                                    var cmd = data['cmd'];
                                    if (cmd !== "compile")
                                        return;
                                    var result = data['result'];
                                    var log = data['log'];
                                    // const status: number = data['status'] as number;
                                    _this.latexWorkerStatus = EngineStatus.Ready;
                                    if (result === 'ok') {
                                        var formatArray = data['pdf']; /* PDF for result */
                                        var formatBlob = new Blob([formatArray], { type: 'application/octet-stream' });
                                        var formatURL_1 = URL.createObjectURL(formatBlob);
                                        setTimeout(function () { URL.revokeObjectURL(formatURL_1); }, 30000);
                                        console.log('Download format file via ' + formatURL_1);
                                        resolve();
                                    }
                                    else {
                                        reject(log);
                                    }
                                };
                                _this.latexWorker.postMessage({ 'cmd': 'compileformat' });
                            })];
                    case 1:
                        _a.sent();
                        this.latexWorker.onmessage = function (_) {
                        };
                        return [2 /*return*/];
                }
            });
        });
    };
    PdfTeXEngine.prototype.setEngineMainFile = function (filename) {
        this.checkEngineStatus();
        if (this.latexWorker !== undefined) {
            this.latexWorker.postMessage({ 'cmd': 'setmainfile', 'url': filename });
        }
    };
    PdfTeXEngine.prototype.writeMemFSFile = function (filename, srccode) {
        this.checkEngineStatus();
        if (this.latexWorker !== undefined) {
            this.latexWorker.postMessage({ 'cmd': 'writefile', 'url': filename, 'src': srccode });
        }
    };
    PdfTeXEngine.prototype.makeMemFSFolder = function (folder) {
        this.checkEngineStatus();
        if (this.latexWorker !== undefined) {
            if (folder === '' || folder === '/') {
                return;
            }
            this.latexWorker.postMessage({ 'cmd': 'mkdir', 'url': folder });
        }
    };
    PdfTeXEngine.prototype.flushCache = function () {
        this.checkEngineStatus();
        if (this.latexWorker !== undefined) {
            // console.warn('Flushing');
            this.latexWorker.postMessage({ 'cmd': 'flushcache' });
        }
    };
    PdfTeXEngine.prototype.setTexliveEndpoint = function (url) {
        if (this.latexWorker !== undefined) {
            this.latexWorker.postMessage({ 'cmd': 'settexliveurl', 'url': url });
            this.latexWorker = undefined;
        }
    };
    PdfTeXEngine.prototype.closeWorker = function () {
        if (this.latexWorker !== undefined) {
            this.latexWorker.postMessage({ 'cmd': 'grace' });
            this.latexWorker = undefined;
        }
    };
    return PdfTeXEngine;
}());
exports.PdfTeXEngine = PdfTeXEngine;


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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
    console.log('activating web-latex', context.extensionUri);

    const compile_command = vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand('latex-js.compile', async () => {
        try {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage('web-latex compile!');

            const file_name = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInputBox() || 'input.tex';

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