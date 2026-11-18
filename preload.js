
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sharp", {
  openFile: () =>
    ipcRenderer.invoke("file:open"),

  saveFile: data =>
    ipcRenderer.invoke("file:save", data),

  openProject: async () => {
    const project = await ipcRenderer.invoke("project:open");

    if (!project) return null;

    await ipcRenderer.invoke("project:authorize", project.path);

    return project;
  },

  readDirectory: directory =>
    ipcRenderer.invoke("directory:read", directory),

  readProjectFile: filePath =>
    ipcRenderer.invoke("file:read-project", filePath)
});
