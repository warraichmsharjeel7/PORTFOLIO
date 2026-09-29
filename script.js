// ===== Typing Effect =====
const roles = [
  'FULL-STACK DEVELOPER',
  'UI/UX ENTHUSIAST',
  'PROBLEM SOLVER',
  'WEB DEVELOPER'
];

const typedEl = document.getElementById('typed-text');
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeEffect() {
  const current = roles[roleIndex];

  if (isDeleting) {
    typedEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
    typingSpeed = 50;
  } else {
    typedEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
    typingSpeed = 100;
  }

  if (!isDeleting && charIndex === current.length) {
    isDeleting = true;
    typingSpeed = 1800; // pause at end
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    typingSpeed = 400;
  }

  setTimeout(typeEffect, typingSpeed);
}

// ===== Mobile Menu =====
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ===== Header scroll effect =====
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll('section[id]');

function highlightNav() {
  const scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);

    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });
}

window.addEventListener('scroll', highlightNav);

// ===== Animate skill bars & stats when in view =====
const progressFills = document.querySelectorAll('.progress-fill');
const statNumbers = document.querySelectorAll('.stat-number');
let skillsAnimated = false;
let statsAnimated = false;

function animateSkills() {
  if (skillsAnimated) return;
  const skillsSection = document.getElementById('skills');
  if (!skillsSection) return;

  const rect = skillsSection.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.8) {
    progressFills.forEach(fill => {
      const width = fill.getAttribute('data-width');
      fill.style.width = width + '%';
    });
    skillsAnimated = true;
  }
}

function animateStats() {
  if (statsAnimated) return;
  const aboutSection = document.getElementById('about');
  if (!aboutSection) return;

  const rect = aboutSection.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.8) {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10);
      let current = 0;
      const increment = target / 40;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          stat.textContent = target;
          clearInterval(timer);
        } else {
          stat.textContent = Math.floor(current);
        }
      }, 30);
    });
    statsAnimated = true;
  }
}

window.addEventListener('scroll', () => {
  animateSkills();
  animateStats();
});

// ===== Fade-in on scroll =====
const fadeEls = document.querySelectorAll(
  '.skill-card, .project-card, .about-content, .contact-form, .info-item'
);

fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

fadeEls.forEach(el => observer.observe(el));

// ===== Contact form =====
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    formStatus.textContent = 'Please fill in all fields.';
    formStatus.className = 'form-status error';
    return;
  }

  // Simulate form submission
  formStatus.textContent = 'Sending...';
  formStatus.className = 'form-status';

  setTimeout(() => {
    formStatus.textContent = 'Message sent successfully! I\'ll get back to you soon.';
    formStatus.className = 'form-status success';
    contactForm.reset();

    setTimeout(() => {
      formStatus.textContent = '';
      formStatus.className = 'form-status';
    }, 4000);
  }, 1200);
});

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  typeEffect();
  highlightNav();
  // Trigger animations if already in view on load
  animateSkills();
  animateStats();
});