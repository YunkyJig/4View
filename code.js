let threadInput = document.getElementById('thread_url')


threadInput.addEventListener('keyup', async ({key}) => {
    if(key === "Enter") {
        console.log(threadInput.value)
        if(validatedURL(threadInput.value)) {
            const { threadNum, board  } = getThreadAndBoard(threadInput.value)
            // const res = await axios.get(`http://localhost:3001?num=${threadNum}&board=${board}`)
            console.log(`https://a.4cdn.org/${board}/thread/${threadNum}.json`)
            let myHeaders = new Headers()
            myHeaders.append('origin', 'http://boards.4chan.org/')
            const res = await fetch(`https://a.4cdn.org/${board}/thread/${threadNum}.json`, {headers: myHeaders})
            // console.log(res.data)
            const images = getImagesFromApiRes(res.data.posts, board)
            displayImages(images)
        }
        else {
            alert('enter valid url')
        }

        // extract thumbnails
        // display them in grid format
    }
})

const displayImages = (images) => {
    const imageGrid = document.getElementById("image-grid")

    images.forEach(image => {
        imageGrid.append(Image(image))
        imageGrid.append(Buttons())
    })
}

const Image = (image) => {
    let img = document.createElement('img')
    img.src = image.thumbnail.url
    img.height = img.thumbnail.height
    img.width = img.thumbnail.width

    return img
}

const Buttons = () => {
    let buttonContainer = document.createElement('div')
    let previewBtn = document.createElement('button')
    let dlListBtn = document.createElement('button')

    previewBtn.innerText = 'Preview Image'
    previewBtn.onclick = previewBtn
    dlListBtn.innerText = 'Add to dl list'
    dlListBtn.onclick = addToDLList

    buttonContainer.append(previewBtn)
    buttonContainer.append(dlListBtn)
    return buttonContainer
}

const displayPreview = () => {
    console.log('display preview')
}

const addToDLList = () => {
    console.log('add to dllist')
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
    
        return { board, threadNum }
    }
}

const getImagesFromApiRes = (posts, board) => {
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
                }
            }
        })
}

// https://stackoverflow.com/questions/47233479/how-does-twitter-extract-meaningful-subject-colors-from-image-pixel-data