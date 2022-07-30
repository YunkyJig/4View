const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const {session} = require('electron')
const path = require('path')

async function handleFolderOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
}

const createWindow = () => {
  // preload has to be absolute path

  const win = new BrowserWindow({
    width: 1000,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:openFolder', handleFolderOpen)
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('quit', () => {
  session.defaultSession.clearStorageData()
  console.log('quiting')
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})