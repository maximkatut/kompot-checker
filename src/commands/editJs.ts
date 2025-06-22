import { embeddedJsDocs } from "src/extension";
import * as vscode from "vscode";

export const editJsCmd = vscode.commands.registerCommand("kompotChecker.editEmbeddedJs", async () => {
  await editJsAsync(embeddedJsDocs);
});

export const editJsAsync = async (embeddedJsDocs) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const doc = editor.document;
  const pos = editor.selection.active;
  const line = doc.lineAt(pos.line).text;

  const match = line.match(/"{js{([\s\S]*?)}js}"/);
  if (!match) {
    return;
  }

  const jsCode = match[1].trim().replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"').replace(/\\\\/g, "\\");

  const jsDoc = await vscode.workspace.openTextDocument({
    language: "javascript",
    content: jsCode,
  });

  const jsDocUri = jsDoc.uri;
  embeddedJsDocs.set(jsDocUri.toString(), {
    originalDoc: doc,
    line: pos.line,
  });

  await vscode.window.showTextDocument(jsDoc, vscode.ViewColumn.Beside, true);
};
