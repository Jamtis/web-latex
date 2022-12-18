import {workspace} from 'vscode';
import PDFTeX from './texlive.js/pdftex.js';

export default class LatexCompiler {
    #pdf_tex = new PDFTeX;
    static #path_name_regex = /^(.+)\/(.+?)$/;

    constructor() {
        const mem_promise = this.#pdf_tex.set_TOTAL_MEMORY(80*1024*1024);
        (async () => {
            const r = await mem_promise;
            debugger;
            console.log(r);
        })();
    }

    async addFiles() {
        const files_promise = workspace.findFiles('**/*');
        const files = await files_promise;
        for (const {path} of files) {
            try {
                const document = await workspace.openTextDocument(path);
                const content = document.getText();
                const [, parent_path, file_name] = path.match(this.constructor.#path_name_regex);
                const promise = this.#pdf_tex.FS_createDataFile(parent_path, file_name, content, true, true);
                debugger;
                console.log(promise);
            } catch (error) {
                console.warn(error);
            }
        }
    }
};
