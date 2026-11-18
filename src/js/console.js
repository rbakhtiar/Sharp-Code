
window.SharpConsole = (() => {
  function log(message, type = "info") {
    const output = document.getElementById("consoleOutput");

    const line = document.createElement("div");
    line.className = "console-line " + type;

    const timestamp = new Date().toLocaleTimeString();

    line.textContent = `[${timestamp}] ${String(message)}`;

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function clear() {
    document.getElementById("consoleOutput").replaceChildren();
  }

  return {
    log,
    clear
  };
})();
