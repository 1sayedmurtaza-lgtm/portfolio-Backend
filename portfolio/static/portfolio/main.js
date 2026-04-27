const API = '/api';
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
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.r = Math.random() * 2 + 1;
}

Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
};

Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = '#6C63FF';
    ctx.fill();
};

for (let i = 0; i < 80; i++) particles.push(new Particle());

function connectParticles() {
    const maxDist = 120;

    particles.forEach(p => {
        if (mouse.x !== null) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 150) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(108, 99, 255, ${1 - d / 150})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    });

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < maxDist) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(108, 99, 255, ${1 - d / maxDist})`;
                ctx.lineWidth = 0.5;
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

document.getElementById('year').textContent = new Date().getFullYear();

async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    try {
        const res = await fetch(`${API}/projects/`);
        const data = await res.json();

        if (!res.ok || data.length === 0) {
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
          ${p.live_url ? `<a href="${p.live_url}" target="_blank" class="live">Live</a>` : ''}
        </div>
      </div>
    `).join('');
    } catch {
        grid.innerHTML = '<p class="loading">Could not load projects. Make sure Django is running.</p>';
    }
}

async function loadSkills() {
    const grid = document.getElementById('skills-grid');
    try {
        const res = await fetch(`${API}/skills/`);
        const data = await res.json();

        if (!res.ok) {
            grid.innerHTML = '<p class="loading">Could not load skills. Make sure Django is running.</p>';
            return;
        }

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

document.getElementById('contact-form').addEventListener('submit', handleContact);

loadProjects();
loadSkills();
