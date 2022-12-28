import * as vscode from 'vscode';
import LatexCompiler from './LatexCompiler.js';

export function activate(context) {
    console.log('activating web-latex', context.extensionUri);

    const compile_command = vscode.commands.registerCommand('latex-js.compile', async () => {
        try {
            vscode.window.showInformationMessage('web-latex compile!');

            const file_name = await vscode.window.showInputBox();

            const compiler = new LatexCompiler;
            await compiler.addFiles();
            const data_uri = await compiler.compileToDataURI(file_name);
            console.log(data_uri);
        } catch (error) {
            console.error(error);
        }
    });
    context.subscriptions.push(compile_command);

    const find_command = vscode.commands.registerCommand('latex-js.listfiles', async () => {
        try {
            vscode.window.showInformationMessage('web-latex listFiles!');
            const files_promise = vscode.workspace.findFiles('**/*');
            const files = await files_promise;
            console.log(files);
            const files_promise2 = vscode.workspace.findFiles('*');
            const files2 = await files_promise2;
            console.log(files2);

            const path = context.asAbsolutePath(vscode.Uri.joinPath(context.extensionUri, 'src', 'web', 'texlive'));
            const entries = await vscode.workspace.fs.readDirectory(path);
            console.log('absolutepath', path, entries);
        } catch (error) {
            console.error(error);
        }
    });
    context.subscriptions.push(find_command);
}

export function deactivate() {}