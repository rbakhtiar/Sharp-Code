
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sharp", {
  openFile: () => ipcRenderer.invoke("file:open"),

  saveFile: (data) =>
    ipcRenderer.invoke("file:save", data)
});
