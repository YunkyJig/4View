let threadInput = document.getElementById('thread_url')

threadInput.addEventListener('keyup', async ({key}) => {
    if(key === "Enter") {
        console.log(threadInput.value)
        const apiRes = await fetch('apilink')

        // extract thumbnails
        // display them in grid format
    }
})

// https://stackoverflow.com/questions/47233479/how-does-twitter-extract-meaningful-subject-colors-from-image-pixel-data