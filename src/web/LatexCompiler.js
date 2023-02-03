import { workspace } from 'vscode';

import PdfTeXEngine from './swiftlatex/PdfTeXEngine.js';

export default class LatexCompiler {
    #pdftex_engine = (async () => {
        const engine = new PdfTeXEngine;
        await engine.loadEngine();
        engine.setTexliveEndpoint('https://ondemand-service-d3ncqg2pmq-uc.a.run.app/');
        return engine;
    })();
    static #path_name_split_regex = /^(.*?)([^\/]+)$/;
    static #path_suffix_regex = /^\/(?:.*?)\/(?:.*?)(\/.+)$/;
    #memory_size = 80 * 1024 * 1024;
    static #decoder = new TextDecoder;
    log;

    constructor() { }

    async addFiles() {
        const content_array = await workspace.fs.readFile({ external: 'vscode-vfs://github/Jamtis/paper/input.tex', path: '/Jamtis/paper/input.tex', scheme: 'vscode-vfs', authority: 'github' });
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
                const content_array = await workspace.fs.readFile(file);
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
        const { log, pdf } = await engine.compileLaTeX();
        this.log = log;
        const string = pdf.reduce((data, byte) => data + String.fromCharCode(byte), '');
        return 'data:application/pdf;base64,' + btoa(string);
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
    for (const folder of workspace.workspaceFolders) {
        await __readDirectory(folder.uri);
    }
    const path_map = new Map;
    for (const file_uri of file_uris) {
        path_map.set(file_uri.path, file_uri);
    }
    return [...path_map.values()];

    async function __readDirectory(uri) {
        const entries = await workspace.fs.readDirectory(uri);
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