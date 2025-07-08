// DOM Elements
// Global variables
const book = document.querySelector("#book");
const clickHere = document.querySelector("#animated-circle");
const clickPrev = document.querySelector("#animated-circle-left");
const introScreen = document.getElementById('intro-screen');

// Overlay configuration - maps page numbers to their overlay image URLs

// ───────────────
// If your overlay shows
//   • 1 paper too early, set to +1
//   • 1 paper too late,  set to -1
//   • perfectly aligned, set to  0
// ───────────────
const PAPER_INDEX_OFFSET = -1;

const OVERLAY_CONFIG = [
  { page: 70, url: 'https://i.ibb.co/cK6dSYLQ/100.png' },
  { page: 74, url: 'https://i.ibb.co/7NY8ZwKf/101.png' },
  { page: 84, url: 'https://i.ibb.co/g1Fffpb/84.png' },
  { page: 88, url: 'https://i.ibb.co/XZQwskLy/88.png' },
  { page: 90, url: 'https://i.ibb.co/Cp5ShJ7v/102.png' },
  { page: 96, url: 'https://i.ibb.co/m5370p26/103.png' }
];

// Update overlay based on paper index (1-based)
function updateOverlay(paperIndex) {
  // apply our tweakable offset here:
  const idx = parseInt(paperIndex, 10) + PAPER_INDEX_OFFSET;
  const frontPage = idx * 2 - 1;
  const backPage = idx * 2;

  // Find if either of those real book-pages is in your config
  const cfg = OVERLAY_CONFIG.find(c => c.page === frontPage || c.page === backPage);
  const cont = document.getElementById('overlay-container');
  if (!cont) return;

  if (!cfg) {
    cont.style.display = 'none';
    return;
  }

  // Set the correct image
  cont.style.backgroundImage = `url('${cfg.url}')`;

  // Enhanced mobile detection
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSmallViewport = window.innerWidth <= 1024; // Increased breakpoint to catch tablets in landscape
  const isPortrait = window.innerHeight > window.innerWidth;
  
  // Consider it mobile if it's a mobile device OR if the viewport is small
  const isMobile = isMobileDevice || isSmallViewport;
  
  // Log detection for debugging
  console.log('Device:', {
    userAgent: navigator.userAgent,
    isMobileDevice,
    isSmallViewport,
    isPortrait,
    resolution: `${window.innerWidth}x${window.innerHeight}`,
    finalIsMobile: isMobile
  });
  
  // Reset all styles
  cont.style.cssText = '';
  
  if (isMobile) {
    // Mobile styles
    const mobileStyles = {
      backgroundImage: `url('${cfg.url}')`,
      position: 'fixed',
      width: '50%',
      height: '50%',
      transform: 'translate(-62.3vmin, 0vmin)',
      pointerEvents: 'none',
      zIndex: '10000',
      overflow: 'visible',
      display: 'block',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center'
    };
    
    // Apply scale separately as it needs to be set after transform in some browsers
    Object.assign(cont.style, mobileStyles);
    cont.style.scale = '0.66';
  } else {
    // Desktop styles
    const desktopStyles = {
      backgroundImage: `url('${cfg.url}')`,
      position: 'fixed',
      width: '50%',
      height: '50%',
      transform: 'translate(-46.2vmin, 0)',
      pointerEvents: 'none',
      zIndex: '10000',
      overflow: 'visible',
      display: 'block',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center'
    };
    
    // Apply scale separately as it needs to be set after transform in some browsers
    Object.assign(cont.style, desktopStyles);
    cont.style.scale = '0.89';
  }

  // Overlay updated for page
}

