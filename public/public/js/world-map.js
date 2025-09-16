// Global variables
let connections = [];
let nodes = [];
let animationFrame;
let isAnimating = false;
let mouseX = 0;
let mouseY = 0;

// Node positions (in percentages of container)
const nodePositions = [
    { x: 75, y: 30 },
    { x: 15, y: 40 },
    { x: 50, y: 60 },
    { x: 80, y: 70 },
    { x: 25, y: 50 }
];

// Easing functions
const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the world map animation
    initWorldMap();
    
    // Re-initialize when the step becomes active
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active')) {
                    // Reset and restart animation when step becomes active
                    resetWorldMap();
                    setTimeout(initWorldMap, 500);
                }
            }
        });
    });

    // Observe the step 5 container for class changes
    const step5 = document.querySelector('.process-step[data-step="5"]');
    if (step5) {
        observer.observe(step5, { attributes: true });
    }
});

function initWorldMap() {
    const map = document.querySelector('.world-map');
    if (!map) return;

    // Get all nodes and reset state
    nodes = Array.from(document.querySelectorAll('.map-node'));
    connections = [];
    isAnimating = true;
    
    // Add mouse move listener for parallax effect
    map.addEventListener('mousemove', handleMouseMove);
    
    // Initialize nodes with positions and event listeners
    nodes.forEach((node, index) => {
        const pos = nodePositions[index % nodePositions.length];
        node.style.setProperty('--x', `${pos.x}%`);
        node.style.setProperty('--y', `${pos.y}%`);
        
        node.addEventListener('mouseenter', handleNodeHover);
        node.addEventListener('mouseleave', handleNodeLeave);
        
        // Add touch support
        node.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleNodeHover({ target: node });
        });
        
        node.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleNodeLeave({ target: node });
        });
    });
    
    // Start animation loop
    startAnimation();

    // Create connections between nodes in a circular pattern
    nodes.forEach((node, index, arr) => {
        const nextIndex = (index + 1) % arr.length;
        if (nextIndex !== index) {
            connections.push({
                from: node,
                to: arr[nextIndex],
                progress: 0,
                direction: 1
            });
        }
        
        // Add some cross-connections for a more network-like appearance
        if (index < arr.length - 2) {
            const crossIndex = (index + 2) % arr.length;
            connections.push({
                from: node,
                to: arr[crossIndex],
                progress: 0,
                direction: 1
            });
        }
    });

    // Create connection lines with staggered animation
    connections.forEach((conn, index) => {
        const line = document.createElement('div');
        line.className = 'connection-line';
        map.appendChild(line);
        
        // Store reference to the line element
        conn.element = line;
        
        // Initial position update
        updateConnection(conn);
        
        // Animate in with delay
        setTimeout(() => {
            line.style.opacity = '0.7';
            conn.progress = 0;
            animateConnection(conn);
        }, index * 200);
        
        // Add hover effects
        line.addEventListener('mouseenter', () => highlightConnection(conn, true));
        line.addEventListener('mouseleave', () => highlightConnection(conn, false));
    });
    
    // Animate nodes with a staggered delay
    nodes.forEach((node, index) => {
        setTimeout(() => {
            node.classList.add('active');
            // Add a subtle bounce effect
            node.animate([
                { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0 },
                { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 1, offset: 0.8 },
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            });
        }, index * 150);
    });
    
// Animation loop for smooth updates
function startAnimation() {
    if (!isAnimating) return;
    
    // Update connection animations
    connections.forEach(conn => {
        if (conn.progress !== undefined) {
            conn.progress += 0.005 * conn.direction;
            if (conn.progress >= 1) {
                conn.progress = 1;
                conn.direction = -1;
            } else if (conn.progress <= 0) {
                conn.progress = 0;
                conn.direction = 1;
            }
            animateConnection(conn);
        }
    });
    
    // Continue animation loop
    animationFrame = requestAnimationFrame(startAnimation);
}

// Animate a single connection
function animateConnection(conn) {
    if (!conn.element) return;
    
    const progress = easeInOutQuad(conn.progress);
    conn.element.style.setProperty('--progress', progress);
    
    // Update dot position for the moving element
    const dot = conn.element.querySelector('.connection-dot');
    if (dot) {
        dot.style.left = `${progress * 100}%`;
    }
}

