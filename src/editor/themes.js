
const SharpThemes = {
  emerald: {
    background: "#071711",
    foreground: "#D9EEE1",
    accent: "#36C98B"
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
  },

  forest: {
    background: "#102016",
    foreground: "#E2F0D9",
    accent: "#A3D977"
  }
};

function registerSharpTheme(name) {
  const theme = SharpThemes[name];

  if (!theme) return;

  monaco.editor.defineTheme("sharp-" + name, {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": theme.background,
      "editor.foreground": theme.foreground,
      "editorCursor.foreground": theme.accent,
      "editorLineNumber.activeForeground": theme.accent
    }
  });

  window.editor?.updateOptions({
    theme: "sharp-" + name
  });
}

window.SharpThemes = SharpThemes;
window.registerSharpTheme = registerSharpTheme;
