
(() => {
  let editor = null;
  let currentPanel = "editor";

  const $ = id => document.getElementById(id);

  const languageMap = {
    js: "javascript",
    mjs: "javascript",
    cjs: "javascript",
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

  window.detectLanguage = name => {
    const extension = name.split(".").pop().toLowerCase();
    return languageMap[extension] || "plaintext";
  };

  function updateStatus(message) {
    $("status").textContent = message;
  }

  function updateLanguage(name) {
    const language = window.detectLanguage(name);

    $("languageLabel").textContent = language.toUpperCase();
    $("languageStatus").textContent = language;
  }

  function createEditor() {
    return new Promise((resolve, reject) => {
      require.config({
        paths: {
          vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs"
        }
      });

      require(["vs/editor/editor.main"], () => {
        try {
          window.SharpThemes.registerAll();

          editor = monaco.editor.create($("editor"), {
            value: "",
            language: "javascript",
            theme: "sharp-emerald",
            automaticLayout: true,
            fontSize: 14,
            fontFamily: "Consolas, monospace",
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            padding: { top: 14 },
            wordWrap: "off",
            tabSize: 2
          });

          window.editor = editor;

          editor.onDidChangeCursorPosition(event => {
            $("cursorPosition").textContent =
              `Ln ${event.position.lineNumber}, Col ${event.position.column}`;
          });

          editor.onDidChangeModelContent(() => {
            const tab = window.SharpTabs.getActive();

            if (tab) {
              tab.dirty = true;
              window.SharpTabs.render();
            }
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      }, reject);
    });
  }

  function newFile() {
    window.SharpTabs.create("untitled.js", "", null);
    updateStatus("New file created");
  }

  async function openFile() {
    try {
      const file = await window.sharp.openFile();

      if (!file) return;

      window.SharpTabs.open(file);
      updateStatus("Opened " + file.name);
    } catch (error) {
      console.error(error);
      updateStatus("File opening failed");
    }
  }

  async function saveFile() {
    const tab = window.SharpTabs.getActive();

    if (!tab) return;

    try {
      const result = await window.sharp.saveFile({
        path: tab.path,
        name: tab.name,
        content: editor.getValue()
      });

      if (!result) return;

      tab.path = result.path;
      tab.name = result.name;
      tab.dirty = false;

      editor.getModel().updateOptions({
        tabSize: 2
      });

      updateLanguage(tab.name);
      window.SharpTabs.render();
      window.Explorer.render();

      updateStatus("Saved " + result.name);
    } catch (error) {
      console.error(error);
      updateStatus("Saving failed");
    }
  }

  async function openProject() {
    try {
      const project = await window.sharp.openProject();

      if (!project) return;

      window.ProjectManager.setProject(project);
      window.Explorer.setRoot(project.path);
      window.Explorer.render();

      $("projectTitle").textContent = project.name.toUpperCase();

      updateStatus("Project opened: " + project.name);
    } catch (error) {
      console.error(error);
      updateStatus("Could not open project");
    }
  }

  function switchPanel(panel) {
    currentPanel = panel;

    document.querySelectorAll(".tool").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.panel === panel
      );
    });

    if (panel !== "editor") {
      updateStatus(panel.toUpperCase() + " module is not available yet");
    } else {
      updateStatus("Editor ready");
      editor.focus();
    }
  }

  function initializeEvents() {
    $("newFile").addEventListener("click", newFile);
    $("openFile").addEventListener("click", openFile);
    $("saveFile").addEventListener("click", saveFile);
    $("openProject").addEventListener("click", openProject);

    $("clearConsole").addEventListener(
      "click",
      window.SharpConsole.clear
    );

    $("commandButton").addEventListener(
      "click",
      window.SharpCommands.open
    );

    document.querySelectorAll(".tool").forEach(button => {
      button.addEventListener("click", () => {
        switchPanel(button.dataset.panel);
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key === "F1") {
        event.preventDefault();
        window.SharpCommands.open();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "n"
      ) {
        event.preventDefault();
        newFile();
      }
    });

    $("fontSize").addEventListener("change", event => {
      window.SharpSettings.update("fontSize", Number(event.target.value));
    });

    $("themeSelect").addEventListener("change", event => {
      window.SharpThemes.apply(event.target.value);
    });

    $("wordWrap").addEventListener("change", event => {
      window.SharpSettings.update("wordWrap", event.target.value);
    });

    $("closeSettings").addEventListener("click", () => {
      $("settingsModal").hidden = true;
    });

    $("resetSettings").addEventListener("click", () => {
      window.SharpSettings.reset();
      $("fontSize").value = 14;
      $("themeSelect").value = "emerald";
      $("wordWrap").value = "off";
    });
  }

  async function initialize() {
    try {
      await createEditor();

      window.SharpTabs.initialize(editor);
      window.Explorer.initialize();
      window.SharpSettings.initialize(editor);

      initializeEvents();

      newFile();

      window.SharpConsole.log(
        "Sharp Code 0.2.0 initialized",
        "success"
      );

      window.SharpConsole.log("Monaco editor loaded");

      updateStatus("Ready");
    } catch (error) {
      console.error(error);
      updateStatus("Initialization failed");
    }
  }

  window.SharpApp = {
    getEditor: () => editor,
    getPanel: () => currentPanel,
    newFile,
    openFile,
    saveFile,
    openProject
  };

  initialize();
})();
