
const SharpSettings = (() => {
  const defaults = {
    fontSize: 14,
    minimap: true,
    wordWrap: "off",
    tabSize: 2,
    theme: "sharp-emerald"
  };

  let settings = { ...defaults };

  function update(key, value) {
    if (!(key in defaults)) {
      throw new Error("Unknown setting");
    }

    settings[key] = value;

    if (window.editor) {
      window.editor.updateOptions({
        fontSize: settings.fontSize,
        minimap: { enabled: settings.minimap },
        wordWrap: settings.wordWrap,
        tabSize: settings.tabSize
      });

      window.editor.layout();
    }
  }

  function get(key) {
    return settings[key];
  }

  function reset() {
    settings = { ...defaults };
    updateEditor();
  }

  function updateEditor() {
    if (!window.editor) return;

    window.editor.updateOptions({
      fontSize: settings.fontSize,
      minimap: { enabled: settings.minimap },
      wordWrap: settings.wordWrap,
      tabSize: settings.tabSize
    });
  }

  return { update, get, reset, updateEditor };
})();

window.SharpSettings = SharpSettings;
