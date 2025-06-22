import * as vscode from "vscode";
import { HandlerSchema } from "../schemas/handlerSchema";
import { getRangeFromZodPath } from "src/utils/getRange";

const handlerCollection = vscode.languages.createDiagnosticCollection("kompotHandler");

export function validateHandlerDoc(doc: vscode.TextDocument) {
  // Only validate JSON files
  if (doc.languageId !== "json") {
    return;
  }

  // Only validate files inside `_handler` folder
  if (!doc.uri.fsPath.includes("/_handler/")) {
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
    handlerCollection.set(doc.uri, [diagnostic]);
    return;
  }

  const result = HandlerSchema.safeParse(jsonData);

  if (result.success) {
    handlerCollection.set(doc.uri, []);
    return;
  }

  const diagnostics: vscode.Diagnostic[] = [];

  for (const err of result.error.errors) {
    console.log("Zod path:", err.path); // <- Debug

    const path = err.path.length ? err.path.join(".") : "(root)";
    const message = `${path}: ${err.message}`;
    const range = getRangeFromZodPath(doc, err.path);

    diagnostics.push(new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error));
  }

  handlerCollection.set(doc.uri, diagnostics);
}
