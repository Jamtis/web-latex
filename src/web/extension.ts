import * as vscode from 'vscode';
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "latex-js" is now active in the web extension host!');

    const disposable = vscode.commands.registerCommand('latex-js.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from latex-js in a web extension host!');
    });

    context.subscriptions.push(disposable);
}
export function deactivate() { }