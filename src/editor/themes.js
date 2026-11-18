
window.SharpThemes = (() => {
  const themes = {
    emerald: {
      background: "#071711",
      foreground: "#D9EEE1",
      accent: "#36C98B"
    },

    forest: {
      background: "#102016",
      foreground: "#E2F0D9",
      accent: "#A3D977"
    },

    midnight: {
      background: "#101827",
      foreground: "#E0E9F8",
      accent: "#55B9F5"
    },

    obsidian: {
      background: "#111111",
      foreground: "#EEEEEE",
      accent: "#AAAAAA"
    }
  };

  function registerAll() {
    Object.entries(themes).forEach(([name, theme]) => {
      monaco.editor.defineTheme("sharp-" + name, {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "719B82" },
          { token: "keyword", foreground: "67DDAA" },
          { token: "string", foreground: "C2E8A0" }
        ],
        colors: {
          "editor.background": theme.background,
          "editor.foreground": theme.foreground,
          "editorCursor.foreground": theme.accent,
          "editorLineNumber.activeForeground": theme.accent,
          "editor.selectionBackground": "#205D42"
        }
      });
    });
  }

  function apply(name) {
    if (!themes[name]) return;

    monaco.editor.setTheme("sharp-" + name);
    localStorage.setItem("sharp-theme", name);
  }

  return {
    themes,
    registerAll,
    apply
  };
})();
