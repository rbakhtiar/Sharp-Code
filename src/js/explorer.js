
window.Explorer = (() => {
  let root = null;
  let files = [];

  function initialize() {
    render();
  }

  async function setRoot(path) {
    root = path;
    await refresh();
  }

  async function refresh() {
    if (!root) return;

    try {
      files = await window.sharp.readDirectory(root);
      render();
    } catch (error) {
      console.error(error);
    }
  }

  function render() {
    const container = document.getElementById("fileTree");
    container.replaceChildren();

    if (!root) {
      const empty = document.createElement("div");
      empty.className = "empty-tree";
      empty.textContent = "Open a folder to get started.";
      container.appendChild(empty);
      return;
    }

    function addItems(items, parent) {
      items.forEach(item => {
        const row = document.createElement("button");
        row.className = "file-item";
        row.textContent =
          (item.isDirectory ? "▸ " : "◇ ") + item.name;

        row.addEventListener("click", async () => {
          if (item.isDirectory) {
            const children = await window.sharp.readDirectory(item.path);

            const expanded = parent.querySelector(
              `[data-path="${CSS.escape(item.path)}"]`
            );

            if (expanded) {
              expanded.remove();
            } else {
              const group = document.createElement("div");
              group.className = "folder-contents";
              group.dataset.path = item.path;

              addItems(children, group);
              row.after(group);
            }
          } else {
            const file = await window.sharp.readProjectFile(item.path);

            window.SharpTabs.open(file);
          }
        });

        parent.appendChild(row);
      });
    }

    addItems(files, container);
  }

  return {
    initialize,
    setRoot,
    refresh,
    render
  };
})();
