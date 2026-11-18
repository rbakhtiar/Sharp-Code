
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "Sharp Code",
    backgroundColor: "#071B16",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle("file:open", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Code files", extensions: [
        "js", "ts", "html", "css", "json", "py",
        "cpp", "c", "h", "java", "rs", "md",
        "txt", "xml", "yaml", "yml"
      ] },
      { name: "All files", extensions: ["*"] }
    ]
  });

  if (result.canceled || !result.filePaths.length) {
    return null;
  }

  const filePath = result.filePaths[0];
  const content = await fs.readFile(filePath, "utf8");

  return {
    path: filePath,
    name: path.basename(filePath),
    content
  };
});

ipcMain.handle("file:save", async (_, data) => {
  if (!data || typeof data.content !== "string") {
    throw new Error("Invalid file content.");
  }

  let filePath = data.path;

  if (!filePath) {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: "untitled.js"
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    filePath = result.filePath;
  }

  await fs.writeFile(filePath, data.content, "utf8");

  return {
    path: filePath,
    name: path.basename(filePath)
  };
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
