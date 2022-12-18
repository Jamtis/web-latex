import './texlive.js/promises.js/promise.js';
import './texlive.js/pdftex.js';

export default class LatexCompiler {
    pdf_tex = new PDFTeX;
    #workspace;
    static #path_name_regex = /^(.+)\/(.+?)$/;

    constructor(vscode) {
        this.#workspace = vscode.workspace;

        const mem_promise = pdftex.set_TOTAL_MEMORY(80*1024*1024);
        (async () => {
            const r = await mem_promise;
            debugger;
            console.log(r);
        })();
    }

    async addFiles() {
        const files_promise = this.#workspace.findFiles('**/*');
        const files = await files_promise;
        for (const {path} of files) {
            try {
                const document = await this.#workspace.openTextDocument(path);
                const content = document.getText();
                const [, parent_path, file_name] = path.match(this.constructor.#path_name_regex);
                const promise = pdf_tex.FS_createDataFile(parent_path, file_name, content, true, true);
                debugger;
            } catch (error) {
                console.warn(error);
            }
        }
    }
};
