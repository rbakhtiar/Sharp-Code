
window.SharpSettings = (() => {
  let editor;

  const defaults = {
    fontSize: 14,
    wordWrap: "off",
    minimap: true,
    tabSize: 2
  };

  let settings = { ...defaults };

  function initialize(instance) {
    editor = instance;
    apply();
  }

  function update(key, value) {
    if (!(key in defaults)) return;

    if (key === "fontSize") {
      value = Math.min(30, Math.max(10, Number(value)));
    }

    settings[key] = value;
    apply();
  }

  function apply() {
    if (!editor) return;

    editor.updateOptions({
      fontSize: settings.fontSize,
      wordWrap: settings.wordWrap,
      minimap: { enabled: settings.minimap },
      tabSize: settings.tabSize
    });
  }

  function reset() {
    settings = { ...defaults };
    apply();
  }

  function get(key) {
    return settings[key];
  }

  return {
    initialize,
    update,
    apply,
    reset,
    get
  };
})();
