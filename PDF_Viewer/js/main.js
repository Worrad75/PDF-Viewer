const url = "../docs/example_doc_2.pdf";
const wrong_url = "i am wrong"

let pdfDoc = null, 
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 2.0,
    canvas = document.querySelector("#pdf-render"),
    ctx = canvas.getContext('2d');

// render the page
const renderPage = num => {
    pageIsRendering = true;

    pdfDoc.getPage(num).then(page => {
        // set the scale, height and width of the pdf
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // the above canvas parameters to be fed to the page
        const renderCTX = {
            canvasContext: ctx,
            viewport
        }

        //  render the page using the canvas context
        page.render(renderCTX).promise.then(() => {
            pageIsRendering = false;

            // if there is a particular page number it should be rendering instead of the first, render that page instead
            // then reset the variable
            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // set the current page # to whatever was passed in
        document.querySelector('#page-num').textContent = num;
    });
}

// check for pages rendering
const queueRenderPage = num => {
    // check to see if the page is rendering
    if(pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
}

// trigger a rerender for the previous PDF page
const showPrevPage = () => {
    // if its on the first page, do nothing
    if(pageNum <= 1) {
        return;
    }
    // if it isn't, rerender
    console.log("hitting the prev button")
    pageNum--;
    queueRenderPage(pageNum);
}

// trigger a rerender for the next PDF page
const showNextPage = () => {
    // if its on the last page, do nothing
    if(pageNum >= pdfDoc.numPages) {
        return;
    }
    // if it isn't, rerender
    console.log("hitting the next button")
    pageNum++;
    queueRenderPage(pageNum);
}


// get document
// --> pdfjsLib is given by the CDN
//  --> getDocument returns a promise based on the url, which you can extract the pdf from
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    document.querySelector('#page-count').textContent = pdfDoc.numPages;
    renderPage(pageNum)
})
.catch(err => {
    // if there isn't a viable file, let them know
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);
    // hide the top bar
    document.querySelector('.top-bar').style.display = 'none';
});

// eventListeners for clicks on the prev/next buttons
document.querySelector('#prev-page').addEventListener("click", showPrevPage);
document.querySelector('#next-page').addEventListener("click", showNextPage);




// -------- EXPERIMENTS -----------

// on resize, change the dimensions of the canvas. the problem ATM is that in order to get a smooth initial render,
// the canvas height and width are reassigned every time you render, meaning that even after we resize it immediately gets
// overwritten. this feature would be significantly easier to implement in React. Happy trails!

window.addEventListener('resize', resizeCanvas);
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log("hitting resize")

    renderPage(pageNum);
}