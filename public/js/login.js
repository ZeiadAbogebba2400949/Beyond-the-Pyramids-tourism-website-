const getDashboard = (role) => {
  return role === 'Admin' ? '/admin' : '/dashboard';
};

document.addEventListener('DOMContentLoaded', () => {
  init3DTilt();
  initAtmosphericReveal();
  initGlowInputs();

  const form = document.getElementById('login-form');
  const errDiv = document.getElementById('login-error');
  const toggleBtn = document.getElementById('togglePasswordBtn');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const pwd = document.getElementById('password');
      const icon = toggleBtn.querySelector('i');
      if (pwd.type === 'password') { pwd.type = 'text'; icon.className = 'far fa-eye-slash'; }
      else { pwd.type = 'password'; icon.className = 'far fa-eye'; }
    });
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errDiv) errDiv.style.display = 'none';

    const email      = document.getElementById('username').value.trim();
    const password   = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    const submitBtn  = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.textContent = 'Signing in...'; submitBtn.disabled = true; }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid email or password');

      const { data: { user } } = data;
      window.location.href = getDashboard(user.role);
    } catch (err) {
      if (errDiv) { errDiv.style.display = 'block'; errDiv.textContent = err.message; }
      if (submitBtn) { submitBtn.textContent = 'Sign In'; submitBtn.disabled = false; }
    }
  });
});

function init3DTilt() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const rotateX = ((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * -5;
      const rotateY = ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) *  5;
      card.style.transform  = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.boxShadow  = `${rotateY * -1}px ${rotateX}px 30px rgba(0,0,0,0.3), 0 15px 45px rgba(0,0,0,0.1)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      card.style.boxShadow = '';
    });
  });
}

function initAtmosphericReveal() {
  document.querySelectorAll('.reveal-item').forEach((el, i) => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = `all 0.8s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.1}s`;
    requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    });
  });
}

function initGlowInputs() {
  document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('focus', () => input.parentElement.classList.add('glow-active'));
    input.addEventListener('blur',  () => input.parentElement.classList.remove('glow-active'));
  });
}
