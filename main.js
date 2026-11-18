
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog
} = require("electron");

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
    backgroundColor: "#071711",
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

function isInside(parent, target) {
  const relative = path.relative(parent, target);

  return relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative));
}

ipcMain.handle("project:open", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"]
  });

  if (result.canceled || !result.filePaths[0]) return null;

  const projectPath = result.filePaths[0];

  return {
    path: projectPath,
    name: path.basename(projectPath)
  };
});

ipcMain.handle("directory:read", async (_, directory) => {
  const root = await app.getPath("documents");

  if (typeof directory !== "string") {
    throw new Error("Invalid directory");
  }

  const absolute = path.resolve(directory);

  // Only directories selected through the project picker are accessible.
  if (!allowedRoots.some(base => isInside(base, absolute))) {
    throw new Error("Access denied");
  }

  const entries = await fs.readdir(absolute, {
    withFileTypes: true
  });

  return entries
    .filter(entry => !entry.name.startsWith("."))
    .map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      path: path.join(absolute, entry.name)
    }))
    .filter(entry => entry.isDirectory ||
      !entry.name.endsWith(".exe"));
});

const allowedRoots = new Set();

ipcMain.handle("project:authorize", async (_, directory) => {
  if (typeof directory !== "string") {
    throw new Error("Invalid directory");
  }

  const absolute = path.resolve(directory);

  const stat = await fs.stat(absolute);

  if (!stat.isDirectory()) {
    throw new Error("Not a directory");
  }

  allowedRoots.add(absolute);

  return true;
});

ipcMain.handle("file:open", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"]
  });

  if (result.canceled || !result.filePaths[0]) return null;

  const filePath = result.filePaths[0];

  return {
    path: filePath,
    name: path.basename(filePath),
    content: await fs.readFile(filePath, "utf8")
  };
});

ipcMain.handle("file:read-project", async (_, filePath) => {
  if (typeof filePath !== "string") {
    throw new Error("Invalid file path");
  }

  const absolute = path.resolve(filePath);

  if (!Array.from(allowedRoots).some(root =>
    isInside(root, absolute)
  )) {
    throw new Error("Access denied");
  }

  const stat = await fs.stat(absolute);

  if (!stat.isFile() || stat.size > 5 * 1024 * 1024) {
    throw new Error("File is not supported or is too large");
  }

  return {
    path: absolute,
    name: path.basename(absolute),
    content: await fs.readFile(absolute, "utf8")
  };
});

ipcMain.handle("file:save", async (_, data) => {
  if (!data || typeof data.content !== "string") {
    throw new Error("Invalid file data");
  }

  let filePath = data.path;

  if (!filePath) {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: data.name || "untitled.js"
    });

    if (result.canceled || !result.filePath) return null;

    filePath = result.filePath;
  }

  const absolute = path.resolve(filePath);

  if (allowedRoots.size && !Array.from(allowedRoots).some(root =>
    isInside(root, absolute)
  )) {
    throw new Error("Access denied");
  }

  await fs.writeFile(absolute, data.content, "utf8");

  return {
    path: absolute,
    name: path.basename(absolute)
  };
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
