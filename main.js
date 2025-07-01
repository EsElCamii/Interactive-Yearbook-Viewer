// DOM Elements
const book = document.querySelector("#book");
const clickHere = document.querySelector("#animated-circle");
const clickPrev = document.querySelector("#animated-circle-left");
const introScreen = document.getElementById('intro-screen');
const introContent = document.getElementById('intro-content');

// Initialize the book
function initBook() {
    // Show the book
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
        onComplete: () => {
            // After animation completes, wait 1 second then initialize the book
            setTimeout(initBook, 1000);
        }
    });
}

// Start the introduction when the page loads
window.addEventListener('load', showIntroduction);

// Event listeners are now initialized in initEventListeners()

// Business Logic
let currentLocation = 1;
let numOfPapers = 47;
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

// Function to create a page with image
async function createPageWithImage(pageNumber, isFront) {
  const page = document.createElement("div");
  page.className = isFront ? "front" : "back";
  
  const content = document.createElement("div");
  content.className = isFront ? "front-content" : "back-content";
  content.id = isFront ? `f${pageNumber}` : `b${pageNumber}`;
  
  // Calculate image number (1-2 images per page)
  const imgNumber = isFront ? pageNumber * 2 - 1 : pageNumber * 2;
  const imgPath = `Photos/${imgNumber}.png`;
  
  // Create image element
  const img = document.createElement("img");
  img.alt = `Page ${imgNumber}`;
  
  // Show loading state
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-state';
  loadingDiv.textContent = 'Loading...';
  content.appendChild(loadingDiv);
  
  // Preload image
  const loadedImg = await preloadImage(imgPath);
  
  // Remove loading state
  content.removeChild(loadingDiv);
  
  if (loadedImg) {
    img.src = imgPath;
    content.appendChild(img);
  } else {
    // If image doesn't exist, show a placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    placeholder.textContent = isFront ? `Front ${pageNumber}` : `Back ${pageNumber}`;
    content.appendChild(placeholder);
  }
  
  // Append content to page
  page.appendChild(content);
  return page;
}

// Create papers dynamically with images
async function createPapers() {
  const loadingOverlay = document.getElementById('loading-overlay');
  const progressText = document.createElement('p');
  loadingOverlay.appendChild(progressText);
  
  for (let i = 1; i <= numOfPapers; i++) {
    // Update progress
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
  clickPrev.style.top = `${bookHeight / 2}px`;
  clickPrev.style.left = '-64vmin';
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

// Navigate to the next page
function goNextPage() {
  if (currentLocation < maxLocation) {
    const currentPaper = document.querySelector(`#p${currentLocation}`);
    if (currentPaper) {
      // Update the current page
      currentPaper.classList.add("flipped");
      currentPaper.style.zIndex = currentLocation;

      // Update the book state
      if (currentLocation === 1) openBook();
      else if (currentLocation === numOfPapers) closeBook(false);

      // Move to the next page
      currentLocation++;
      
      // Update z-index of the new current page to be on top
      const nextPaper = document.querySelector(`#p${currentLocation}`);
      if (nextPaper) {
        nextPaper.style.zIndex = numOfPapers + 1;
      }
    }
  }
}

// Navigate to the previous page
function goPrevPage() {
  if (currentLocation > 1) {
    const prevPaper = document.querySelector(`#p${currentLocation - 1}`);
    if (prevPaper) {
      // Remove the flipped class to show the previous page
      prevPaper.classList.remove("flipped");
      
      // Set a proper z-index for the previous page
      prevPaper.style.zIndex = numOfPapers;
      
      // Update the book state
      if (currentLocation === 2) closeBook(true);
      else if (currentLocation === numOfPapers + 1) book.style.transform = "translateX(50%)";

      // Decrement the current location after updating the UI
      currentLocation--;
      
      // Reset z-index of the next page to be behind
      const currentPaper = document.querySelector(`#p${currentLocation + 1}`);
      if (currentPaper) {
        currentPaper.style.zIndex = currentLocation + 1;
      }
    }
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
            case '1':
                goToPage(1);
                break;
            case 'l':
                goToPage(numOfPapers);
                break;
        }
    });
}



function goToPage(pageNumber) {
  while (currentLocation > pageNumber) goPrevPage();
  while (currentLocation < pageNumber) goNextPage();
}

