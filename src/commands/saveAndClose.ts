import { embeddedJsDocs } from "src/extension";
import * as vscode from "vscode";

export const saveAndCloseCmd = vscode.commands.registerCommand("kompotChecker.saveEmbeddedJsAndClose", async () => {
  await saveAndCloseAsync(embeddedJsDocs);
});

export const saveAndCloseAsync = async (embeddedJsDocs) => {
  const jsDoc = vscode.window.activeTextEditor?.document;
  if (!jsDoc) {
    return;
  }

  const jsKey = jsDoc.uri.toString();
  const contextEntry = embeddedJsDocs.get(jsKey);
  if (!contextEntry) {
    vscode.window.showWarningMessage("This is not an embedded JS file.");
    return;
  }

  const { originalDoc, line } = contextEntry;

  // Escape JS
  const jsCode = jsDoc.getText().replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\t/g, "\\t");

  const wrapped = `{js{ ${jsCode} }js}`;

  const fullText = originalDoc.getText();
  const regex = /{js{([\s\S]*?)}js}/g;
  let match: RegExpExecArray | null = null;
  let matchRange: vscode.Range | null = null;

  while ((match = regex.exec(fullText)) !== null) {
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;
    const startPos = originalDoc.positionAt(startOffset);
    const endPos = originalDoc.positionAt(endOffset);

    if (startPos.line <= line && endPos.line >= line) {
      matchRange = new vscode.Range(startPos, endPos);
      break;
    }
  }

  if (!match || !matchRange) {
    vscode.window.showWarningMessage("Could not find the JS block.");
    return;
  }

  const edit = new vscode.WorkspaceEdit();
  edit.replace(originalDoc.uri, matchRange, wrapped);
  await vscode.workspace.applyEdit(edit);
  await originalDoc.save();

  // ✅ Close the untitled doc without saving
  await vscode.commands.executeCommand("workbench.action.revertAndCloseActiveEditor");
  vscode.window.showInformationMessage("✅ JS saved.");
};
