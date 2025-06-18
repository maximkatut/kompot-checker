import * as vscode from "vscode";
import { validateEntityDoc, EntityCodeActionProvider, EntityHoverProvider } from "./validators/entityValidator";

export function activate(context: vscode.ExtensionContext) {
  const embeddedJsDocs = new Map<string, { originalDoc: vscode.TextDocument; line: number }>();
  vscode.workspace.textDocuments.forEach(validateEntityDoc);
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(validateEntityDoc),
    vscode.workspace.onDidChangeTextDocument((e) => validateEntityDoc(e.document)),
    vscode.workspace.onDidSaveTextDocument(validateEntityDoc),

    // code actions
    vscode.languages.registerCodeActionsProvider(
      { language: "json", scheme: "file", pattern: "**/_entity/*.json" },
      new EntityCodeActionProvider(),
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    ),

    // hover
    vscode.languages.registerHoverProvider({ language: "json", scheme: "file", pattern: "**/_entity/*.json" }, new EntityHoverProvider()),

    // docs command
    vscode.commands.registerCommand("kompotChecker.openEntitySchemaDocs", () =>
      vscode.env.openExternal(vscode.Uri.parse("https://deluxe-tulumba-3dd5e6.netlify.app/entity-api"))
    )
  );

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
    }
  );

  const saveAndCloseCmd = vscode.commands.registerCommand("kompotChecker.saveEmbeddedJsAndClose", async () => {
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
    vscode.window.showInformationMessage("✅ Embedded JS saved and editor closed.");
  });

  context.subscriptions.push(editJsCmd);
  context.subscriptions.push(saveAndCloseCmd);
}

export function deactivate() {}
