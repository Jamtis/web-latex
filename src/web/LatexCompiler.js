import {workspace} from 'vscode';
import PDFTeX from './texlive.js/pdftex.js';

export default class LatexCompiler {
    #pdf_tex = new PDFTeX;
    static #path_name_regex = /^(.+)\/(.+?)$/;
    static memory_size = 80*1024*1024;

    async addFiles() {
        const files_promise = workspace.findFiles('**/*');
        const files = await files_promise;
        for (const {path, _formatted} of files) {
            try {
                const content = await this.readTextFile(_formatted);
                const [, parent_path, file_name] = path.match(this.constructor.#path_name_regex);
                const promise = this.#pdf_tex.FS_createDataFile(parent_path, file_name, content, true, true);
                console.log(await promise);
            } catch (error) {
                console.warn(error);
            }
        }
    }

    async compile(main_file = './paper.tex') {
        const main_source = await this.readTextFile(main_file);
        await this.setMemorySize(this.memory_size);
        return await this.#pdf_tex.compile(main_source);
    }

    async readTextFile(path) {
        const document = await workspace.openTextDocument(path);
        return document.getText();
    }

    async setMemorySize(size) {
        this.memory_size = size;
        const result_size = await this.#pdf_tex.set_TOTAL_MEMORY(size);
        return size == result_size;
    }
};