import * as vscode from 'vscode';
import LatexCompiler from './LatexCompiler.js';

export function activate(context) {
    console.log('Congratulations, your extension "latex-js" is now active in the web extension host!');

    const disposable = vscode.commands.registerCommand('latex-js.helloWorld', async () => {
        vscode.window.showInformationMessage('Hello World from latex-js in a web extension host!');

        const compiler = new LatexCompiler(vscode);
        await compiler.addFiles();
        const result = await compiler.compile('paper.tex');
        console.log(result);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }