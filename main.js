
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog
} = require("electron");

const fs = require("node:fs/promises");
const path = require("node:path");
const { execFile } = require("node:child_process");

let mainWindow;

const authorizedRoots = new Set();

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 950,
    minWidth: 950,
    minHeight: 650,
    title: "Sharp Code",
    backgroundColor: "#071711,
    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile("index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// SECURITY

function getAuthorizedRoot(targetPath) {
  if (typeof targetPath !== "string" || !targetPath.trim()) {
    throw new Error("Invalid path");
  }

  const absolute = path.resolve(targetPath);

  for (const root of authorizedRoots) {
    const relative = path.relative(root, absolute);

    if (
      relative === "" ||
      (!relative.startsWith("..") && !path.isAbsolute(relative))
    ) {
      return root;
    }
  }

  throw new Error("Access denied: folder not authorized");
}

async function ensureSafeFile(filePath) {
  const root = getAuthorizedRoot(filePath);
  const absolute = path.resolve(filePath);

  let current = absolute;

  while (current !== root && current !== path.dirname(current)) {
    try {
      const stat = await fs.lstat(current);

      if (stat.isSymbolicLink()) {
        throw new Error("Symbolic links are not allowed");
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    current = path.dirname(current);
  }

  return absolute;
}

// PROJECT MANAGEMENT

ipcMain.handle("project:open", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"]
  });

  if (result.canceled || !result.filePaths.length) {
    return null;
  }

  const projectPath = path.resolve(result.filePaths[0]);

  authorizedRoots.add(projectPath);

  return {
    name: path.basename(projectPath),
    path: projectPath
  };
});

// FILE EXPLORER

ipcMain.handle("directory:read", async (_, directory) => {
  const absolute = await ensureSafeFile(directory);

  const stat = await fs.stat(absolute);

  if (!stat.isDirectory()) {
    throw new Error("Not a directory");
  }

  const entries = await fs.readdir(absolute, {
    withFileTypes: true
  });

  return entries
    .filter(entry =>
      !entry.name.startsWith(".") &&
      entry.name !== "node_modules"
    )
    .map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      path: path.join(absolute, entry.name)
    }));
});

// READ PROJECT FILE

ipcMain.handle("file:read-project", async (_, filePath) => {
  const absolute = await ensureSafeFile(filePath);

  const stat = await fs.stat(absolute);

  if (!stat.isFile()) {
    throw new Error("Not a file");
  }

  if (stat.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds the 5 MB limit");
  }

  return {
    name: path.basename(absolute),
    path: absolute,
    content: await fs.readFile(absolute, "utf8")
  };
});

// OPEN EXTERNAL FILE

ipcMain.handle("file:open", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"]
  });

  if (result.canceled || !result.filePaths.length) {
    return null;
  }

  const filePath = result.filePaths[0];
  const stat = await fs.stat(filePath);

  if (!stat.isFile() || stat.size > MAX_FILE_SIZE) {
    throw new Error("Unsupported file");
  }

  return {
    name: path.basename(filePath),
    path: filePath,
    content: await fs.readFile(filePath, "utf8")
  };
});

// SAVE FILE

ipcMain.handle("file:save", async (_, data) => {
  if (!data || typeof data.content !== "string") {
    throw new Error("Invalid file data");
  }

  let filePath = data.path;

  if (!filePath) {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: data.name || "untitled.js"
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    filePath = result.filePath;

    const parent = path.dirname(path.resolve(filePath));

    getAuthorizedRoot(parent);
  }

  const absolute = await ensureSafeFile(filePath);

  const parent = path.dirname(absolute);
  const parentStat = await fs.stat(parent);

  if (!parentStat.isDirectory()) {
    throw new Error("Parent directory does not exist");
  }

  await fs.writeFile(absolute, data.content, "utf8");

  return {
    name: path.basename(absolute),
    path: absolute
  };
});

// CREATE FILE

ipcMain.handle("file:create", async (_, data) => {
  if (
    !data ||
    typeof data.path !== "string" ||
    typeof data.name !== "string" ||
    data.name.includes("/") ||
    data.name.includes("\\") ||
    data.name === "." ||
    data.name === ".."
  ) {
    throw new Error("Invalid filename");
  }

  const directory = await ensureSafeFile(data.path);
  const filePath = path.join(directory, data.name);

  await ensureSafeFile(filePath);

  await fs.writeFile(filePath, "", {
    encoding: "utf8",
    flag: "wx"
  });

  return {
    name: data.name,
    path: filePath
  };
});

// CREATE FOLDER

ipcMain.handle("folder:create", async (_, data) => {
  if (
    !data ||
    typeof data.path !== "string" ||
    typeof data.name !== "string" ||
    !data.name.trim() ||
    data.name.includes("/") ||
    data.name.includes("\\")
  ) {
    throw new Error("Invalid folder name");
  }

  const parent = await ensureSafeFile(data.path);
  const folderPath = path.join(parent, data.name);

  await ensureSafeFile(folderPath);
  await fs.mkdir(folderPath);

  return {
    name: data.name,
    path: folderPath
  };
});

// DELETE FILE

ipcMain.handle("file:delete", async (_, filePath) => {
  const absolute = await ensureSafeFile(filePath);
  const stat = await fs.lstat(absolute);

  if (stat.isDirectory() || stat.isSymbolicLink()) {
    throw new Error("Only regular files can be deleted here");
  }

  await fs.unlink(absolute);

  return true;
});

// RENAME FILE

ipcMain.handle("file:rename", async (_, data) => {
  if (
    !data ||
    typeof data.oldPath !== "string" ||
    typeof data.newName !== "string" ||
    !data.newName.trim() ||
    data.newName.includes("/") ||
    data.newName.includes("\\")
  ) {
    throw new Error("Invalid rename request");
  }

  const oldPath = await ensureSafeFile(data.oldPath);
  const newPath = path.join(
    path.dirname(oldPath),
    data.newName
  );

  await ensureSafeFile(newPath);
  await fs.rename(oldPath, newPath);

  return {
    name: data.newName,
    path: newPath
  };
});

// GIT INTEGRATION
// Executes Git using a fixed executable and argument list.
// It does not invoke a shell or accept arbitrary commands.

ipcMain.handle("git:status", async (_, directory) => {
  const root = getAuthorizedRoot(directory);

  return new Promise((resolve, reject) => {
    execFile(
      "git",
      ["status", "--short", "--branch"],
      {
        cwd: root,
        timeout: 10000,
        windowsHide: true
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || "Git status failed"));
          return;
        }

        resolve(stdout);
      }
    );
  });
});

// APPLICATION

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
