import * as vscode from 'vscode';
import LatexCompiler from './LatexCompiler.js';

export function activate(context) {
    console.log('activating web-latex', context.extensionUri);

    const compile_command = vscode.commands.registerCommand('latex-js.compile', async () => {
        try {
            vscode.window.showInformationMessage('web-latex compile!');

            const file_name = await vscode.window.showInputBox() || 'input.tex';

            const compiler = new LatexCompiler;
            await compiler.addFiles();
            const data_uri = await compiler.compileToDataURI(file_name);
            console.log(data_uri);
        } catch (error) {
            console.error(error);
        }
    });
    context.subscriptions.push(compile_command);
}

export function deactivate() {}