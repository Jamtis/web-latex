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
            try {
                const content_buffer = await workspace.fs.readFile(file_uri);
                const content_view = new DataView(content_buffer);
                const [, parent_path, file_name] = file_uri.path.match(this.constructor.#path_name_regex);
                const promise = this.#pdf_tex.FS_createDataFile(parent_path, file_name, content_view, true, true);
                console.log(await promise);
            } catch (error) {
                console.warn(error);
            }
        }
    }

    async compile(main_file = './paper.tex') {
        const content_buffer = await workspace.fs.readFile(main_file);
        const main_source = this.constructor.#decoder.decode(content_buffer);
        await this.setMemorySize(this.memory_size);
        return await this.#pdf_tex.compile(main_source);
    }

    async setMemorySize(size) {
        this.memory_size = size;
        const result_size = await this.#pdf_tex.set_TOTAL_MEMORY(size);
        return size == result_size;
    }
};