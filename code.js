let threadInput = document.getElementById('thread_url')

threadInput.addEventListener('keyup', async ({key}) => {
    if(key === "Enter") {
        console.log(threadInput.value)
        if(validatedURL(threadInput.value)) {
            const { threadNum, board  } = getThreadAndBoard(url)
            const res = await axios.get(`http://localhost:3001?num=${threadNum}&board=${board}`)
            // console.log(res.data)
            const images = helper.getImagesFromApiRes(res.data.posts, board)
        }
        else {
            alert('enter valid url')
        }

        // extract thumbnails
        // display them in grid format
    }
})

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