// Initialize everything in the correct order
async function init() {
  // Create overlay container if it doesn't exist
  if (!document.getElementById('overlay-container')) {
    const container = document.createElement('div');
    container.id = 'overlay-container';
    document.body.appendChild(container);
  }
  
  // Wait for the book to be fully initialized
  await new Promise(resolve => {
    const checkInitialized = () => {
      if (typeof currentLocation !== 'undefined' && document.readyState === 'complete') {
        // Book initialized
        resolve();
      } else {
        setTimeout(checkInitialized, 100);
      }
    };
    checkInitialized();
  });
  
  // Initial overlay update after book loads
  if (typeof currentLocation !== 'undefined') {
    // Initial overlay call
    // Use the same timing as page flip for consistency
    const paperIndex = Math.ceil(currentLocation / 2);
    const paperEl = document.getElementById(`p${paperIndex}`);
    
    if (paperEl) {
      paperEl.addEventListener('transitionend', () => {
        updateOverlay(currentLocation);
      }, { once: true });
    } else {
      // Fallback if paper element not found
      console.warn('Initial paper element not found, using timeout fallback');
      setTimeout(() => updateOverlay(currentLocation), 800);
    }
  }
}

// Wrap goToPage to update overlay after page flip animation completes
const originalGoToPage = window.goToPage;
window.goToPage = function(pageNum) {
  const result = originalGoToPage.apply(this, arguments);

  // Compute which paper we're turning to
  const paperIndex = Math.ceil(pageNum / 2);
  const paperEl = document.getElementById(`p${paperIndex}`);
  
  if (paperEl) {
    // Wait for the flip animation to complete
    const handleTransitionEnd = () => {
      paperEl.removeEventListener('transitionend', handleTransitionEnd);
      updateOverlay(pageNum);
    };
    paperEl.addEventListener('transitionend', handleTransitionEnd, { once: true });
  } else {
    // Fallback if paper element not found
    console.warn(`Paper element p${paperIndex} not found, using timeout fallback`);
    setTimeout(() => updateOverlay(pageNum), 800);
  }

  return result;
};

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
// Also reinitialize on window load to catch any late-loading resources
window.addEventListener('load', () => {
    // Window loaded
    if (typeof currentLocation !== 'undefined') {
        updateOverlay(currentLocation);
    }
});

const introContent = document.getElementById('intro-content');

// Media overlay elements for dynamic videos
const mediaOverlay = document.getElementById('media-overlay');
const dynamicVideo = document.getElementById('dynamic-video');

// Mapping of page numbers to video configuration
// translateX and translateY are in pixels and control positioning

