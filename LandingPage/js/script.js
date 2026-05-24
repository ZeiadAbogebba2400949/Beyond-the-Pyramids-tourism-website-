

document.addEventListener('DOMContentLoaded', () => {
    
    initTheme();
    initScrollProgress();
    initCustomCursor();
    initSmoothScroll();
    initNavbarScroll();
    initRevealAnimations();
    initParallax();
    loadTestimonials();
    initNewsletter();
    
    // Dynamic Packages from AppStorage (falls back to mockData.js)
    if (window.AppStorage && window.AppStorage.getPackages) {
        const packages = window.AppStorage.getPackages();
        renderFeaturedDestinations(packages);
        renderSignaturePackages(packages);
    } else if (window.MockData && window.MockData.packages) {
        renderFeaturedDestinations(window.MockData.packages);
        renderSignaturePackages(window.MockData.packages);
    }
});


function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    function applyTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (themeToggle) {
            const sunIcon = themeToggle.querySelector('.sun-icon');
            const moonIcon = themeToggle.querySelector('.moon-icon');
            if (sunIcon && moonIcon) {
                if (theme === 'dark') {
                    sunIcon.style.display = 'block';
                    moonIcon.style.display = 'none';
                    themeToggle.setAttribute('aria-label', 'Switch to Light Mode');
                } else {
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'block';
                    themeToggle.setAttribute('aria-label', 'Switch to Dark Mode');
                }
            }
        }
    }

    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        });
    }

    // Listen for changes across tabs
    window.addEventListener('storage', function (e) {
        if (e.key === 'theme' && e.newValue) {
            applyTheme(e.newValue);
        }
    });
}


function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    });
}


function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

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

    
    const interactiveElements = document.querySelectorAll('a, button, .btn');

    interactiveElements.forEach(el => {
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
        if (window.scrollY > 50) {
            nav.classList.add('navbar--scrolled');
        } else {
            nav.classList.remove('navbar--scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
}


function initRevealAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

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

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}


function loadTestimonials() {
    const container = document.getElementById('testimonialsContainer');
    if (!container) return;

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
                <div class="testimonial-rating">
                    ${'★'.repeat(t.rating)}
                </div>
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
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(el);
        });
    }, 300);
}



function initNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input').value;
        alert(`Thank you. ${email} has been added to our exclusive inner circle.`);
        form.reset();
    });
}

// --- Dynamic Rendering from MockData ---

function renderFeaturedDestinations(packages) {
    const container = document.getElementById('dynamicDestinationsGrid');
    if (!container) return;

    // Filter to top 4 'single' location packages
    const destinations = packages.filter(p => p.type === 'single').slice(0, 4);
    
    container.innerHTML = '';
    
    destinations.forEach((pkg, index) => {
        const card = document.createElement('article');
        card.className = 'destination-card reveal-up';
        if (index === 0) {
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${pkg.image}" alt="${pkg.name}" class="card-image">
                    <div class="card-badge">Top Choice</div>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${pkg.name}</h3>
                    <p class="card-text">${pkg.description.substring(0, 80)}...</p>
                    <div class="card-meta">
                        <span class="card-price">From <span class="price-value">${pkg.price} EGP</span></span>
                        <a href="PackageDetailsPage/package-details.html?id=${pkg.id}" class="btn-link">Explore Details</a>
                    </div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${pkg.image}" alt="${pkg.name}" class="card-image">
                </div>
                <div class="card-body">
                    <h3 class="card-title">${pkg.name}</h3>
                    <p class="card-text">${pkg.description.substring(0, 80)}...</p>
                    <div class="card-meta">
                        <span class="card-price">From <span class="price-value">${pkg.price} EGP</span></span>
                        <a href="PackageDetailsPage/package-details.html?id=${pkg.id}" class="btn-link">Explore Details</a>
                    </div>
                </div>
            `;
        }
        container.appendChild(card);
    });

    // Re-observe new elements for reveal animations
    observeRevealElements(container);
}

function renderSignaturePackages(packages) {
    const container = document.getElementById('dynamicPackagesGrid');
    if (!container) return;

    // Filter to 'week' and 'day' packages, slice top 2
    const signature = packages.filter(p => p.type === 'week' || p.type === 'day').slice(0, 2);
    
    container.innerHTML = '';
    
    signature.forEach(pkg => {
        const card = document.createElement('article');
        card.className = 'package-card reveal-up';
        if (pkg.type === 'week') card.setAttribute('data-featured', 'true');
        
        const typeLabel = pkg.type === 'week' ? 'Weekly' : 'Day Trip';
        const pricingLabel = pkg.type === 'week' ? 'Total journey' : 'Per person';
        const currency = 'EGP'; // Assuming EGP for consistency
        
        card.innerHTML = `
            <div class="package-header">
                <span class="package-type">${typeLabel}</span>
                <img src="${pkg.image}" alt="${pkg.name}" class="package-img">
            </div>
            <div class="package-content">
                <h3 class="package-title">${pkg.name}</h3>
                <p class="package-desc">${pkg.description.substring(0, 90)}...</p>
                <ul class="package-amenities">
                    <li><i class="fas fa-circle-check"></i> ${pkg.accommodationIncluded === 'yes' ? 'Luxury Accommodation' : 'Expert Guide'}</li>
                    <li><i class="fas fa-circle-check"></i> Luxury Transport</li>
                    <li><i class="fas fa-circle-check"></i> ${pkg.type === 'week' ? 'Guided Shore Tours' : 'Gourmet Lunch'}</li>
                </ul>
                <div class="package-footer">
                    <div class="package-pricing">
                        <span class="price-label">${pricingLabel}</span>
                        <span class="price-total">${pkg.price} ${currency}</span>
                    </div>
                    <a href="PackageDetailsPage/package-details.html?id=${pkg.id}" class="btn btn--primary btn--small">Reserve Now</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Add the fixed Bespoke card
    const bespokeCard = document.createElement('article');
    bespokeCard.className = 'package-card package-card--custom reveal-up';
    bespokeCard.innerHTML = `
        <div class="package-header">
            <span class="package-type">Bespoke</span>
            <div class="custom-icon-wrapper" style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 3rem; color: var(--color-gold);">
                <i class="fas fa-compass"></i>
            </div>
        </div>
        <div class="package-content">
            <h3 class="package-title">Design Your Journey</h3>
            <p class="package-desc">Craft a unique itinerary tailored entirely to your rhythm and interests.</p>
            <ul class="package-amenities">
                <li><i class="fas fa-circle-check"></i> Personal Concierge</li>
                <li><i class="fas fa-circle-check"></i> Flexible Pacing</li>
                <li><i class="fas fa-circle-check"></i> Exclusive Access</li>
            </ul>
            <div class="package-footer">
                <a href="CustomTripBuilderPage/CustomTripBuilderPage.html" class="btn btn--outline btn--full">Start Architecting</a>
            </div>
        </div>
    `;
    container.appendChild(bespokeCard);
    observeRevealElements(container);
}

function observeRevealElements(container) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    container.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}