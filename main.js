// DOM Elements
const book = document.querySelector("#book");
const clickHere = document.querySelector("#animated-circle");
const clickPrev = document.querySelector("#animated-circle-left");
const introScreen = document.getElementById('intro-screen');
const introContent = document.getElementById('intro-content');

// Media overlay elements for dynamic videos
const mediaOverlay = document.getElementById('media-overlay');
const dynamicVideo = document.getElementById('dynamic-video');

// Mapping of page numbers to video configuration
// translateX and translateY are in pixels and control positioning

const videosConfig = {
    // Page 38 - diaMuertos
    38: { 
        src: 'Videos/diaMuertos.mp4',
        translateX: '15.5vmin', 
        translateY: '51vmin', 
        width: '26vmin' 
    },
    // Page 36 - yoga
    36: { 
        src: 'Videos/yoga.mp4',
        translateX: '14vmin', 
        translateY: '34vmin' 
    },
    // Page 43 - Multiple videos
    43: [
        { 
            src: 'Videos/ivan.mp4',
            translateX: '51vmin', 
            translateY: '34.5vmin', 
            width: '26.5vmin', 
            maxHeight: '32vmin' 
        },
        { 
            src: 'Videos/flag.mp4',
            translateX: '16.5vmin', 
            translateY: '34.5vmin', 
            width: '27vmin', 
            maxHeight: '15vmin' 
        },
        { 
            src: 'Videos/baile.mp4',
            translateX: '16vmin', 
            translateY: '51.3vmin', 
            width: '30vmin', 
            maxHeight: '15vmin' 
        },
    ],
    // Photo 90 is the back of paper 45, which is page 46
    46: [
        { src: 'Videos/agua_baile.mp4', translateX: '17vmin', translateY: '34.5vmin', width: '26.5vmin', maxHeight: '18vmin' },
        { src: 'Videos/mecanico.mp4', translateX: '50vmin', translateY: '50.5vmin', width: '26.5vmin', maxHeight: '18vmin' },
        { src: 'Videos/baile.mp4', translateX: '99vmin', translateY: '51.1vmin', width: '26.5vmin', maxHeight: '18vmin' },
    ],
    // Photo 91 is the back of paper 45, which is page 47
    49: [
        { src: 'Videos/music.mp4', translateX: '48.5vmin', translateY: '34.7vmin', width: '32.5vmin', height: '30.5vmin' }
    ],
    // Add more pages => {src, translateX, translateY} as needed
};

// Dynamic root margin for lazy loading based on device performance
const dynamicRootMargin = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ? '150px' : '300px';

// Initialize the book
function initBook() { // Show the book
    book.style.display = 'block';

    // Hide the intro screen
    gsap.to(introScreen, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            introScreen.style.display = 'none';
        }
    });

    // Initialize the rest of the book functionality
    createPapers();
    centerAnimatedCircleLeft();
    initEventListeners();
    window.addEventListener('resize', centerAnimatedCircleLeft);
}

// Show introduction animation
function showIntroduction() {
    const text = "Bienvenido al anuario Noordwijk";
    const introText = document.createElement('div');
    introText.className = 'intro-text';
    introContent.appendChild(introText);

    // Split text into characters and wrap each in a span
    const chars = text.split('').map(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        introText.appendChild(span);
        return span;
    });

    // Animate each character
    gsap.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.05,
        delay: 0.5,
        onComplete: () => { // After animation completes, wait 1 second then initialize the book
            setTimeout(initBook, 1000);
        }
    });
}

// Start the introduction when the page loads
window.addEventListener('load', showIntroduction);

// Event listeners are now initialized in initEventListeners()

// Business Logic
let currentLocation = 1;
let numOfPapers = 50;
let maxLocation = numOfPapers + 1;

// Function to preload an image
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

// Function to create a low-quality image path
function getLQIPPath(originalPath) {
    const parts = originalPath.split('.');
    const ext = parts.pop();
    return `${
        parts.join('.')
    }-lq.${ext}`;
}