const videosConfig = {
  // Page 38 - diaMuertos
  38: {
    src: '/Videos/diaMuertos.mp4',
    translateX: '15.5vmin',
    translateY: '51vmin',
    width: '26vmin',
    mobile: {
      transform: 'translate(40.6vmin, 51vmin)',
      width: '22vmin',
      height: '12vmin',
      objectFit: 'cover'
    },
    playsInline: true,
    muted: true,
    loop: true
  },

  // Page 36 - yoga
  36: {
    src: 'Videos/yoga.mp4',
    translateX: '14vmin',
    translateY: '33vmin',
        // Mobile-specific overrides
    mobile: {
      transform: 'translate(36.8vmin, 34.5vmin) scale(0.835)',
      width: '29.5vmin',
      height: '31vmin'
    },
    playsInline: true,
    muted: true,
    loop: true
  },

  // Page 43 - Multiple videos
  43: [
    {
      src: '/Videos/baile.mp4',
      translateX: '16vmin',
      translateY: '51vmin',
      width: '30vmin',
      maxHeight: '15vmin',
      mobile: {
        transform: 'translate(41vmin, 16vmin)',
        width: '24vmin',
        height: '12vmin'
      },
      playsInline: true,
      muted: true,
      loop: true
    },
    {
      src: '/Videos/flag.mp4',
      translateX: '16.5vmin',
      translateY: '34vmin',
      width: '27vmin',
      maxHeight: '15vmin',
      mobile: {
        transform: 'translate(17.2vmin, 30vmin)',
        width: '24vmin',
        height: '12vmin'
      },
      playsInline: true,
      muted: true,
      loop: true
    },
    {
      src: '/Videos/ivan.mp4',
      translateX: '51vmin',
      translateY: '34.8vmin',
      width: '26.5vmin',
      maxHeight: '31vmin',
            // Mobile-specific overrides
      mobile: {
        transform: 'scale(0.835) translate(24.6vmin, 40vmin)',
        width: '28vmin',
      },
      playsInline: true,
      muted: true,
      loop: true
    }
  ],

  // Photo 90 is the back of paper 45, which is page 46
  46: [
    {
      src: 'Videos/agua_baile.mp4',
      translateX: '17vmin',
      translateY: '34vmin',
      width: '26.5vmin',
      maxHeight: '18vmin',
      mobile: {
        transform: 'translate(41.6vmin, 34vmin)',
        width: '22.5vmin',
        height: '14vmin'
      }
    },
    {
      src: 'Videos/mecanico.mp4',
      translateX: '50.2vmin',
      translateY: '51vmin',
      width: '26.5vmin',
      maxHeight: '18vmin',
      mobile: {
        transform: 'scale(0.835) translate(54.3vmin, 59vmin)',
        width: '27vmin',
        height: '15vmin'
      }
    }
  ],

  // Photo 91 is the back of paper 45, which is page 47
  49: [
    {
      src: 'Videos/music.mp4',
      translateX: '48.5vmin',
      translateY: '34.7vmin',
      width: '32.5vmin',
      height: '30.5vmin',
      mobile: {
        translateX: '71.6vmin',
        translateY: '37vmin',
        width: '28vmin',
        height: '26vmin',
        scale: '1'
      },
      playsInline: true,
      muted: true,
      loop: true
    }
  ]
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

// Function to preload an image with controlled loading
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // Add a small delay to simulate loading
            setTimeout(() => {
                resolve(img);
            }, 500); // Adjust this delay as needed
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
    });
}

// Function to create a low-quality image path
function getLQIPPath(originalPath) {
    const parts = originalPath.split('.');
    const ext = parts.pop();
    return `${parts.join('.')}-lq.${ext}`;
}

// Loading state management
let loadingImages = new Set();
let failedImages = new Set();

function updateLoadingState(imgContainer, isLoading) {
    const loadingText = imgContainer.querySelector('.loading-state');
    if (isLoading) {
        loadingText.style.display = 'block';
        loadingText.textContent = 'Cargando...';
    } else {
        loadingText.style.display = 'none';
    }
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

    // Show a small "Loading..." text in the grey box
    const loadingState = document.createElement('div');
    loadingState.className = 'loading-state';
    loadingState.textContent = 'Loading…';
    imgContainer.appendChild(loadingState);
    updateLoadingState(imgContainer, true);

    // Create the image element
    const img = new Image();
    img.className = 'full-image';
    img.alt = `Page ${imgNumber}`;
    img.loading = 'lazy';

    // Store image path as data attribute for lazy loading
    img.dataset.src = imgPath;

    // Add loading class
    imgContainer.classList.add('loading');
    
    // Update the overlay for this page if needed
    updateOverlay(pageNumber);

    // Image load and error handlers
    img.onload = () => {
        imgContainer.classList.add('loaded');
        imgContainer.classList.remove('loading');
        updateLoadingState(imgContainer, false);
    };

    img.onerror = () => {
        updateLoadingState(imgContainer, false);
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        placeholder.textContent = isFront ? `Front ${pageNumber}` : `Back ${pageNumber}`;
        imgContainer.innerHTML = '';
        imgContainer.appendChild(placeholder);
    };

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

    // Hide loading overlay after a short delay to ensure all pages are rendered
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
    }, 200);
}

