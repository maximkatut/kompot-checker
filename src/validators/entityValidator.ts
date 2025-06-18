import * as vscode from "vscode";
import { entitySchema } from "../schemas/entitySchema";
import { getRangeFromZodPath } from "../utils/getRange";

const collection = vscode.languages.createDiagnosticCollection("kompotEntity");

export function validateEntityDoc(doc: vscode.TextDocument) {
  // Only validate JSON files
  if (doc.languageId !== "json") {
    return;
  }

  // Only validate files inside `_entity` folder
  if (!doc.uri.fsPath.includes("/_entity/")) {
    return;
  }

  const jsonText = doc.getText();

  let jsonData: any;
  try {
    jsonData = JSON.parse(jsonText);
  } catch (e) {
    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(0, 0, 0, 1),
      "Invalid JSON: " + (e as Error).message,
      vscode.DiagnosticSeverity.Error
    );
    collection.set(doc.uri, [diagnostic]);
    return;
  }

  const result = entitySchema.safeParse(jsonData);

  if (result.success) {
    collection.set(doc.uri, []);
    return;
  }

  const diagnostics: vscode.Diagnostic[] = [];

  for (const err of result.error.errors) {
    const path = err.path.join(".");
    const message = `${path}: ${err.message}`;
    const range = getRangeFromZodPath(doc, err.path); // ← try to get a specific match

    diagnostics.push(new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error));
  }

  collection.set(doc.uri, diagnostics);
}

/* ---------- Code‑Action provider ---------- */
export class EntityCodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(document: vscode.TextDocument, _range: vscode.Range | vscode.Selection): vscode.CodeAction[] {
    const diagnostics = [...(collection.get(document.uri) ?? [])];
    if (diagnostics.length === 0) {
      return [];
    }

    // Offer a single “Show schema docs” action
    const action = new vscode.CodeAction("🛈 Kompot entity schema help …", vscode.CodeActionKind.QuickFix);
    action.command = {
      title: "Open schema docs",
      command: "kompotChecker.openEntitySchemaDocs",
    };
    action.diagnostics = diagnostics;
    return [action];
  }
}

export class EntityHoverProvider implements vscode.HoverProvider {
  provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const diags = collection.get(document.uri) ?? [];
    const hit = diags.find((d) => d.range.contains(position));
    if (!hit) {
      return null;
    }
    return new vscode.Hover(`**Kompot validation**\n\n${hit.message}`);
  }
}
