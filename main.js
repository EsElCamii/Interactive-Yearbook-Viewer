// References to DOM Elements
const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const book = document.querySelector("#book");
const clickHere = document.querySelector("#animated-circle");
const clickPrev = document.querySelector("#animated-circle-left");

// Event Listeners
prevBtn.addEventListener("click", () => {
  goPrevPage();
  centerAnimatedCircleLeft();
});
nextBtn.addEventListener("click", () => {
  goNextPage();
  centerAnimatedCircleLeft();
});
clickHere.addEventListener("click", () => {
  goNextPage();
  centerAnimatedCircleLeft();
});
clickPrev.addEventListener("click", () => {
  goPrevPage();
  centerAnimatedCircleLeft();
});

// Business Logic
let currentLocation = 1;
let numOfPapers = 50;
let maxLocation = numOfPapers + 1;

// Create papers dynamically
function createPapers() {
  for (let i = 1; i <= numOfPapers; i++) {
    const paper = document.createElement("div");
    paper.id = `p${i}`;
    
    paper.className = "paper";
    paper.style.zIndex = numOfPapers - i;
    
    const front = document.createElement("div");
    front.className = "front";
    const frontContent = document.createElement("div");
    frontContent.id = `f${i}`;
    frontContent.className = "front-content";
    
    front.appendChild(frontContent);

    const back = document.createElement("div");
    back.className = "back";
    const backContent = document.createElement("div");
    backContent.id = `b${i}`;
    backContent.className = "back-content";
    backContent.innerHTML = `<h1>Back ${i}</h1>`;
    back.appendChild(backContent);

    paper.appendChild(front);
    paper.appendChild(back);
    book.appendChild(paper);
  }
}

// Center the animated circle
function centerAnimatedCircleLeft() {
  const bookHeight = book.offsetHeight;
  clickPrev.style.top = `${bookHeight / 2}px`;
  clickPrev.style.left = '0';
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
  prevBtn.style.transform = "translateX(40%)";
  nextBtn.style.transform = "translateX(-40%)";
}

// Adjust button transformations based on screen size
function adjustButtonTransforms() {
  if (window.innerWidth <= 600 && window.matchMedia("(orientation: portrait)").matches) {
    prevBtn.style.transform = "translateX(-20%)";
    nextBtn.style.transform = "translateX(20%)";
  } else if (window.innerWidth <= 812 && window.matchMedia("(orientation: landscape)").matches) {
    prevBtn.style.transform = "translateX(0%)";
    nextBtn.style.transform = "translateX(0%)";
  } else {
    prevBtn.style.transform = "translateX(-10%)";
    nextBtn.style.transform = "translateX(10%)";
  }
}

// Navigate to the next page
function goNextPage() {
  if (currentLocation < maxLocation) {
    const paper = document.querySelector(`#p${currentLocation}`);
    paper.classList.add("flipped");
    paper.style.zIndex = currentLocation;

    if (currentLocation === 1) openBook();
    else if (currentLocation === numOfPapers) closeBook(false);

    if (currentLocation === numOfPapers) {
      document.querySelector("#b37").style.boxShadow = "5px 5px 15px rgba(0, 0, 0, 0.5)";
      document.querySelector(".book").style.boxShadow = "none";
    }

    currentLocation++;
  }
}

// Navigate to the previous page
function goPrevPage() {
  if (currentLocation > 1) {
    const paper = document.querySelector(`#p${currentLocation - 1}`);
    paper.classList.remove("flipped");
    paper.style.zIndex = numOfPapers - currentLocation + 2;

    if (currentLocation === 2) closeBook(true);
    else if (currentLocation === numOfPapers + 1) book.style.transform = "translateX(50%)";

    currentLocation--;
  }
}

// Initialize papers
createPapers();

function centerAnimatedCircleLeft() {
  const bookHeight = book.offsetHeight;
  clickPrev.style.top = `${bookHeight / 2}px`; // Vertically center
  clickPrev.style.left = '-45vw'; // Align to the left edge
  clickPrev.style.transform = 'translateY(-50%)'; // Offset due to top position
}

// Call the function on load and resize
window.addEventListener('load', centerAnimatedCircleLeft);
window.addEventListener('resize', centerAnimatedCircleLeft);

// Center the animated circle on load and resize
window.addEventListener('load', centerAnimatedCircleLeft);
window.addEventListener('resize', centerAnimatedCircleLeft);

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

function goToPage(pageNumber) {
  while (currentLocation > pageNumber) goPrevPage();
  while (currentLocation < pageNumber) goNextPage();
}

