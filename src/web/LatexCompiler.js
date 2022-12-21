import {workspace} from 'vscode';
import PDFTeX from './texlive.js/pdftex.js';

const url_base = 'https://jamtis.github.io/web-latex/src/web/texlive.js/';

export default class LatexCompiler {
    #pdf_tex = new PDFTeX(url_base + 'pdftex-worker.js');
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
        const files_promise = workspace.findFiles('**/*');
        const files = await files_promise;
        for (const file of files) {
            const content_array = await workspace.fs.readFile(file);
            // remove first 9 bits: BUG?????????????????????
            const content = this.constructor.#decoder.decode(content_array.buffer).substr(9);
            try {
                await this.addLazyFile(file.path, toDataURI(content));
            } catch (error) {
                console.warn(error);
            }
        }
    }

    async addTexliveFiles() {
        const request = await fetch(url_base + 'texlive.lst');
        const list = (await request.text()).split('\n');
        for (const file of list) {
            const file_uri = `./texlive${file}`;
            const absolute_uri = url_base + file_uri;
            try {
                await this.addLazyFile(file_uri, absolute_uri);
            } catch (error) {
                console.warn(error);
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