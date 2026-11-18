
let editor;
let currentPath = null;
let currentName = "untitled.js";
let isDirty = false;

const starterCode = `// Welcome to Sharp Code
// Your development workspace.

function welcome() {
  console.log("Welcome to Sharp Code!");
}

welcome();
`;

const languageMap = {
  js: "javascript",
  mjs: "javascript",
  ts: "typescript",
  html: "html",
  css: "css",
  json: "json",
  py: "python",
  cpp: "cpp",
  c: "c",
  h: "c",
  java: "java",
  rs: "rust",
  md: "markdown",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml"
};

function detectLanguage(name) {
  const extension = name.split(".").pop().toLowerCase();
  return languageMap[extension] || "plaintext";
}

function updateFileName(name) {
  currentName = name;

  document.getElementById("fileName").textContent = name;
  document.getElementById("breadcrumbFile").textContent = name;

  document.getElementById("languageLabel").textContent =
    detectLanguage(name).toUpperCase();
}

function setStatus(message) {
  document.getElementById("status").textContent = message;
}

function markDirty() {
  if (!isDirty) {
    isDirty = true;
    document.getElementById("modified").textContent = "●";
  }
}

function clearDirty() {
  isDirty = false;
  document.getElementById("modified").textContent = "";
}

function initializeEditor() {
  require.config({
    paths: {
      vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs"
    }
  });

  require(["vs/editor/editor.main"], function () {
    monaco.editor.defineTheme("sharp-emerald", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "719B82" },
        { token: "keyword", foreground: "67DDAA" },
        { token: "string", foreground: "C2E8A0" }
      ],
      colors: {
        "editor.background": "#071711",
        "editor.foreground": "#D9EEE1",
        "editorLineNumber.foreground": "#456B54",
        "editorLineNumber.activeForeground": "#72DDAA",
        "editorCursor.foreground": "#70E5AE",
        "editor.selectionBackground": "#205D42",
        "editor.lineHighlightBackground": "#10291D"
      }
    });

    editor = monaco.editor.create(
      document.getElementById("editor"),
      {
        value: starterCode,
        language: "javascript",
        theme: "sharp-emerald",
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "Consolas, monospace",
        minimap: { enabled: true },
        roundedSelection: true,
        scrollBeyondLastLine: false,
        padding: { top: 16 },
        cursorBlinking: "smooth"
      }
    );

    editor.onDidChangeModelContent(markDirty);

    editor.onDidChangeCursorPosition(event => {
      document.getElementById("cursorPosition").textContent =
        `Ln ${event.position.lineNumber}, Col ${event.position.column}`;
    });

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      saveFile
    );

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO,
      openFile
    );

    setStatus("Editor ready");
  });
}

function newFile() {
  editor.setValue("");
  currentPath = null;
  updateFileName("untitled.js");
  clearDirty();
  setStatus("New document created");
}

async function openFile() {
  try {
    const file = await window.sharp.openFile();

    if (!file) return;

    editor.setValue(file.content);
    currentPath = file.path;

    updateFileName(file.name);
    monaco.editor.setModelLanguage(
      editor.getModel(),
      detectLanguage(file.name)
    );

    clearDirty();
    setStatus("Opened " + file.name);
  } catch (error) {
    setStatus("Could not open file");
    console.error(error);
  }
}

async function saveFile() {
  try {
    const result = await window.sharp.saveFile({
      path: currentPath,
      content: editor.getValue()
    });

    if (!result) return;

    currentPath = result.path;
    updateFileName(result.name);

    monaco.editor.setModelLanguage(
      editor.getModel(),
      detectLanguage(result.name)
    );

    clearDirty();
    setStatus("Saved successfully");
  } catch (error) {
    setStatus("Could not save file");
    console.error(error);
  }
}

document.getElementById("newFile").addEventListener(
  "click", newFile
);

document.getElementById("openFile").addEventListener(
  "click", openFile
);

document.getElementById("saveFile").addEventListener(
  "click", saveFile
);

initializeEditor();