// Center the animated circle
function centerAnimatedCircleLeft() {
    const bookHeight = book.offsetHeight;
    clickPrev.style.top = `${bookHeight / 2}px`;
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
            // Create video element
            const video = document.createElement('video');
            
            // Set video attributes
            video.playsInline = true;
            video.muted = true;
            video.preload = 'auto';
            video.loop = videoConfig.loop || false;
            video.autoplay = true;
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.setAttribute('x5-playsinline', '');
            video.setAttribute('muted', '');
            
            // Set video source - using absolute path
            video.src = videoConfig.src;
            // Loading video
            
            // Enhanced mobile detection
            const detectMobile = () => {
                // Check viewport width first (faster)
                const isSmallScreen = window.innerWidth <= 1024 || 
                                    window.innerHeight <= 844; // Your phone's height
                
                if (!isSmallScreen) return false;
                
                // Check user agent for additional confirmation
                const userAgent = navigator.userAgent || navigator.vendor || window.opera;
                const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
                
                // For testing: Force mobile in development
                // return true;
                
                return isMobileUserAgent || window.innerWidth <= 1024;
            };
            
            const isMobileDevice = detectMobile();
            
            // Debug logging
            console.log('Device Info:', {
                isMobile: isMobileDevice,
                width: window.innerWidth,
                height: window.innerHeight,
                userAgent: navigator.userAgent
            });
            
            // Save the source before resetting styles
            const videoSrc = video.src;
            
            // Reset styles while preserving source
            video.style.cssText = '';
            video.src = videoSrc;
            
            // Function to apply styles with important flags
            const applyStyles = (element, styles) => {
                Object.entries(styles).forEach(([prop, value]) => {
                    if (value !== undefined && value !== null) {
                        element.style.setProperty(prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase()), value, 'important');
                    }
                });
            };
            
            if (isMobileDevice && videoConfig.mobile) {
                // Mobile styles - use video-specific mobile config
                const mobileConfig = videoConfig.mobile;
                
                // Debug log the mobile config
                console.log('Mobile config for video:', {
                    src: videoConfig.src,
                    config: mobileConfig
                });
                
                // Start with an empty styles object
                const mobileStyles = {};
                
                // If transform is explicitly set, use it as-is
                if (mobileConfig.transform) {
                    mobileStyles.transform = mobileConfig.transform;
                } 
                // Otherwise, build transform from individual properties
                else {
                    const transformParts = [];
                    
                    // Add translate if X or Y is specified
                    if (mobileConfig.translateX !== undefined || mobileConfig.translateY !== undefined) {
                        const x = mobileConfig.translateX || '0';
                        const y = mobileConfig.translateY || '0';
                        transformParts.push(`translate(${x}, ${y})`);
                    }
                    
                    // Add scale if specified
                    if (mobileConfig.scale) {
                        transformParts.push(`scale(${mobileConfig.scale})`);
                    }
                    
                    // Combine all transform parts
                    if (transformParts.length > 0) {
                        mobileStyles.transform = transformParts.join(' ');
                    }
                }
                
                // Copy all other properties
                Object.keys(mobileConfig).forEach(key => {
                    if (!['translateX', 'translateY', 'transform', 'scale'].includes(key)) {
                        mobileStyles[key] = mobileConfig[key];
                    }
                });
                
                // Debug log the styles being applied
                console.log('Applying mobile styles:', mobileStyles);
                
                // Apply base styles
                applyStyles(video, mobileStyles);
                
                // Log applied styles for debugging
                console.log('Applied mobile styles to video:', {
                    src: videoConfig.src,
                    styles: mobileStyles,
                    scale: mobileConfig.scale
                });
                
                // Make the style object non-writable to prevent overrides
                Object.defineProperty(video, 'style', {
                    value: video.style,
                    writable: false
                });
            } else {
                // Desktop styles - apply all at once
                const desktopStyles = {
                    position: 'fixed',
                    width: videoConfig.width || '29vmin',
                    transform: `translate(${videoConfig.translateX}, ${videoConfig.translateY})`,
                    objectFit: 'cover',
                    objectPosition: 'top 20%',
                    borderRadius: '0',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
                    zIndex: videoConfig.zIndex || '1000',
                    display: 'block'
                };
                
                if (videoConfig.height) {
                    desktopStyles.height = videoConfig.height;
                } else if (videoConfig.maxHeight) {
                    desktopStyles.maxHeight = videoConfig.maxHeight;
                    desktopStyles.height = 'auto';
                }
                
                Object.assign(video.style, desktopStyles);
            }
            
            // Try to play the video when loaded
            video.onloadeddata = function() {
                video.play().catch(error => {
                    console.error('Error playing video:', videoConfig.src, error);
                });
            };
            
            // Add video to the overlay
            mediaOverlay.appendChild(video);
        });
        
        mediaOverlay.style.display = 'block';
    } else {
        mediaOverlay.style.display = 'none';
    }
}

