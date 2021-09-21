// comic title
const title = document.querySelector('.title')
// comic titles
const comicTitles = Array.from(document.querySelectorAll('.title'))
// comic images
const comics = Array.from(document.querySelectorAll('img'))
//comic containers
const comicContainers = Array.from(document.querySelectorAll('.comic'))
// page-number para
const pageNum = Array.from(document.querySelectorAll('.page-num'))
// prev btn
const prevBtn = document.querySelector('#prev')
// random btn
const randBtn = document.querySelector('#random')
// next btn
const nextBtn = document.querySelector('#next')
// go btn
const goBtn = document.querySelector('#go-btn')
// dropdown
const displayOptions = document.querySelector('select')
// url
const comicUrl = 'https://intro-to-js-playground.vercel.app/api/xkcd-comics/'
// page
let currentPage = [1,2,3]
// loader
const loader = document.querySelector('.loader')
// alert
const alert = document.querySelector('.alert')

// fetch comic image
// Takes in a page number and calls fetch to get JSON object response
const getComics = async (page) =>  {
    
    const response = await fetch(comicUrl + `${page}`)
    
    return response.json()
}

// display images
// Takes in the array of pages to be displayed
const displayComics = async (pages) => {
    // const loadedPages = []
    const promisedPages = []

    // Hide all comics and set loader to run
    comicContainers.forEach((comic) => comic.hidden = true)
    loader.hidden = false

    // loop through array of page numbers & fetch comic data & push to loadedpages array
    for (page of pages) {
        // comicData = await getComics(page)
        // loadedPages.push(comicData)
        promisedPages.push(getComics(page))
    }

    const loadedPages = await Promise.all(promisedPages)

    // loop through loadedpages array set html elements with respective image/title/alt/pagenum
    for (let i = 0; i < loadedPages.length; i++) {
        comicTitles[i].innerHTML = loadedPages[i].title
        pageNum[i].innerHTML = loadedPages[i].num
        comics[i].src = loadedPages[i].img
        comics[i].alt = loadedPages[i].alt
    }

    // hide loader and show all comics with new data
    loader.hidden = true
    for (let i = 0; i < currentPage.length; i++) {
        comicContainers[i].hidden = false
    }
};

displayComics(currentPage)

// event listeners
// When previous button is clicked
prevBtn.addEventListener('click', async () => {
    await setPages(currentPage, 'prev')
    displayComics(currentPage)
})

// When next button is clicked
nextBtn.addEventListener('click', async () => {
    await setPages(currentPage, 'next')
    displayComics(currentPage)
})

randBtn.addEventListener('click', async () => {
    await setPages(currentPage, 'rand')
    displayComics(currentPage)
})

// When dropdown to select number of comics to display is changed
displayOptions.addEventListener('change', (event) => {
    setPageArrayLength(+event.target.value)
    displayComics(currentPage)
})

// When number is selected in number field
goBtn.addEventListener('click', async () => {
    let value = document.querySelector('.comic-num').value
    
    if (value < 0){
        window.alert('Only positive numbers are allowed')
        return
    }

    await setPages(currentPage, 'jump', +value)
    displayComics(currentPage)
})

// set page numbers
// This function sets the page array to be updated based on button that is clicked
// Takes in the page array, an action and a page number if necessary.
const setPages = async (pageArr, type, num) => {
    //  Get array length
    const n = pageArr.length

    // Get the latest comic page
    const max = await getMaxPage()

    // starting page num to be set
    let startNum
    
    // Starting page number = Current 1st page - Array length
    if (type === 'prev') {  
        startNum = pageArr[0] - n
    }

    // Starting page number = Current 1st page + Array length
    if (type === 'next') {
        startNum = pageArr[0] + n 
    }

    // Starting page number = Page number passed into func - 1
    if (type === 'jump') {
        if (num > max) {
            // showAlert('This comic number does not exist')
            window.alert('This comic number does not exist')
            return
        } else {
            startNum = num - 1
        }
    }

    // Starting page number = random number
    if (type === 'rand') {
        startNum = Math.floor(Math.random() * max)
    }

    // Once starting number has been determined
    setPageArray(startNum, n, max)
}

// set page array length
// This function controls the number of comics that is displayed i.e. array length
// Takes in a number
const setPageArrayLength = async (numComics) => {
    const currLen = currentPage.length
    const diff = currLen - numComics
    const max = await getMaxPage()

    // If num of comics to display is less than current array
    if (diff > 0) {
        for (let i = 0; i < diff; i++) {
            // Remove pages from end of current array
            currentPage.pop()
        }
    }

    // Populate the page numbers in array
    setPageArray(currentPage[0], numComics, max)
}

// Function takes in a starting number, length of array and max number of comics
// Function contains incrementing logic for setting of page array
const setPageArray = (startNum, n, max) => {
    for (let i = 0; i < n; i++) {
        // Default add 1 to start number for the length of the array
        currentPage[i] = startNum + i
        
        // If page to be set is > max page, then page = page - max page (1 = 2500 - 2499)
        if (currentPage[i] > max) {
            currentPage[i] = currentPage[i] - max
        }

        // If page = 0, then page = max page
        if (currentPage[i] === 0) {
            currentPage[i] = max
        }

        // If page < 0, then page = page + max (2495 = -4 + 2499)
        if (currentPage[i] < 0) {
            currentPage[i] = currentPage[i] + max
        }
    }
}

// Get max page
let maxPage
const getMaxPage = async () => {
    if (!maxPage) {
        const latestPage = await getComics('?comic=latest')
        maxPage = latestPage.num
    }

    return maxPage
}