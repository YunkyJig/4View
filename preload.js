const { contextBridge, ipcRenderer } = require('electron')
const http = require('http')
const fetch = require('node-fetch')
const {createWriteStream} = require('node:fs');
const {pipeline} = require('node:stream');
const {Buffer} = require('node:buffer');
const {promisify} = require('node:util');
let { fstat, writeFile } = require('fs');
const piexif = require('./piexif')

const streamPipeline = promisify(pipeline);
writeFile = promisify(writeFile);


const saveFile = async (url, filename, folder) => {
  console.log('folder', folder)
  const response = await fetch(url);  
  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
  await streamPipeline(response.body, createWriteStream(folder + `\\${filename}`));
}

const saveExifFile = async (image, folder='C:\\Users\\dimit\\Downloads') => {
  const res = await fetch(image.fullsize.url)
  let buffer = await res.buffer();
  buffer = 'data:image/jpeg;base64,' + buffer.toString('base64');
 
  var zeroth = {};
  var exif = {};
  var gps = {};
  zeroth[piexif.ImageIFD.Make] = "Make";
  zeroth[piexif.ImageIFD.XPKeywords] = getTags(image.tags)
  zeroth[piexif.ImageIFD.Software] = "Piexifjs";
  var exifObj = {"0th":zeroth, "Exif":exif, "GPS":gps};
  var exifStr = piexif.dump(exifObj);

  var base64Data = piexif.insert(exifStr, buffer);
  // creating a new buffer from the newly inserted jpeg
  buffer = Buffer.from(base64Data.split(",")[1], 'base64');
  writeFile(`${folder}\\${image.filename}`, buffer)    
}

const getTags = (tags) => {
  let tagVals = []

  tags = tags.filter(tag => tag.value !== '')

  tags.forEach((tag, index)=> {
      const tagVal = tag.value
      console.log('tag value', tagVal)

      for(let i = 0; i < tagVal.length; ++i) {
          tagVals.push(tagVal.at(i).charCodeAt(0))
          tagVals.push(0)
      }

      console.log('index', index, tags.length)
      if(index === tags.length - 1) {
          // need to have 3 zeros at the end of the byte array
          tagVals.push(0)
          tagVals.push(0)
      }
      else {
          // pushing ';'. needed to separate tags
          tagVals.push(59)
          tagVals.push(0)
      }                
  })

  console.log(tagVals)
  return tagVals
}

contextBridge.exposeInMainWorld('electronAPI', {
  openFolder: () => ipcRenderer.invoke('dialog:openFolder')
})

contextBridge.exposeInMainWorld('fileAPI', {
  saveFile,
  saveExifFile
})
