

document.addEventListener('DOMContentLoaded', () => {

    init3DTilt();
    initAtmosphericReveal();
    initGlowInputs();
});


function init3DTilt() {
    const cards = document.querySelectorAll('.tilt-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            
            const shadowX = (rotateY * -1);
            const shadowY = (rotateX);
            card.style.boxShadow = `${shadowX}px ${shadowY}px 30px rgba(0,0,0,0.3), 0 15px 45px rgba(0,0,0,0.1)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            card.style.boxShadow = ''; 
        });
    });
}


function initAtmosphericReveal() {
    const elements = document.querySelectorAll('.reveal-item');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 + (index * 0.1)}s`;
        
        requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    });
}


function initGlowInputs() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('glow-active');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('glow-active');
        });
    });
}



