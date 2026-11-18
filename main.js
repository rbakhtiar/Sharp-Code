
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sharp", {
  openProject: () =>
    ipcRenderer.invoke("project:open"),

  openFile: () =>
    ipcRenderer.invoke("file:open"),

  saveFile: data =>
    ipcRenderer.invoke("file:save", data),

  readDirectory: directory =>
    ipcRenderer.invoke("directory:read", directory),

  readProjectFile: filePath =>
    ipcRenderer.invoke("file:read-project", filePath),

  createFile: data =>
    ipcRenderer.invoke("file:create", data),

  createFolder: data =>
    ipcRenderer.invoke("folder:create", data),

  deleteFile: filePath =>
    ipcRenderer.invoke("file:delete", filePath),

  renameFile: data =>
    ipcRenderer.invoke("file:rename", data),

  gitStatus: directory =>
    ipcRenderer.invoke("git:status", directory)
});
