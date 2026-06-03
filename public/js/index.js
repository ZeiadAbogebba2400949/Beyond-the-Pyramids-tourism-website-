document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initCustomCursor();
    initSmoothScroll();
    initNavbarScroll();
    initRevealAnimations();
    initParallax();
    loadTestimonials();
});

function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animateCursor = () => {
        const distX = mouseX - cursorX;
        const distY = mouseY - cursorY;
        cursorX = cursorX + (distX * 0.15);
        cursorY = cursorY + (distY * 0.15);
        const tiltX = distY * 0.1;
        const tiltY = distX * -0.1;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        cursor.style.transform = `translate(-50%, -50%) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
    document.addEventListener('mouseenter', () => cursor.style.opacity = '1');

    document.querySelectorAll('a, button, .btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor--active');
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor--active');
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            el.style.transform = '';
        });
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
        });
    });
}

function initNavbarScroll() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    const handleScroll = () => {
        if (window.scrollY > 50) nav.classList.add('navbar--scrolled');
        else nav.classList.remove('navbar--scrolled');
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
}

function initRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}

function initParallax() {
    const heroVideo = document.querySelector('.hero-video');
    const heroContent = document.querySelector('.hero-content');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (heroVideo && scrolled < window.innerHeight) {
            heroVideo.style.transform = `scale(${1 + scrolled * 0.0003})`;
        }
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.4}px)`;
            heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
        }
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                const navHeight = document.getElementById('main-nav')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
}

function loadTestimonials() {
    const container = document.getElementById('testimonialsContainer');
    if (!container) return;
    if (container.children.length > 0) return;

    const testimonials = [
        {
            name: "Alexandra Sterling",
            country: "United Kingdom",
            text: "The Nile cruise was a masterclass in luxury. Seeing the Valley of the Kings at sunrise is a memory I will cherish forever. Beyond the Pyramids handled every detail perfectly.",
            rating: 5,
            image: "https://randomuser.me/api/portraits/women/3.jpg"
        },
        {
            name: "Julian Moretti",
            country: "Italy",
            text: "Exceptional service and deep historical knowledge. Our guide didn't just show us ruins; they told us the story of a civilization. A truly profound experience.",
            rating: 5,
            image: "https://randomuser.me/api/portraits/men/4.jpg"
        },
        {
            name: "Elena Rodriguez",
            country: "Spain",
            text: "The custom trip builder allowed me to plan a unique itinerary through the Western Desert. The execution was flawless. Highly recommended for the discerning traveler.",
            rating: 5,
            image: "https://randomuser.me/api/portraits/women/5.jpg"
        }
    ];

    let html = '<div class="testimonials-grid">';
    testimonials.forEach((t, i) => {
        html += `
            <div class="testimonial-card reveal-up" style="transition-delay: ${i * 0.1}s">
                <div class="testimonial-header">
                    <img src="${t.image}" alt="${t.name}">
                    <div class="testimonial-info">
                        <h4>${t.name}</h4>
                        <p>${t.country}</p>
                    </div>
                </div>
                <div class="testimonial-rating">${'★'.repeat(t.rating)}</div>
                <blockquote class="testimonial-text">"${t.text}"</blockquote>
            </div>
        `;
    });
    html += '</div>';

    setTimeout(() => {
        container.innerHTML = html;
        document.querySelectorAll('.testimonial-card.reveal-up').forEach(el => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('active');
                });
            }, { threshold: 0.1 });
            observer.observe(el);
        });
    }, 300);
}
