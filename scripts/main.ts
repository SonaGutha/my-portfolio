function applyTheme(theme: 'light' | 'dark') {
    const toggle = document.getElementById('themeToggle') as HTMLButtonElement | null;
    document.documentElement.setAttribute('data-theme', theme);
    if (toggle) {
        toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
}

function setupThemeToggle() {
    const toggle = document.getElementById('themeToggle') as HTMLButtonElement | null;
    if (!toggle) return;

    const savedTheme = localStorage.getItem('portfolio-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme === 'dark' || savedTheme === 'light'
        ? (savedTheme as 'light' | 'dark')
        : (systemPrefersDark ? 'dark' : 'light');

    applyTheme(initialTheme);

    toggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        localStorage.setItem('portfolio-theme', nextTheme);
    });
}

setupThemeToggle();

// Smooth scroll
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href')!);
        target?.scrollIntoView({ behavior: 'smooth' });
    });
});



// Reveal on scroll
const sections = document.querySelectorAll<HTMLElement>('.section-reveal');
function revealSections() {
    sections.forEach(section => {
        if (section.getBoundingClientRect().top < window.innerHeight - 100) {
            section.classList.add('visible');
        }
    });
}
window.addEventListener('scroll', revealSections);
window.addEventListener('load', revealSections);

// Animate numbers
function animateNumbers() {
    document.querySelectorAll<HTMLElement>('.hero-metrics h3').forEach(metric => {
        if (metric.classList.contains('counted')) return;
        if (metric.getBoundingClientRect().top < window.innerHeight - 50) {
            metric.classList.add('counted');
            const target = parseFloat(metric.dataset.target!);
            let current = 0;
            const increment = target / 100;
            const interval = setInterval(() => {
                current += increment;
                if (current >= target) {
                    metric.textContent = target.toString();
                    clearInterval(interval);
                } else {
                    metric.textContent = current.toFixed(target % 1 !== 0 ? 1 : 0);
                }
            }, 20);
        }
    });
}
window.addEventListener('scroll', animateNumbers);
window.addEventListener('load', animateNumbers);