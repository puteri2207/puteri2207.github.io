// ===== FLOATING STARS BACKGROUND =====
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
});

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

const STAR_COUNT = 120;
let stars = [];

function getAccentColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
}

function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2.5 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.6 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            twinkleOffset: Math.random() * Math.PI * 2,
            // Some stars are 4-point star shapes, rest are circles
            isStar: Math.random() > 0.5,
        });
    }
}

function drawStar4(ctx, x, y, size, opacity, color) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.translate(x, y);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const outerX = Math.cos(angle) * size * 2;
        const outerY = Math.sin(angle) * size * 2;
        const innerAngle = angle + Math.PI / 4;
        const innerX = Math.cos(innerAngle) * size * 0.5;
        const innerY = Math.sin(innerAngle) * size * 0.5;
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Soft gradient background
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Soft glow following cursor
    const accent = getAccentColor();
    const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 350);
    grad.addColorStop(0, hexToRgba(accent, 0.08));
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        // Twinkle
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset);
        const currentOpacity = star.opacity + twinkle * 0.2;

        // Subtle mouse influence
        const dx = mouseX - star.x;
        const dy = mouseY - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
            star.x -= dx * 0.0008;
            star.y -= dy * 0.0008;
        }

        star.x += star.speedX;
        star.y += star.speedY;

        // Wrap around
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        if (star.isStar) {
            drawStar4(ctx, star.x, star.y, star.size, Math.max(0, currentOpacity), accent);
        } else {
            ctx.save();
            ctx.globalAlpha = Math.max(0, currentOpacity);
            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    });

    requestAnimationFrame(animate);
}

function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

initStars();
requestAnimationFrame(animate);

// ===== CURSOR GLOW =====
const cursorGlow = document.querySelector('.cursor-glow');
document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// ===== THEME SWITCHER =====
const themeBtns = document.querySelectorAll('.theme-btn');
themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        if (theme === 'default') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        localStorage.setItem('portfolio-theme', theme);
    });
});

const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme && savedTheme !== 'default') {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === savedTheme);
    });
}

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));

function closeMobile() {
    mobileMenu.classList.remove('open');
}

// ===== EMAILJS =====
function sendEmail() {
    const name = document.getElementById('from_name').value.trim();
    const email = document.getElementById('from_email').value.trim();
    const message = document.getElementById('message').value.trim();
    const btn = document.getElementById('sendBtn');
    const status = document.getElementById('form-status');

    if (!name || !email || !message) {
        status.textContent = 'Please fill in all fields.';
        status.style.color = '#c0392b';
        return;
    }

    btn.textContent = 'Sending...';
    btn.disabled = true;

    emailjs.send("service_axog7wt", "template_cmdy94l", {
    name: name,
    email: email,
    from_email: email,
    subject: "Portfolio Contact",
    message: message,
    title: "New Message"
    }).then(() => {
        status.textContent = '✅ Message sent! I\'ll get back to you soon.';
        status.style.color = '#6a8c6a';
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        btn.disabled = false;
        document.getElementById('from_name').value = '';
        document.getElementById('from_email').value = '';
        document.getElementById('message').value = '';
    }).catch(() => {
        status.textContent = '❌ Something went wrong. Please try again.';
        status.style.color = '#c0392b';
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        btn.disabled = false;
    });
}


const words = ['Developer', 'Mobile App Dev', 'Problem Solver', 'Multilinguist'];
let wordIndex = 0, charIndex = 0, isDeleting = false;
const typedEl = document.querySelector('.typed-text');

function typeEffect() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
        typedEl.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typedEl.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }
    let speed = isDeleting ? 60 : 110;
    if (!isDeleting && charIndex === currentWord.length) {
        speed = 1800; isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        speed = 400;
    }
    setTimeout(typeEffect, speed);
}
typeEffect();

// ===== NAVBAR SCROLL =====
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    navbar.style.background = window.scrollY > 50
        ? 'rgba(245, 240, 232, 0.97)'
        : 'rgba(245, 240, 232, 0.75)';
});

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card, .skill-category, .detail-card, .contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});