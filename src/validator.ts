console.log("Validating JSON structure...");
import * as vscode from "vscode";
// top‑level keys you require
const requiredTopLevel = ["id", "name", "description", "module", "width", "placement", "content"];

export function validateJsonStructure(doc: vscode.TextDocument): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];

  // 1️⃣  Pre‑process: strip JS template blocks
  const jsBlockPattern = /"{js{[\s\S]*?}js}"/g; // only match blocks wrapped in double quotes
  const rawText = doc.getText();
  const cleaned = rawText.replace(jsBlockPattern, '""');

  let data: any;
  try {
    data = JSON.parse(cleaned);
  } catch (err) {
    console.log("JSON parse failed:", err);
    return diagnostics;
  }

  /** helper that puts the underline on the correct line */
  const diag = (msg: string, line = 0) =>
    diagnostics.push(new vscode.Diagnostic(new vscode.Range(line, 0, line, 1), msg, vscode.DiagnosticSeverity.Error));

  // 2️⃣  Top‑level keys
  for (const key of requiredTopLevel) {
    if (!(key in data)) {
      diag(`Missing key "${key}"`);
    }
  }

  // 3️⃣  Nested checks 
  if (!Array.isArray(data.content)) {
    diag('"content" should be an array');
  } else {
    data.content.forEach((block: any, i) => {
      if (!block?.type) {
        diag(`content[${i}] is missing "type"`);
      }
      if (block?.type === "form") {
        if (!("defaultValues" in block)) {
          diag(`form content[${i}] missing "defaultValues"`);
        }
        if (!Array.isArray(block.content)) {
          diag(`form content[${i}] "content" must be array`);
        }
      }
    });
  }
  console.log("Diagnostics count:", diag.length);

  return diagnostics;
}
