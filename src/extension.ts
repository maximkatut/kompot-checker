import * as vscode from "vscode";
import { validateEntityDoc, EntityCodeActionProvider, EntityHoverProvider } from "./validators/entityValidator";
import { validateHandlerDoc } from "./validators/handlerValidator";
import { insertJsTemplate } from "./commands/insertJsTemplate";
import { saveAndCloseCmd } from "./commands/saveAndClose";
import { editJsCmd } from "./commands/editJs";

export const embeddedJsDocs = new Map<string, { originalDoc: vscode.TextDocument; line: number }>();

export function activate(context: vscode.ExtensionContext) {
  vscode.workspace.textDocuments.forEach(validateEntityDoc);
  context.subscriptions.push(
    // _entity
    vscode.workspace.onDidOpenTextDocument(validateEntityDoc),
    vscode.workspace.onDidChangeTextDocument((e) => validateEntityDoc(e.document)),
    vscode.workspace.onDidSaveTextDocument(validateEntityDoc),
    // _handler
    vscode.workspace.onDidOpenTextDocument((doc) => validateHandlerDoc(doc)),
    vscode.workspace.onDidChangeTextDocument((e) => validateHandlerDoc(e.document)),
    vscode.workspace.onDidSaveTextDocument(validateHandlerDoc),
    // code actions
    vscode.languages.registerCodeActionsProvider(
      { language: "json", scheme: "file", pattern: "**/_entity/*.json" },
      new EntityCodeActionProvider(),
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    ),
    // vscode.languages.registerCodeActionsProvider(
    //   { language: "json", scheme: "file", pattern: "**/_handler/*.json" },
    //   new HandlerCodeActionProvider(),
    //   { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    // ),
    // hover
    vscode.languages.registerHoverProvider({ language: "json", scheme: "file", pattern: "**/_entity/*.json" }, new EntityHoverProvider()),
    // vscode.languages.registerHoverProvider({ language: "json", scheme: "file", pattern: "**/_handler/*.json" }, new HandlerHoverProvider()),
    // docs command
    vscode.commands.registerCommand("kompotChecker.openEntitySchemaDocs", () =>
      vscode.env.openExternal(vscode.Uri.parse("https://deluxe-tulumba-3dd5e6.netlify.app/entity-api"))
    )
  );

  context.subscriptions.push(editJsCmd);
  context.subscriptions.push(saveAndCloseCmd);
  context.subscriptions.push(insertJsTemplate);
}

export function deactivate() {}
