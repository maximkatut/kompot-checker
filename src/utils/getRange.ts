import * as jsonc from "jsonc-parser";
import * as vscode from "vscode";

export function getRangeFromZodPath(doc: vscode.TextDocument, path: (string | number)[]): vscode.Range {
  const text = doc.getText();
  const root = jsonc.parseTree(text);
  if (!root) {
    return new vscode.Range(0, 0, 0, 1);
  }

  let node = jsonc.findNodeAtLocation(root, path);
  if (!node && path.length > 1) {
    // Try parent object if value is missing
    node = jsonc.findNodeAtLocation(root, path.slice(0, -1));
  }

  if (!node) {
    return new vscode.Range(0, 0, 0, 1);
  }

  const start = doc.positionAt(node.offset);
  const end = doc.positionAt(node.offset + node.length);
  return new vscode.Range(start, end);
}
