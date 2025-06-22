import * as vscode from "vscode";

export const insertJsTemplate = vscode.commands.registerCommand("kompotChecker.insertJsTemplate", async () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  editor
    .edit((editBuilder) => {
      const position = editor.selection.active;
      editBuilder.insert(position, `"{js{}js}"`);
    })
    .then(() => {
      // Move cursor between the inner braces
      const position = editor.selection.active;
      const newPosition = position.translate(0, -5); // inside `{js|js}`
      editor.selection = new vscode.Selection(newPosition, newPosition);
    });

  vscode.window.showInformationMessage("Template was insterted.");
});
