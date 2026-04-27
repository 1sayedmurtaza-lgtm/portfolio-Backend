const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let mouse = { x: null, y: null };
let particles = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

function Particle() {
    this.reset();
}

Particle.prototype.reset = function () {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.r = Math.random() * 2 + 1;
};

Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
            this.x += dx / dist * 1.5;
            this.y += dy / dist * 1.5;
        }
    }
};

Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = '#6C63FF';
    ctx.fill();
};

for (let i = 0; i < 100; i++) particles.push(new Particle());

function connectParticles() {
    const maxDist = 130;

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(108, 99, 255, ${1 - dist / maxDist})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }

        if (mouse.x !== null) {
            const dx = particles[i].x - mouse.x;
            const dy = particles[i].y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 180) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(108, 99, 255, ${1 - dist / 180})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
}

animateParticles();

// Rest of the app functionality
const API = 'https://portfolio-application.up.railway.app/api';

// Typewriter effect with sound
function typeWriter(text, elementId, speed = 100) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.textContent = '';
    let i = 0;

    // Create audio context for typing sound
    let audioContext = null;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }

    function playTypingSound() {
        if (!audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Random frequency for typing sound variation (more typewriter-like)
        const frequency = 400 + Math.random() * 300; // 400-700Hz range
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // Quick attack and decay for typewriter sound
        const volume = 0.05 + Math.random() * 0.05; // Random volume 0.05-0.1
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.08);
    }

    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            playTypingSound(); // Play sound for each character
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Load projects from API
async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    try {
        const res = await fetch(`${API}/projects/`);
        const data = await res.json();

        if (data.length === 0) {
            grid.innerHTML = '<p class="loading">No projects yet — add some in Django Admin.</p>';
            return;
        }

        grid.innerHTML = data.map(p => `
      <div class="project-card">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <p class="project-tech">${p.tech_stack}</p>
        <div class="project-links">
          ${p.github_url ? `<a href="${p.github_url}" target="_blank">GitHub</a>` : ''}
          ${p.live_url ? `<a href="${p.live_url}"   target="_blank" class="live">Live</a>` : ''}
        </div>
      </div>
    `).join('');
    } catch {
        grid.innerHTML = '<p class="loading">Could not load projects. Make sure Django is running.</p>';
    }
}

// Load skills from API
async function loadSkills() {
    const grid = document.getElementById('skills-grid');
    try {
        const res = await fetch(`${API}/skills/`);
        const data = await res.json();

        const categories = ['frontend', 'backend', 'database', 'tools'];
        const grouped = {};
        categories.forEach(c => grouped[c] = data.filter(s => s.category === c));

        grid.innerHTML = categories
            .filter(c => grouped[c].length > 0)
            .map(c => `
        <div class="skill-category">
          <h3>${c}</h3>
          <div class="skill-tags">
            ${grouped[c].map(s => `
              <span class="skill-tag ${s.level}">${s.name}</span>
            `).join('')}
          </div>
        </div>
      `).join('');
    } catch {
        grid.innerHTML = '<p class="loading">Could not load skills. Make sure Django is running.</p>';
    }
}

// Handle contact form
async function handleContact(e) {
    e.preventDefault();
    const form = e.target;
    const msg = document.getElementById('form-msg');
    const btn = form.querySelector('button');

    btn.textContent = 'Sending...';
    btn.disabled = true;
    msg.textContent = '';
    msg.className = 'form-msg';

    try {
        const res = await fetch(`${API}/contact/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: form.name.value,
                email: form.email.value,
                message: form.message.value,
            }),
        });

        if (res.ok) {
            msg.textContent = 'Message sent! I will get back to you soon.';
            msg.classList.add('success');
            form.reset();
        } else {
            throw new Error();
        }
    } catch {
        msg.textContent = 'Something went wrong. Please try again.';
        msg.classList.add('error');
    } finally {
        btn.textContent = 'Send message';
        btn.disabled = false;
    }
}

// Initialize everything
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('contact-form').addEventListener('submit', handleContact);

loadProjects();
loadSkills();

// Start typing animation
setTimeout(() => {
    typeWriter('Sayed Murtaza', 'typed-name', 120);
}, 1000);

// Dynamic greeting based on time of day
function updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const mins = now.getMinutes().toString().padStart(2, '0');
    const secs = now.getSeconds().toString().padStart(2, '0');
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    let greet;
    if (hour >= 5 && hour < 12) greet = '🌅 Good morning';
    else if (hour >= 12 && hour < 17) greet = '☀️ Good afternoon';
    else if (hour >= 17 && hour < 21) greet = '🌆 Good evening';
    else greet = '🌙 Good night';

    document.getElementById('greeting').textContent =
        `${greet} — ${day}, ${date} ${hour}:${mins}:${secs}`;
}

updateGreeting();
setInterval(updateGreeting, 1000);