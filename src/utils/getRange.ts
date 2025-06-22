import * as jsonc from "jsonc-parser";
import * as vscode from "vscode";

export function getRangeFromZodPath(doc: vscode.TextDocument, path: (string | number)[]): vscode.Range {
  const text = doc.getText();
  const root = jsonc.parseTree(text);
  if (!root) {
    return new vscode.Range(0, 0, 0, 1);
  }

  let currentNode = root;
  let lastValidNode = root;

  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    const nextNode = jsonc.findNodeAtLocation(currentNode, [segment]);

    if (!nextNode) {
      // Try parent object instead
      const fallbackNode = jsonc.findNodeAtLocation(root, path.slice(0, i));
      if (fallbackNode) {
        lastValidNode = fallbackNode;
      }
      break;
    }

    lastValidNode = nextNode;
    currentNode = nextNode;
  }

  const start = doc.positionAt(lastValidNode.offset);
  const end = doc.positionAt(lastValidNode.offset + lastValidNode.length);
  return new vscode.Range(start, end);
}
