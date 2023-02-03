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


const base_url = 'https://foc.ethz.ch/people/nicholasbrandt/web-latex/';

const PdfTeXEngine_promise = eval(`(async () => {return await import('${base_url}src/web/swiftlatex/PdfTeXEngine.js');})()`);

class LatexCompiler {
    #pdftex_engine = (async () => {
        const PdfTeXEngine = await PdfTeXEngine_promise;
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