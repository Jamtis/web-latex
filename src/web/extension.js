import * as vscode from 'vscode';
import LatexCompiler from './LatexCompiler.js';

export function activate(context) {
    console.log('Congratulations, your extension "latex-js" is now active in the web extension host!');

    const disposable = vscode.commands.registerCommand('latex-js.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from latex-js in a web extension host!');

        //const compiler = new LatexCompiler;
        console.log(LatexCompiler);
        debugger;
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }