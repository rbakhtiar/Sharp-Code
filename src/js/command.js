
const SharpCommands = (() => {
  const commands = [
    {
      name: "New File",
      shortcut: "Ctrl + N",
      action: () => document.getElementById("newFile").click()
    },
    {
      name: "Open File",
      shortcut: "Ctrl + O",
      action: () => document.getElementById("openFile").click()
    },
    {
      name: "Save File",
      shortcut: "Ctrl + S",
      action: () => document.getElementById("saveFile").click()
    },
    {
      name: "Show Editor",
      shortcut: "",
      action: () => window.editor?.focus()
    }
  ];

  function open() {
    const palette = document.getElementById("commandPalette");

    palette.hidden = false;

    const input = document.getElementById("commandSearch");
    input.value = "";
    input.focus();

    render("");
  }

  function close() {
    document.getElementById("commandPalette").hidden = true;
  }

  function render(query) {
    const results = document.getElementById("commandResults");

    results.replaceChildren();

    commands
      .filter(command =>
        command.name.toLowerCase().includes(query.toLowerCase())
      )
      .forEach(command => {
        const item = document.createElement("button");
        item.className = "command-item";
        item.textContent =
          command.name + "  ·  " + command.shortcut;

        item.addEventListener("click", () => {
          close();
          command.action();
        });

        results.appendChild(item);
      });
  }

  document.addEventListener("keydown", event => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key.toLowerCase() === "p"
    ) {
      event.preventDefault();
      open();
    }

    if (event.key === "Escape") close();
  });

  document.getElementById("commandSearch")
    ?.addEventListener("input", event => {
      render(event.target.value);
    });

  return { open, close, render };
})();

window.SharpCommands = SharpCommands;
