import {workspace} from 'vscode';
import PDFTeX from './texlive.js/pdftex.js';

export default class LatexCompiler {
    #pdf_tex = new PDFTeX('https://jamtis.github.io/web-latex/src/web/texlive.js/pdftex-worker.js');
    // #pdf_tex = new PDFTeX('./texlive.js/pdftex-worker.js');
    static #path_name_regex = /^(.+)\/(.+?)$/;
    static memory_size = 80*1024*1024;
    static #decoder = new TextDecoder;

    constructor() {
        this.#pdf_tex.on_stdout =
        this.#pdf_tex.on_stderr = message => console.log(message);
    }

    async addFiles() {
        const files_promise = workspace.findFiles('**/*');
        const files = await files_promise;
        for (const file_uri of files) {
            const content_array = await workspace.fs.readFile(file_uri);
            const content_view = new DataView(content_array.buffer);
            const [, parent_path, file_name] = file_uri.path.match(this.constructor.#path_name_regex);
            const folder_promise = this.#pdf_tex.FS_createPath('/', parent_path, true, true);
            const folder_success = await folder_promise;
            if (!folder_success) {
                throw new Error(`creating folder '${parent}' failed`);
            }

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

    async compileToDataURI(main_file) {
        await this.setMemorySize(this.memory_size);
        const texlive_files_success = await this.#pdf_tex.FS_createLazyFilesFromList('/', 'texlive.lst', './texlive', true, true);
        if (!texlive_files_success) {
            throw new Error(`adding texlive files failed`);
        }
        const binary_pdf = await this.#pdf_tex.compileToBinary(main_file);
        return this.#pdf_tex.binaryToDataURI(binary_pdf);
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