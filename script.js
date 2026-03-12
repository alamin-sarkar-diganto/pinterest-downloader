// --- NEURAL NETWORK BACKGROUND ---
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00f3ff';
        ctx.fill();
    }
}

function initParticles() {
    for (let i = 0; i < 100; i++) particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    // Draw lines
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 243, 255, ${1 - dist / 150})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}
initParticles();
animate();

// --- CURSOR GLOW ---
const cursor = document.getElementById('cursor-glow');
window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// --- CORE FUNCTIONALITY ---
const downloadBtn = document.getElementById('download-btn');
const urlInput = document.getElementById('url-input');
const statusArea = document.getElementById('status-area');
const resultArea = document.getElementById('result-area');

downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return alert("PLEASE PROVIDE A VALID NEURAL LINK (URL)");

    // UI States
    statusArea.classList.remove('hidden');
    resultArea.classList.add('hidden');
    downloadBtn.disabled = true;

    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('preview-img').src = data.thumb;
            document.getElementById('media-type').innerText = data.type.toUpperCase();
            document.getElementById('res-detail').innerText = `FORMAT: ${data.type.toUpperCase()}`;
            document.getElementById('final-download').href = data.downloadUrl;
            
            resultArea.classList.remove('hidden');
        } else {
            alert("EXTRACTION FAILED: " + data.error);
        }
    } catch (err) {
        alert("CRITICAL ERROR IN THE MATRIX");
    } finally {
        statusArea.classList.add('hidden');
        downloadBtn.disabled = false;
    }
});
