"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron/preload.ts
var preload_exports = {};
module.exports = __toCommonJS(preload_exports);
var { contextBridge, ipcRenderer } = require("electron");
var electronAPI = {
  writeFiles: (projectName, files) => ipcRenderer.invoke("runner:writeFiles", projectName, files),
  npmInstall: (projectName) => ipcRenderer.invoke("runner:npmInstall", projectName),
  startServer: (projectName) => ipcRenderer.invoke("runner:startServer", projectName),
  stopServer: () => ipcRenderer.invoke("runner:stopServer"),
  getStatus: () => ipcRenderer.invoke("runner:getStatus"),
  listProjects: () => ipcRenderer.invoke("project:list"),
  deleteProject: (projectName) => ipcRenderer.invoke("project:delete", projectName),
  openProject: (projectName) => ipcRenderer.invoke("project:open", projectName),
  isElectron: () => ipcRenderer.invoke("isElectron"),
  onLog: (callback) => {
    const handler = (_event, log) => callback(log);
    ipcRenderer.on("runner:log", handler);
    return () => ipcRenderer.removeListener("runner:log", handler);
  },
  onProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on("runner:progress", handler);
    return () => ipcRenderer.removeListener("runner:progress", handler);
  },
  onServerReady: (callback) => {
    const handler = (_event, url) => callback(url);
    ipcRenderer.on("runner:serverReady", handler);
    return () => ipcRenderer.removeListener("runner:serverReady", handler);
  },
  onLogEntry: (callback) => {
    const handler = (_event, entry) => callback(entry);
    ipcRenderer.on("logger:entry", handler);
    return () => ipcRenderer.removeListener("logger:entry", handler);
  },
  getLogs: (count) => ipcRenderer.invoke("logger:getLogs", count),
  getLogFile: () => ipcRenderer.invoke("logger:getLogFile"),
  setLogLevel: (level) => ipcRenderer.invoke("logger:setLevel", level),
  npmCacheGetStats: () => ipcRenderer.invoke("npmCache:getStats"),
  npmCacheHasPackage: (packageName) => ipcRenderer.invoke("npmCache:hasPackage", packageName),
  npmCacheGetPath: () => ipcRenderer.invoke("npmCache:getCachePath"),
  npmCacheIsReady: () => ipcRenderer.invoke("npmCache:isReady")
};
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
//# sourceMappingURL=preload.js.map
