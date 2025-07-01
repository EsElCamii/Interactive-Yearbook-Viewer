import { gsap } from 'gsap';

export default class SplitText {
  constructor(options = {}) {
    this.element = document.createElement('div');
    this.element.className = options.className || '';
    this.element.style.textAlign = options.textAlign || 'left';
    this.element.innerHTML = options.text || '';
    
    this.delay = options.delay || 0;
    this.duration = options.duration || 0.5;
    this.ease = options.ease || 'power3.out';
    this.splitType = options.splitType || 'chars'; // 'chars', 'words', or 'lines'
    this.from = options.from || { opacity: 0, y: 20 };
    this.to = options.to || { opacity: 1, y: 0 };
    this.onAnimationComplete = options.onAnimationComplete || (() => {});
    this.onLetterAnimationComplete = options.onLetterAnimationComplete || (() => {});
    
    this.chars = [];
    this.words = [];
    this.lines = [];
    
    this.init();
  }
  
  init() {
    this.splitText();
    this.animate();
  }
  
  splitText() {
    const text = this.element.textContent;
    this.element.textContent = '';
    
    if (this.splitType === 'chars') {
      this.chars = text.split('').map(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.opacity = this.from.opacity || 0;
        span.style.transform = `translateY(${this.from.y || 0}px)`;
        this.element.appendChild(span);
        return span;
      });
    } else if (this.splitType === 'words') {
      this.words = text.split(' ').map(word => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.style.display = 'inline-block';
        span.style.opacity = this.from.opacity || 0;
        span.style.transform = `translateY(${this.from.y || 0}px)`;
        this.element.appendChild(span);
        return span;
      });
    } else if (this.splitType === 'lines') {
      const lines = text.split('\n');
      this.lines = lines.map(line => {
        const div = document.createElement('div');
        div.textContent = line;
        div.style.display = 'block';
        div.style.opacity = this.from.opacity || 0;
        div.style.transform = `translateY(${this.from.y || 0}px)`;
        this.element.appendChild(div);
        return div;
      });
    }
  }
  
  animate() {
    const elements = this.chars.length ? this.chars : 
                    this.words.length ? this.words : 
                    this.lines;
    
    gsap.to(elements, {
      opacity: this.to.opacity || 1,
      y: this.to.y || 0,
      duration: this.duration,
      ease: this.ease,
      stagger: {
        amount: 0.5,
        from: 'start'
      },
      delay: this.delay,
      onComplete: this.onAnimationComplete,
      onUpdate: (self) => {
        if (self.progress() > 0.9 && elements.length > 0) {
          this.onLetterAnimationComplete();
        }
      }
    });
  }
  
  getElement() {
    return this.element;
  }
}
