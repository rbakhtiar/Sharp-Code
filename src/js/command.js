
window.SharpCommands = (() => {
  const commands = [
    {
      name: "New File",
      shortcut: "Ctrl + N",
      action: () => window.SharpApp.newFile()
    },
    {
      name: "Open File",
      shortcut: "Ctrl + O",
      action: () => window.SharpApp.openFile()
    },
    {
      name: "Open Project",
      shortcut: "",
      action: () => window.SharpApp.openProject()
    },
    {
      name: "Save File",
      shortcut: "Ctrl + S",
      action: () => window.SharpApp.saveFile()
    },
    {
      name: "Settings",
      shortcut: "Ctrl + ,",
      action: () => {
        document.getElementById("settingsModal").hidden = false;
      }
    },
    {
      name: "Clear Output",
      shortcut: "",
      action: () => window.SharpConsole.clear()
    }
  ];

  function open() {
    const overlay = document.getElementById("commandPalette");

    overlay.hidden = false;

    const input = document.getElementById("commandSearch");
    input.value = "";
    render("");
    input.focus();
  }

  function close() {
    document.getElementById("commandPalette").hidden = true;
  }

  function render(query) {
    const container = document.getElementById("commandResults");
    container.replaceChildren();

    commands
      .filter(command =>
        command.name.toLowerCase().includes(query.toLowerCase())
      )
      .forEach(command => {
        const button = document.createElement("button");

        button.className = "command-item";
        button.textContent =
          command.name + "    " + command.shortcut;

        button.addEventListener("click", () => {
          close();
          command.action();
        });

        container.appendChild(button);
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

    if (
      event.key === "Escape" &&
      !document.getElementById("commandPalette").hidden
    ) {
      close();
    }
  });

  document.getElementById("commandSearch")
    .addEventListener("input", event => render(event.target.value));

  return { open, close, render };
})();
