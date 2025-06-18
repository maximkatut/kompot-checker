# Kompot Checker

`kompot-checker` is a Visual Studio Code extension that helps developers inspect, edit, and validate complex UI panel configuration JSON files — particularly ones that contain embedded JavaScript code snippets.

## Features

- ✅ **Split view editing**: View and edit embedded `{js{ ... }js}` JavaScript blocks in a dedicated editor.
- 🧠 **Intelligent JS extraction & replacement**: Automatically detects JS blocks, opens them in a temp editor, and replaces them back in the correct location.
- 📏 **JSON structure validation**: Uses a strict schema to ensure UI config files follow expected structure (ignores JS content).
- 💡 **Syntax highlighting & Prettier formatting** support for extracted JS code.
- 🔐 **Preserves JS content** as-is — your logic, untouched.

![Split view example](/src/img/split-view.png)

## How to use it

- Open a .json config file for a UI panel
- The extension will highlight structure errors based on the predefined schema
- Click on an embedded {js{ ... }js} block and press combination **Shift + Cmd(Ctrl) + E** to open it in a temporary editor
- Make changes and save by **Shift + Cmd(Ctrl) + S** – the original file will be updated

## Requirements

- Visual Studio Code 1.80+
- Node.js 16+ for development
- No runtime dependencies required for extension usage

## Extension Commands

This extension registers the following commands:

| Command ID                             | Description                                       |
| -------------------------------------- | ------------------------------------------------- |
| `kompotChecker.openEmbeddedJs`         | Opens embedded `{js{ ... }js}` block in a new tab |
| `kompotChecker.saveEmbeddedJsAndClose` | Saves and injects edited JS block back into JSON  |
| `kompotChecker.validateJsonStructure`  | Validates current file against Kompot schema      |

You can bind these to your own keyboard shortcuts via package.json.

## Extension Settings

No user-configurable settings at the moment.

## Release Notes

### 1.0.0

- Initial release
- JS extraction and save flow working
- JSON structure validation added

---

## Schema Validation

The extension uses a JSON Schema to validate panel structure, ignoring the embedded JavaScript.

You can extend or modify the schema in future versions. Validation does **not** parse or execute the JS inside `{js{...}js}` blocks.

---

## Development

To run locally:

```bash
git clone https://github.com/yourusername/kompot-checker.git
cd kompot-checker
npm install
code .
```

Use `F5` to start debugging the extension in a new VS Code window.

---

## Contributing

Contributions, ideas, and issues are welcome. Please open an issue or submit a pull request.

---

## License

MIT © 2025 \Max Bee
