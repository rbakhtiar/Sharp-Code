
const SharpConsole = (() => {
  function log(message, type = "info") {
    const output = document.getElementById("consoleOutput");

    if (!output) return;

    const line = document.createElement("div");

    line.className = "console-line " + type;
    line.textContent =
      "[" + new Date().toLocaleTimeString() + "] " + message;

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function clear() {
    const output = document.getElementById("consoleOutput");

    if (output) output.replaceChildren();
  }

  return { log, clear };
})();

window.SharpConsole = SharpConsole;
