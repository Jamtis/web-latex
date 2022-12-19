import {workspace} from 'vscode';
import PDFTeX from './texlive.js/pdftex.js';

export default class LatexCompiler {
    #pdf_tex = new PDFTeX('https://jamtis.github.io/web-latex/src/web/texlive.js/pdftex-worker.js');
    static #path_name_regex = /^(.+)\/(.+?)$/;
    static memory_size = 80*1024*1024;
    static #decoder = new TextDecoder;

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

            // const content = (new TextDecoder).decode(content_array.buffer);
            const content = this.constructor.#decoder.decode(content_array.buffer).substr(9); // remove first 9 bits: BUG?????????????????????
            const file_promise = this.#pdf_tex.FS_createLazyFile(parent_path, file_name, toDataURI(content), true, true);
            // const file_promise = this.#pdf_tex.FS_createDataFile(parent_path, file_name, content_view, true, true);
            const file_result = await file_promise;
            if (!folder_success) {
                throw new Error(`creating file '${file_uri.path}/' failed`);
            }
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
        return `data:text/plain;charset=utf-8;base64,` + btoa(unespace(encodeURIComponent(string)));
    } catch (error) {
        console.warn(error);
    }
    return '';
}