// Function to create a page with image
function createPageWithImage(pageNumber, isFront) {
    const page = document.createElement("div");
    page.className = isFront ? "front" : "back";

    const content = document.createElement("div");
    content.className = isFront ? "front-content" : "back-content";
    content.id = isFront ? `f${pageNumber}` : `b${pageNumber}`;

    // Calculate image number (1-2 images per page)
    const imgNumber = isFront ? pageNumber * 2 - 1 : pageNumber * 2;
    const imgPath = `Photos/${imgNumber}.png`;
    const lqipPath = getLQIPPath(imgPath);

    // Create image container
    const imgContainer = document.createElement('div');
    imgContainer.className = 'image-container';

    // Create low-quality image placeholder
    const lqip = new Image();
    lqip.src = lqipPath;
    lqip.className = 'lqip';
    lqip.alt = `Loading page ${imgNumber}...`;
    imgContainer.appendChild(lqip);

    // Loading message overlay
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-state';
    loadingText.textContent = 'Cargando...';
    imgContainer.appendChild(loadingText);

    // Create full-quality image (will be loaded when needed)
    const img = new Image();
    img.className = 'full-image';
    img.alt = `Page ${imgNumber}`;
    img.loading = 'lazy';

    // Store image path as data attribute for lazy loading
    img.dataset.src = imgPath;

    // Add loading class
    imgContainer.classList.add('loading');

    // Create intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) { // Load the full image
                    img.src = img.dataset.src;
                    img.onload = () => {
                        imgContainer.classList.add('loaded');
                        imgContainer.classList.remove('loading');
                        loadingText.style.display = 'none';
                    };
                    img.onerror = () => {
                        loadingText.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'placeholder';
                        placeholder.textContent = isFront ? `Front ${pageNumber}` : `Back ${pageNumber}`;
                        imgContainer.innerHTML = '';
                        imgContainer.appendChild(placeholder);
                    };
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: dynamicRootMargin, // Dynamic based on device capability
        threshold: 0.01
    });

    // Observe the image
    observer.observe(img);

    imgContainer.appendChild(img);
    content.appendChild(imgContainer);
    page.appendChild(content);

    // Store observer for cleanup if needed
    page._observer = observer;

    return page;
}

// Create papers dynamically with images
async function createPapers() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const progressText = document.createElement('p');
    loadingOverlay.appendChild(progressText);

    for (let i = 1; i <= numOfPapers; i++) { // Update progress
        progressText.textContent = `Loading page ${i} of ${numOfPapers}...`;

        const paper = document.createElement("div");
        paper.id = `p${i}`;
        paper.className = "paper";
        paper.style.zIndex = numOfPapers - i;

        // Create front page (odd-numbered images: 1, 3, 5, ...)
        const front = await createPageWithImage(i, true);

        // Create back page (even-numbered images: 2, 4, 6, ...)
        const back = await createPageWithImage(i, false);

        paper.appendChild(front);
        paper.appendChild(back);
        book.appendChild(paper);

        // Small delay to prevent UI freezing
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Hide loading overlay when done
    loadingOverlay.classList.add('hidden');
}

// Center the animated circle
function centerAnimatedCircleLeft() {
    const bookHeight = book.offsetHeight;
    clickPrev.style.top = `${
        bookHeight / 2
    }px`;
    clickPrev.style.left = '-82vmin';
    clickPrev.style.transform = 'translateY(-50%)';
}

// Open book transformation
function openBook() {
    book.style.transform = "translateX(50%)";
    adjustButtonTransforms();
}

// Close book transformation
function closeBook(isAtBeginning) {
    book.style.transform = isAtBeginning ? "translateX(0%)" : "translateX(100%)";
}

// Adjust button transformations based on screen size
function adjustButtonTransforms() {
    // This function is kept for compatibility but doesn't need to do anything
    // since we're using the animated circles instead of prev/next buttons
}

// Helper function to update z-indices
function updateZIndices() { // Set all pages to default z-index
    for (let i = 1; i <= numOfPapers; i++) {
        const paper = document.querySelector(`#p${i}`);
        if (paper) {
            paper.style.zIndex = numOfPapers - Math.abs(currentLocation - i);
        }
    }
    // Set the current page to be on top
    const currentPaper = document.querySelector(`#p${currentLocation}`);
    if (currentPaper) {
        currentPaper.style.zIndex = numOfPapers + 1;
    }
}

