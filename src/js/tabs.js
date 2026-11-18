
const SharpTabs = (() => {
  let tabs = [];
  let activeTab = null;

  function create(name, content = "") {
    const id = crypto.randomUUID();

    tabs.push({
      id,
      name,
      content,
      dirty: false
    });

    activeTab = id;
    render();

    return id;
  }

  function select(id) {
    const tab = tabs.find(item => item.id === id);

    if (!tab) return;

    if (activeTab && window.editor) {
      const previous = tabs.find(item => item.id === activeTab);

      if (previous) {
        previous.content = window.editor.getValue();
      }
    }

    activeTab = id;

    if (window.editor) {
      window.editor.setValue(tab.content);
      monaco.editor.setModelLanguage(
        window.editor.getModel(),
        detectLanguage(tab.name)
      );
    }

    render();
  }

  function close(id) {
    tabs = tabs.filter(tab => tab.id !== id);

    if (activeTab === id) {
      activeTab = tabs.length ? tabs[tabs.length - 1].id : null;

      if (activeTab) {
        select(activeTab);
      }
    }

    render();
  }

  function render() {
    const container = document.getElementById("tabs");

    if (!container) return;

    container.replaceChildren();

    tabs.forEach(tab => {
      const button = document.createElement("button");
      button.className =
        "editor-tab" + (tab.id === activeTab ? " selected" : "");

      const label = document.createElement("span");
      label.textContent = tab.name;

      const closeButton = document.createElement("span");
      closeButton.textContent = " ×";
      closeButton.addEventListener("click", event => {
        event.stopPropagation();
        close(tab.id);
      });

      button.append(label, closeButton);
      button.addEventListener("click", () => select(tab.id));

      container.appendChild(button);
    });
  }

  return { create, select, close, render };
})();

window.SharpTabs = SharpTabs;
