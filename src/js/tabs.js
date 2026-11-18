
window.SharpTabs = (() => {
  let tabs = [];
  let activeId = null;
  let editor = null;

  function initialize(instance) {
    editor = instance;
  }

  function getActive() {
    return tabs.find(tab => tab.id === activeId) || null;
  }

  function create(name, content = "", path = null) {
    const id = crypto.randomUUID();

    const model = monaco.editor.createModel(
      content,
      detectLanguage(name)
    );

    const tab = {
      id,
      name,
      content,
      path,
      dirty: false,
      model
    };

    tabs.push(tab);
    select(id);

    return tab;
  }

  function open(file) {
    const existing = tabs.find(tab => tab.path === file.path);

    if (existing) {
      select(existing.id);
      return existing;
    }

    return create(file.name, file.content, file.path);
  }

  function select(id) {
    const tab = tabs.find(item => item.id === id);

    if (!tab) return;

    activeId = id;
    editor.setModel(tab.model);

    document.getElementById("breadcrumb").textContent =
      tab.path || tab.name;

    document.getElementById("languageLabel").textContent =
      detectLanguage(tab.name).toUpperCase();

    document.getElementById("languageStatus").textContent =
      detectLanguage(tab.name);

    render();
  }

  function close(id) {
    const index = tabs.findIndex(tab => tab.id === id);

    if (index === -1) return;

    const tab = tabs[index];

    if (tab.dirty) {
      const discard = confirm(
        "This file has unsaved changes. Close anyway?"
      );

      if (!discard) return;
    }

    const wasActive = activeId === id;

    tab.model.dispose();
    tabs.splice(index, 1);

    if (wasActive) {
      activeId = null;

      if (tabs.length) {
        select(tabs[Math.max(0, index - 1)].id);
      } else {
        editor.setModel(null);
        document.getElementById("breadcrumb").textContent = "Workspace";
      }
    }

    render();
  }

  function render() {
    const container = document.getElementById("tabs");
    container.replaceChildren();

    tabs.forEach(tab => {
      const button = document.createElement("button");

      button.className =
        "editor-tab" + (tab.id === activeId ? " selected" : "");

      const label = document.createElement("span");
      label.textContent = tab.name;

      const closeButton = document.createElement("span");
      closeButton.className = "tab-close";
      closeButton.textContent = tab.dirty ? "●" : "×";

      closeButton.title = tab.dirty ? "Unsaved changes" : "Close tab";

      closeButton.addEventListener("click", event => {
        event.stopPropagation();
        close(tab.id);
      });

      button.append(label, closeButton);
      button.addEventListener("click", () => select(tab.id));

      container.appendChild(button);
    });
  }

  function getAll() {
    return [...tabs];
  }

  return {
    initialize,
    create,
    open,
    select,
    close,
    render,
    getActive,
    getAll
  };
})();
