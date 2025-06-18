import * as vscode from "vscode";
import { validateJsonStructure } from "./validator";

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("jsonStructure");

  const embeddedJsDocs = new Map<
    string,
    { originalDoc: vscode.TextDocument; line: number }
  >();

  vscode.workspace.onDidOpenTextDocument(checkDocument);
  vscode.workspace.onDidChangeTextDocument((e) => checkDocument(e.document));

  function checkDocument(document: vscode.TextDocument) {
    if (document.languageId !== "json") {
      return;
    }

    const diagnostics = validateJsonStructure(document);
    diagnosticCollection.set(document.uri, diagnostics);
  }

  const editJsCmd = vscode.commands.registerCommand(
    "kompotChecker.editEmbeddedJs",

    async () => {
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

      const jsCode = match[1]
        .trim()
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");

      const jsDoc = await vscode.workspace.openTextDocument({
        language: "javascript",
        content: jsCode,
      });

      const jsDocUri = jsDoc.uri;
      embeddedJsDocs.set(jsDocUri.toString(), {
        originalDoc: doc,
        line: pos.line,
      });

      await vscode.window.showTextDocument(
        jsDoc,
        vscode.ViewColumn.Beside,
        true
      );
    }
  );

  const saveAndCloseCmd = vscode.commands.registerCommand(
    "kompotChecker.saveEmbeddedJsAndClose",
    async () => {
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
      const jsCode = jsDoc
        .getText()
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\t/g, "\\t");

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
      await vscode.commands.executeCommand(
        "workbench.action.revertAndCloseActiveEditor"
      );

      vscode.window.showInformationMessage(
        "✅ Embedded JS saved and editor closed."
      );
    }
  );

  context.subscriptions.push(editJsCmd);
  context.subscriptions.push(saveAndCloseCmd);
  context.subscriptions.push(diagnosticCollection);
}

export function deactivate() {}
