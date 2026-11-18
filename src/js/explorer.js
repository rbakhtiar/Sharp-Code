
const Explorer = (() => {
  const files = [];

  function addFile(name, type = "file") {
    files.push({ name, type });
    render();
  }

  function removeFile(name) {
    const index = files.findIndex(file => file.name === name);

    if (index !== -1) {
      files.splice(index, 1);
    }

    render();
  }

  function render() {
    const container = document.getElementById("fileTree");

    if (!container) return;

    container.innerHTML = "";

    files.forEach(file => {
      const item = document.createElement("div");
      item.className = "file-item";
      item.textContent =
        (file.type === "folder" ? "▸ " : "◇ ") + file.name;

      container.appendChild(item);
    });
  }

  return { addFile, removeFile, render };
})();

window.Explorer = Explorer;