// Helper: update media (video) visibility for current page
function updateMediaForPage(pageNumber) {
    const config = videosConfig[pageNumber];
    
    // Clear any existing videos
    mediaOverlay.innerHTML = '';
    
    if (config) {
        // Handle array of videos
        const videos = Array.isArray(config) ? config : [config];
        
        videos.forEach(videoConfig => {
            const video = document.createElement('video');
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'auto';
            
            // Use absolute paths for Vercel deployment
            let videoSrc = videoConfig.src;
            // If the path doesn't start with http, make it absolute
            if (!videoSrc.startsWith('http') && !videoSrc.startsWith('/')) {
                videoSrc = '/' + videoSrc;
            }
            video.src = videoSrc;
            
            // Position and size the video
            video.style.position = 'fixed';
            video.style.width = videoConfig.width || '29vmin';
            if (videoConfig.height) {
                video.style.height = videoConfig.height;
            } else if (videoConfig.maxHeight) {
                video.style.maxHeight = videoConfig.maxHeight;
                video.style.height = 'auto';
            }
            video.style.transform = `translate(${videoConfig.translateX}, ${videoConfig.translateY})`;
            video.style.objectFit = 'cover';
            video.style.objectPosition = 'top 20%';
            video.style.borderRadius = '0';
            video.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
            video.style.zIndex = '1000'; // Ensure videos appear above other elements
            
            // Add loading state
            const loadingDiv = document.createElement('div');
            loadingDiv.textContent = 'Loading video...';
            loadingDiv.style.color = 'white';
            loadingDiv.style.position = 'fixed';
            loadingDiv.style.transform = video.style.transform;
            loadingDiv.style.pointerEvents = 'none';
            loadingDiv.style.zIndex = '1001';
            
            // Add error handling
            video.onerror = function() {
                console.error('Error loading video:', videoSrc);
                loadingDiv.textContent = 'Error loading video';
                loadingDiv.style.color = 'red';
            };
            
            video.onloadeddata = function() {
                loadingDiv.style.display = 'none';
                video.play().catch(error => {
                    console.error('Error playing video:', videoSrc, error);
                    loadingDiv.textContent = 'Error playing video';
                    loadingDiv.style.color = 'orange';
                });
            };
            
            // Create a container for the video and loading indicator
            const container = document.createElement('div');
            container.style.position = 'relative';
            container.style.display = 'inline-block';
            container.appendChild(video);
            container.appendChild(loadingDiv);
            
            mediaOverlay.appendChild(container);
        });
        
        mediaOverlay.style.display = 'block';
    } else {
        mediaOverlay.style.display = 'none';
    }
}

// Preload images for pages adjacent to the current one
function preloadAdjacentPages() {
    const pagesToPreload = [currentLocation - 1, currentLocation + 1];
    pagesToPreload.forEach(pageNum => {
        if (pageNum < 1 || pageNum >= maxLocation) return;
        const pageEl = document.querySelector(`#p${pageNum}`);
        if (!pageEl) return;
        pageEl.querySelectorAll('.full-image').forEach(img => {
            if (img.dataset && img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    });
}

// Navigate to the next page
function goNextPage() {
    if (currentLocation < maxLocation) {
        const currentPaper = document.querySelector(`#p${currentLocation}`);
        if (currentPaper) { // Flip the current page
            currentPaper.classList.add("flipped");

            // Update the book state
            if (currentLocation === 1) 
                openBook();
             else if (currentLocation === numOfPapers) 
                closeBook(false);
            

            // Move to the next page
            currentLocation++;

            // Update z-indices for all pages
            updateZIndices();
            // Update media overlay for the new page
            updateMediaForPage(currentLocation);
            preloadAdjacentPages();
        }
    }
}

// Navigate to the previous page
function goPrevPage() {
    if (currentLocation > 1) { // First, update the current location before changing UI
        const wasAtEnd = currentLocation === maxLocation;
        currentLocation--;

        // Update the book state
        if (currentLocation === 1) {
            closeBook(true);
        } else if (wasAtEnd) { // If we were at the end, open the book when going back
            openBook();
        }

        // Remove the flipped class from the previous page
        const prevPaper = document.querySelector(`#p${currentLocation}`);
        if (prevPaper) {
            prevPaper.classList.remove("flipped");
        }

        // Update z-indices for all pages
        updateZIndices();
        // Update media overlay for the new page
        updateMediaForPage(currentLocation);
            preloadAdjacentPages();
    }
}

// Initialize event listeners after the book is ready
function initEventListeners() {
    clickHere.addEventListener("click", () => {
        goNextPage();
        centerAnimatedCircleLeft();
    });

    clickPrev.addEventListener("click", () => {
        goPrevPage();
        centerAnimatedCircleLeft();
    });

    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case '1': window.goToPage(1);
                break;
            case 'l': window.goToPage(numOfPapers);
                break;
        }
    });
}

// Make goToPage function globally accessible
window.goToPage = function(pageNumber) {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > maxLocation - 1) pageNumber = maxLocation - 1;
    
    // Calculate how many pages to move
    const pagesToMove = pageNumber - currentLocation;
    
    if (pagesToMove > 0) {
        // Go forward
        for (let i = 0; i < pagesToMove; i++) {
            if (currentLocation < maxLocation - 1) {
                goNextPage();
            }
        }
    } else if (pagesToMove < 0) {
        // Go backward
        for (let i = 0; i < -pagesToMove; i++) {
            if (currentLocation > 1) {
                goPrevPage();
            }
        }
    }
    
    updateMediaForPage(pageNumber);
    console.log(`Navigated to page ${pageNumber}`);
}