// Preload images for pages adjacent to the current one
async function preloadAdjacentPages() {
    const preloadPages = 3; // Number of pages to preload on each side
    const promises = [];

    // Preload next pages
    for (let i = 1; i <= preloadPages; i++) {
        if (currentLocation + i <= numOfPapers) {
            promises.push(
                preloadImage(`Photos/${(currentLocation + i) * 2 - 1}.jpg`),
                preloadImage(`Photos/${(currentLocation + i) * 2}.jpg`)
            );
        }
    }

    // Preload previous pages
    for (let i = 1; i <= preloadPages; i++) {
        if (currentLocation - i >= 1) {
            promises.push(
                preloadImage(`Photos/${(currentLocation - i) * 2 - 1}.jpg`),
                preloadImage(`Photos/${(currentLocation - i) * 2}.jpg`)
            );
        }
    }

    try {
        await Promise.all(promises);
    } catch (error) {
        console.error('Error preloading images:', error);
    }
}

// Clean up all overlays
function cleanupOverlays() {
    document.querySelectorAll('.page-overlay').forEach(overlay => {
        overlay.remove();
    });
    // Cleaned up overlays
}

// Navigate to the next page
function goNextPage() {
    if (currentLocation < numOfPapers) {
        const currentPaper = document.querySelector(`#p${currentLocation}`);
        if (currentPaper) { 
            currentPaper.classList.add("flipped");
            
            // Update the book state
            if (currentLocation === 1) {
                openBook();
            } else if (currentLocation === numOfPapers) {
                closeBook(false);
            }
            
            // Move to the next page
            currentLocation++;
            
            // Update z-indices for all pages
            updateZIndices();
            
            // Update media overlay for the new page
            updateMediaForPage(currentLocation);
            
            // Update the overlay for the new page
            updateOverlay(currentLocation);
            
            // Preload adjacent pages
            preloadAdjacentPages();
            
            // Navigated to page
        }
    }
}

// Navigate to the previous page
function goPrevPage() {
    if (currentLocation > 1) { // First, update the current location before changing UI
        const wasAtEnd = currentLocation === maxLocation;
        
        // Update current location
        const newLocation = currentLocation - 1;
        
        // Update the book state
        if (newLocation === 1) {
            closeBook(true);
        } else if (wasAtEnd) { // If we were at the end, open the book when going back
            openBook();
        }
        
        // Update the current location after state changes
        currentLocation = newLocation;
        
        // Remove flipped class from the current page
        const currentPaper = document.querySelector(`#p${currentLocation}`);
        if (currentPaper) {
            currentPaper.classList.remove("flipped");
        }
        
        // Update z-indices for all pages
        updateZIndices();
        
        // Update media overlay for the new page
        updateMediaForPage(currentLocation);
        
        // Update the overlay for the new page
        updateOverlay(currentLocation);
        
        // Preload adjacent pages
        preloadAdjacentPages();
        
        // Navigated back
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
window.goToPage = function(photoNumber) {
    // Convert photo number to page number (each page has 2 photos)
    const targetPage = Math.ceil(photoNumber / 2);
    
    // Ensure page number is within bounds
    const boundedPage = Math.max(1, Math.min(targetPage, maxLocation - 1));
    
    // Navigate to the target page
    while (currentLocation > boundedPage) goPrevPage();
    while (currentLocation < boundedPage) goNextPage();
    
    updateMediaForPage(boundedPage);
    // Navigated to photo
}
