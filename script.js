// ---------------------------------------------------------
// Glass Mesh Background Generator (Optimized)
// ---------------------------------------------------------

let glassBackgroundInitialized = false;

function initGlassBackground() {
  if (glassBackgroundInitialized) return;
  glassBackgroundInitialized = true;
  
  // 1. Create the container
  const container = document.createElement('div');
  container.id = 'glass-bg-container';
  
  // Inject necessary CSS for the background system
  const style = document.createElement('style');
  style.textContent = `
    #glass-bg-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1; /* Behind everything */
      overflow: hidden;
      background: #0f0f13; /* Dark background base */
    }

    /* Distinct glowing orbs behind the glass to make the blur visible */
    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.6;
      animation: floatOrb 20s infinite alternate ease-in-out;
    }

    /* The Glass Triangle Class */
    .glass-poly {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      pointer-events: none; /* Let clicks pass through */
      transition: all 0.5s ease;
    }

    /* Subtle hover effect on triangles */
    .glass-poly:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: scale(1.02);
      z-index: 1;
    }

    @keyframes floatOrb {
      0% { transform: translate(0, 0) rotate(0deg); }
      100% { transform: translate(100px, 50px) rotate(20deg); }
    }
  `;
  document.head.appendChild(style);

  // 2. Add Ambient Glow Orbs (so the glass has something to refract)
  const colors = ['#8A2BE2', '#4169E1', '#00FFFF', '#FF00FF'];
  const orbFragment = document.createDocumentFragment();
  for(let i=0; i<4; i++) {
    const orb = document.createElement('div');
    orb.className = 'glow-orb';
    const size = Math.random() * 400 + 300;
    orb.style.width = size + 'px';
    orb.style.height = size + 'px';
    orb.style.background = colors[i % colors.length];
    orb.style.left = Math.random() * 80 + '%';
    orb.style.top = Math.random() * 80 + '%';
    orb.style.animationDuration = (Math.random() * 10 + 15) + 's';
    orbFragment.appendChild(orb);
  }
  container.appendChild(orbFragment);

  // 3. Generate the Triangle Mesh
  // We create a grid of points, then connect them
  const cols = 6; // Number of triangles across
  const rows = 4; // Number of triangles down
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  const xStep = width / cols;
  const yStep = height / rows;

  const points = [];

  // Generate vertices (grid points)
  for (let y = 0; y <= rows; y++) {
    const rowPoints = [];
    for (let x = 0; x <= cols; x++) {
      // Add randomness to inner points to make it look "organic"
      const xOffset = (x === 0 || x === cols) ? 0 : (Math.random() - 0.5) * xStep * 0.8;
      const yOffset = (y === 0 || y === rows) ? 0 : (Math.random() - 0.5) * yStep * 0.8;
      
      rowPoints.push({
        x: x * xStep + xOffset,
        y: y * yStep + yOffset
      });
    }
    points.push(rowPoints);
  }

  // Create Triangles from points
  // Logic: For every square in the grid, split it into 2 triangles
  const triangleFragment = document.createDocumentFragment();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const p1 = points[y][x];         // Top-Left
      const p2 = points[y][x+1];       // Top-Right
      const p3 = points[y+1][x];       // Bottom-Left
      const p4 = points[y+1][x+1];     // Bottom-Right

      // Triangle 1 (Top-Left, Top-Right, Bottom-Left)
      createTriangle(triangleFragment, p1, p2, p3);

      // Triangle 2 (Top-Right, Bottom-Right, Bottom-Left)
      createTriangle(triangleFragment, p2, p4, p3);
    }
  }
  container.appendChild(triangleFragment);

  document.body.prepend(container);
}

// Helper: Creates a DIV with a clip-path polygon
function createTriangle(parent, p1, p2, p3) {
  const div = document.createElement('div');
  div.className = 'glass-poly';
  
  // Create polygon shape
  // Note: We use fixed pixel values for precision, effectively overlaying the screen
  const clipPath = `polygon(${p1.x}px ${p1.y}px, ${p2.x}px ${p2.y}px, ${p3.x}px ${p3.y}px)`;
  div.style.clipPath = clipPath;
  div.style.webkitClipPath = clipPath; // Safari support

  // Randomize glass opacity slightly for depth effect
  const opacity = 0.02 + Math.random() * 0.05;
  div.style.background = `rgba(255, 255, 255, ${opacity})`;

  parent.appendChild(div);
}

// ---------------------------------------------------------
// Animate Skill Bars (Optimized with Intersection Observer)
// ---------------------------------------------------------

let skillAnimationTriggered = false;

function animateSkillBars() {
  const skillContainer = document.querySelector('.skills-grid');
  if (!skillContainer) return;
  
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !skillAnimationTriggered) {
      skillAnimationTriggered = true;
      observer.disconnect();
      
      // Animate linear bars
      document.querySelectorAll('.skill-item').forEach(item => {
        const percent = item.getAttribute('data-percent');
        const barFill = item.querySelector('.skill-bar-fill');
        if (barFill && percent) {
          barFill.style.width = percent + '%';
        }
      });

      // Animate circular progress rings
      document.querySelectorAll('.radial-skill').forEach(item => {
        const percent = item.getAttribute('data-percent');
        const ringElement = item.querySelector('.radial-bar-ring');
        if (ringElement && percent) {
          const circumference = 376.99;
          const fillLength = (percent / 100) * circumference;
          ringElement.style.strokeDasharray = `${circumference}`;
          ringElement.style.strokeDashoffset = `${circumference - fillLength}`;
        }
      });
    }
  }, { threshold: 0.1 });
  
  observer.observe(skillContainer);
}

// ---------------------------------------------------------
// Animate Hero Text on Scroll (Optimized with RAF)
// ---------------------------------------------------------

let ticking = false;
let lastScrollPosition = 0;

function animateHeroText() {
  const heroText = document.querySelector('.hero-overlay-text');
  const heroSection = document.querySelector('.hero-image-wrapper');
  
  if (!heroText || !heroSection) return;
  
  function updateScroll() {
    const heroHeight = window.innerHeight;
    const progress = Math.max(0, Math.min(1, lastScrollPosition / (heroHeight * 0.75)));
    const scale = 1 - (progress * 0.7);
    const opacity = 1 - progress;
    
    heroText.style.transform = `translate(-50%, -50%) scale(${scale})`;
    heroText.style.opacity = opacity;
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    lastScrollPosition = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    animateHeroText();
    animateSkillBars();
    // Defer glass background to next frame for faster initial render
    requestAnimationFrame(() => initGlassBackground());
  });
} else {
  animateHeroText();
  animateSkillBars();
  requestAnimationFrame(() => initGlassBackground());
}
