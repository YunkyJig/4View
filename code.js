let threadInput = document.getElementById('thread_url')
let currThreadNum = null
let currThreadData = null

// TODO
// update thread images on re-enter

threadInput.addEventListener('keyup', async ({key}) => {
    if(key === "Enter") {
        // reset for new thread for now
        resetGridAndStorage()

        console.log(threadInput.value)
        if(validatedURL(threadInput.value)) {
            const { threadNum, board  } = getThreadAndBoard(threadInput.value)
            console.log(`https://a.4cdn.org/${board}/thread/${threadNum}.json`)
            const res = await fetch(`https://a.4cdn.org/${board}/thread/${threadNum}.json`)
            const data = await res.json()
            const images = getImagesFromApiRes(data.posts, board)

            if(images.length > 0) {
                localStorage.setItem(`${threadNum}threadImages`, JSON.stringify(images))
            }
            displayImages(images)
        }
        else {
            alert('enter valid url')
        }

        // extract thumbnails
        // display them in grid format
    }
})

const resetGridAndStorage = () => {
    const imageGrid = document.getElementById("image-grid")
    imageGrid.replaceChildren()
    localStorage.clear()
}

const displayImages = (images) => {
    const imageGrid = document.getElementById("image-grid")

    images.forEach((image, index) => {
        // console.log(image)
        imageGrid.append(ImageContainer(image, index))
    })
}

const ImageContainer = (image, index) => {
    const imageContainer = document.createElement('div')
    imageContainer.append(Image(image, index))
    imageContainer.append(Buttons(image, index))
    
    imageContainer.classList.add('img-container')
    if(index === 0) {
        imageContainer.classList.add('first-img')
    }

    return imageContainer
}

const Image = (image, index) => {
    // console.log(image.thumbnail.url)
    let img = document.createElement('img')
    // just so people dont see
    img.src = image.thumbnail.url
    img.height = image.thumbnail.height
    img.width = image.thumbnail.width
    img.alt = "post"
    img.loading = "lazy"
    img.referrerPolicy = "no-referrer"
    return img
}

const Buttons = (image, index) => {
    let buttonContainer = document.createElement('div')
    let previewBtn = document.createElement('button')
    let dlListBtn = document.createElement('button')

    previewBtn.innerText = 'Preview Image'
    previewBtn.onclick = () => displayPreview(image)
    dlListBtn.classList.add('dlListBtn')
    dlListBtn.innerText = setBtnInnerText(image, index)
    dlListBtn.onclick = () => updateDLList(dlListBtn, image, index)

    buttonContainer.append(previewBtn)
    buttonContainer.append(dlListBtn)
    return buttonContainer
}

const displayPreview = (img) => {
    console.log(img)
    const body = document.querySelector('body')
    const displayWindow = document.createElement('div')
    displayWindow.classList.add('preview-window')
    
    if(img.ext === ".webm") {
        const vid = document.createElement('video')
        vid.classList.add('img-preview')
        vid.src = img.fullsize.url
        vid.autoplay = true
        vid.controls = true
        vid.loop = true
        displayWindow.append(vid)
    }
    else {
        const image = document.createElement('img')
        image.classList.add('img-preview')
        image.src = img.fullsize.url
        displayWindow.append(image)
    }
    
    const closeBtn = document.createElement('button')
    closeBtn.innerText = 'Close'
    closeBtn.onclick = () => body.removeChild(displayWindow)

    displayWindow.append(closeBtn)
    body.append(displayWindow)
}

const updateDLList = (dlListBtn, image, index) => {
    let currDLList = localStorage.getItem(currThreadNum)
    
    if(!currDLList) {
        localStorage.setItem(currThreadNum, JSON.stringify([{image, index}]))
    }
    else {
        if(dlListBtn.innerText === 'Add to dl list') {
            // console.log('adding')
            currDLList = JSON.parse(currDLList)
            currDLList = currDLList.concat({image, index})
            localStorage.setItem(currThreadNum, JSON.stringify(currDLList))
        }
        else {
            // console.log('removing')
            currDLList = JSON.parse(currDLList)
            currDLList = currDLList.filter(item => item.index !== index)
            localStorage.setItem(currThreadNum, JSON.stringify(currDLList))
        }
    }

    dlListBtn.innerText === 'Add to dl list' ? 
        dlListBtn.innerText = 'Remove from dl list'
        :
        dlListBtn.innerText = 'Add to dl list'

    console.log('add to dllist', image, index)
}

const setBtnInnerText = (image, index) => {
    let currDLList = JSON.parse(localStorage.getItem(currThreadNum))

    if(currDLList) {
        for(let i = 0; i < currDLList.length; ++i) {
            if(currDLList[i].image.thumbnail.url === image.thumbnail.url) {
                return 'Remove from dl list'
            }
        }
    }
    
    return 'Add to dl list'
    
}

const validatedURL = (url) => {
    const chanRegex = /https:\/\/boards\.(4channel|4chan)\.org\/([a-z]+)\/thread\/([0-9]+)/
    const match = url.match(chanRegex)

    return match
}

const getThreadAndBoard = (url) => {
    const chanRegex = /https:\/\/boards\.(4channel|4chan)\.org\/([a-z]+)\/thread\/([0-9]+)/
    const match = url.match(chanRegex)

    if(match) {
        const board = match[2]
        const threadNum = match[3]
        currThreadNum = threadNum
        localStorage.setItem('threadNum', threadNum)
    
        return { board, threadNum }
    }
}

const getImagesFromApiRes = (posts, board) => {
    // posts without image will not have a file name
    return posts.filter(post => post.filename)
        .map(post => {
            return {
                thumbnail: {
                    url: `https://i.4cdn.org/${board}/${post.tim}s.jpg`,
                    width: post.tn_w,
                    height: post.tn_h
                },
                fullsize: {
                    url: `https://i.4cdn.org/${board}/${post.tim}${post.ext}`,
                    width: post.w,
                    height: post.h
                },
                filename: post.tim + post.ext,
                ext: post.ext 
            }
        })
}

window.onload = () => {
    currThreadNum = localStorage.getItem('threadNum')

    if(currThreadNum) {
        const images = JSON.parse(localStorage.getItem(`${currThreadNum}threadImages`))
        displayImages(images)
    }
}