// Update connection position and appearance
function updateConnection(conn) {
    if (!conn.element) return;
    
    const fromRect = conn.from.getBoundingClientRect();
    const toRect = conn.to.getBoundingClientRect();
    const mapRect = conn.from.closest('.world-map').getBoundingClientRect();
    
    // Calculate positions as percentages
    const x1 = ((fromRect.left + fromRect.width/2) - mapRect.left) / mapRect.width * 100;
    const y1 = ((fromRect.top + fromRect.height/2) - mapRect.top) / mapRect.height * 100;
    const x2 = ((toRect.left + toRect.width/2) - mapRect.left) / mapRect.width * 100;
    const y2 = ((toRect.top + toRect.height/2) - mapRect.top) / mapRect.height * 100;
    
    // Calculate line properties
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Update line styles
    conn.element.style.setProperty('--x1', x1 + '%');
    conn.element.style.setProperty('--y1', y1 + '%');
    conn.element.style.setProperty('--x2', x2 + '%');
    conn.element.style.setProperty('--y2', y2 + '%');
    conn.element.style.setProperty('--length', length + '%');
    conn.element.style.setProperty('--angle', angle + 'deg');
    
    // Add moving dot if it doesn't exist
    if (!conn.element.querySelector('.connection-dot')) {
        const dot = document.createElement('div');
        dot.className = 'connection-dot';
        conn.element.appendChild(dot);
    }
}

// Handle mouse movement for parallax effect
function handleMouseMove(e) {
    const map = e.currentTarget;
    const rect = map.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = (e.clientY - rect.top) / rect.height;
    
    // Apply subtle parallax to map image
    const img = map.querySelector('.world-map-img');
    if (img) {
        const moveX = (mouseX - 0.5) * 20;
        const moveY = (mouseY - 0.5) * 20;
        img.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.02)`;
    }
}

// Highlight connection and connected nodes
function highlightConnection(conn, isHighlighted) {
    if (!conn.element) return;
    
    if (isHighlighted) {
        conn.element.classList.add('highlight');
        conn.from.classList.add('highlight');
        conn.to.classList.add('highlight');
        
        // Add a subtle scale effect to connected nodes
        conn.from.style.transform = 'translate(-50%, -50%) scale(1.8)';
        conn.to.style.transform = 'translate(-50%, -50%) scale(1.8)';
    } else {
        conn.element.classList.remove('highlight');
        conn.from.classList.remove('highlight');
        conn.to.classList.remove('highlight');
        
        // Reset scale
        conn.from.style.transform = 'translate(-50%, -50%) scale(1)';
        conn.to.style.transform = 'translate(-50%, -50%) scale(1)';
    }
}
}

function handleNodeHover(e) {
    const node = e.target;
    node.classList.add('highlight');
    
    // Highlight connected lines
    const lines = document.querySelectorAll('.connection-line');
    lines.forEach(line => {
        if (line._fromNode === node || line._toNode === node) {
            line.classList.add('highlight');
            line.classList.add('active');
            
            // Also highlight the node at the other end of the line
            const otherNode = line._fromNode === node ? line._toNode : line._fromNode;
            if (otherNode) otherNode.classList.add('highlight');
        }
    });
}

function handleNodeLeave(e) {
    const node = e.target;
    node.classList.remove('highlight');
    
    // Unhighlight all lines and nodes
    document.querySelectorAll('.connection-line').forEach(line => {
        line.classList.remove('highlight', 'active');
        if (line._fromNode) line._fromNode.classList.remove('highlight');
        if (line._toNode) line._toNode.classList.remove('highlight');
    });
}

function resetWorldMap() {
    // Stop animation loop
    cancelAnimationFrame(animationFrame);
    isAnimating = false;
    
    // Remove all dynamically created connection lines
    const lines = document.querySelectorAll('.connection-line');
    lines.forEach(line => line.remove());
    
    // Reset nodes
    const nodes = document.querySelectorAll('.map-node');
    nodes.forEach(node => {
        node.classList.remove('active', 'highlight');
        node.style.animation = 'none';
        node.style.transform = 'translate(-50%, -50%) scale(0)';
        node.offsetHeight; // Trigger reflow
    });
    
    // Reset map image position
    const map = document.querySelector('.world-map');
    if (map) {
        const img = map.querySelector('.world-map-img');
        if (img) {
            img.style.transform = 'translate(0, 0) scale(1)';
        }
    }
    
    // Clear global variables
    connections = [];
    nodes = [];
    
    // Reinitialize after a short delay
    setTimeout(() => {
        initWorldMap();
    }, 500);
}
