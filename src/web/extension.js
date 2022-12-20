import * as vscode from 'vscode';
import LatexCompiler from './LatexCompiler.js';

export function activate(context) {
    console.log('activating web-latex');

    const disposable = vscode.commands.registerCommand('latex-js.helloWorld', async () => {
        try {
            vscode.window.showInformationMessage('web-latex startup!');

            const file_name = await vscode.window.showInputBox();

            const compiler = new LatexCompiler(vscode);
            await compiler.addFiles();
            const result = await compiler.compile(file_name);
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }