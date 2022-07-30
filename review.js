const dlList = JSON.parse(localStorage.getItem(localStorage.getItem('threadNum')))
const folder_inputs = document.getElementsByClassName('folder-input')[0]
const main = document.getElementsByTagName('main')[0]

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function addTag(tagContainer, { key }, filename) {
  if(key === 'Enter') {
      let newTag = makeTag(null, tagContainer, filename)
      newTag.focus()
  }
}

function makeTag(tag, tagContainer, filename) {
  // console.log(tagContainer)
  let tagID = tag ? tag.id : uuidv4()
  // console.log(tagID)
  let tagInput = document.createElement('input')
  tagInput.type = 'text'
  tagInput.placeholder = 'Tag'
  tagInput.classList.add('tag')
  tagInput.value = tag ? tag.value : ''
  tagInput.onkeyup = (e) => addTag(tagContainer, e, filename)
  tagInput.oninput = (e) => handleTagInput(e.target.value, filename, tagID)
  tagContainer.append(tagInput)
  return tagInput
}

// could make this a map or something else
function handleTagInput(value, filename, tagID) {
  const dlList = JSON.parse(localStorage.getItem(localStorage.getItem('threadNum')))
  const updatedList = dlList.map(item => {
    if(item.image.filename === filename) {
      // create tags array if one doesn't exist already
      if(item.image.tags) {
        // console.log('tags', tagID, item.image.tags, item.image.tags.find(tag => tag.id === tagID))
        if(item.image.tags.find(tag => tag.id === tagID)) {
          item.image.tags = item.image.tags.map(tag => tag.id === tagID ? {...tag, value} : tag)
        }
        else {
          item.image.tags.push({id: tagID, value})
        }
      }
      else {
        item.image.tags = [{id: tagID, value}]
      }
    }
    return item
  })
  localStorage.setItem(localStorage.getItem('threadNum'), JSON.stringify(updatedList))
}

const addSaveBtn = () => {
  let saveBtn = document.createElement('button')
  saveBtn.id = 'save-btn'
  saveBtn.innerText = 'Save images'

  saveBtn.addEventListener('click', async () => {
    const paths = document.getElementsByClassName('folder-path')
  
    dlList.forEach((item, i) => {
      console.log(item)
      if(item.image.tags) {
        window.fileAPI.saveExifFile(item.image, paths[i].value)
      }
      else {
        window.fileAPI.saveFile(item.image.fullsize.url, item.image.filename, paths[i].value)
      }
    })
    console.log('saving images')
  })
  main.append(saveBtn)
}

const handleFolderPathChange = (folderPath, filename) => {
  console.log(folderPath, filename)
  const dlList = JSON.parse(localStorage.getItem(localStorage.getItem('threadNum')))
  const updatedList = dlList.map(item => {
    if(item.image.filename === filename) {
        item.image.savePath = folderPath
    }
    return item
  })
  localStorage.setItem(localStorage.getItem('threadNum'), JSON.stringify(updatedList))
}

// add button to add another image container. can use this logic for the final result

// https://stackoverflow.com/questions/36152857/how-to-get-folder-path-using-electron
// save prev folder paths in array for user to choose from

// maybe grey out link to dllist when empty
if(dlList && dlList.length > 0) {
    dlList.forEach(item => {
        console.log(item)
        let imgContainer = document.createElement('div')
        imgContainer.classList.add('img-container')
    
        let img = document.createElement('img')
        img.src = item.image.thumbnail.url

        let saveContainer = document.createElement('div')
        saveContainer.classList.add('save-location-container')
        
        let folderPathInput = document.createElement('input')
        folderPathInput.classList.add('folder-path')
        folderPathInput.placeholder = 'File path'
        folderPathInput.type = 'text'
        folderPathInput.value = item.image.savePath ? item.image.savePath : ''
        folderPathInput.oninput = (e) => handleFolderPathChange(e.target.value, item.image.filename)
        
        let folderBtn = document.createElement('button')
        folderBtn.classList.add('folder-btn')
        folderBtn.innerText = 'Select save folder'
        folderBtn.addEventListener('click', async () => {
          const folderPath = await window.electronAPI.openFolder()
          folderPathInput.value = folderPath
          handleFolderPathChange(folderPath, item.image.filename)
        })

        saveContainer.append(folderPathInput)
        saveContainer.append(folderBtn)
    
        imgContainer.append(img)
        imgContainer.append(saveContainer)
        console.log(item.image.ext)
        if(item.image.ext === '.jpg' || item.image.ext === '.jpeg') {
          let tagContainer = document.createElement('div')
          tagContainer.classList.add('tag-container')

          if(item.image.tags) {
            item.image.tags.forEach(tag => {
              makeTag(tag, tagContainer, item.image.filename)
            })
          }
          else {
            makeTag(null, tagContainer, item.image.filename)
          }

          imgContainer.append(tagContainer)
        }
        main.append(imgContainer)
    })

    addSaveBtn()
}
console.log(dlList)