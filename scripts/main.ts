interface Project {
    name: string;
    description: string;
    html_url: string;
    language: string | null;
}

interface GitHubUserProfile {
    public_repos: number;
}

let allRepos: Project[] = [];
const featuredRepoOrder = ['wattznow', 'yahtzee', 'weatherapp'];

function isFeaturedRepo(repo: Project): boolean {
    return featuredRepoOrder.indexOf(repo.name.toLowerCase()) !== -1;
}

function prioritizeFeaturedRepos(repos: Project[]): Project[] {
    const featuredSet = new Set(featuredRepoOrder);
    const featured: Project[] = [];
    const others: Project[] = [];

    repos.forEach(repo => {
        const normalized = repo.name.toLowerCase();
        if (featuredSet.has(normalized)) {
            featured.push(repo);
        } else {
            others.push(repo);
        }
    });

    featured.sort(
        (a, b) => featuredRepoOrder.indexOf(a.name.toLowerCase()) - featuredRepoOrder.indexOf(b.name.toLowerCase())
    );

    return [...featured, ...others];
}

function createProjectCard(repo: Project): HTMLElement {
    const card = document.createElement('article');
    card.className = 'project-card';

    const tag = document.createElement('p');
    tag.className = 'tag';
    tag.textContent = repo.language || 'Misc';

    const title = document.createElement('h3');
    title.textContent = repo.name;

    const description = document.createElement('p');
    description.textContent = repo.description || 'No description';

    const link = document.createElement('a');
    // Only allow https:// URLs to prevent javascript: injection
    const safeUrl = repo.html_url.startsWith('https://') ? repo.html_url : '#';
    link.href = safeUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Repository';

    card.append(tag, title, description, link);
    return card;
}

function renderProjects(repos: Project[]) {
    const projectsContainer = document.getElementById('projectsContainer')!;
    projectsContainer.innerHTML = '';

    prioritizeFeaturedRepos(repos).forEach(repo => {
        projectsContainer.appendChild(createProjectCard(repo));
    });
}

function updateProjectsStatus(total: number, shown: number) {
    const status = document.getElementById('projectsStatus');
    if (!status) return;

    if (shown === total) {
        status.textContent = `Showing all ${shown} projects`;
        return;
    }
    status.textContent = `Showing ${shown} of ${total} projects`;
}

function applyProjectFilters() {
    const searchInput = document.getElementById('projectSearch') as HTMLInputElement | null;
    const languageFilter = document.getElementById('languageFilter') as HTMLSelectElement | null;

    const searchTerm = searchInput?.value.trim().toLowerCase() ?? '';
    const selectedLanguage = languageFilter?.value ?? 'all';

    const filteredRepos = allRepos.filter(repo => {
        const language = (repo.language || 'Misc').toLowerCase();
        const matchesLanguage = selectedLanguage === 'all' || language === selectedLanguage;
        const haystack = `${repo.name} ${repo.description || ''}`.toLowerCase();
        const matchesSearch = haystack.includes(searchTerm);
        return matchesLanguage && matchesSearch;
    });

    renderProjects(filteredRepos);
    updateProjectsStatus(allRepos.length, filteredRepos.length);
}

function setupProjectFilters(repos: Project[]) {
    const searchInput = document.getElementById('projectSearch') as HTMLInputElement | null;
    const languageFilter = document.getElementById('languageFilter') as HTMLSelectElement | null;
    if (!searchInput || !languageFilter) return;

    const languageSet = new Set<string>();
    repos.forEach(repo => {
        languageSet.add((repo.language || 'Misc').toLowerCase());
    });

    const sortedLanguages = Array.from(languageSet).sort((a, b) => a.localeCompare(b));
    sortedLanguages.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language.charAt(0).toUpperCase() + language.slice(1);
        languageFilter.appendChild(option);
    });

    searchInput.addEventListener('input', applyProjectFilters);
    languageFilter.addEventListener('change', applyProjectFilters);
}

async function loadProjects() {
    const username = 'sonagutha'; // replace with your GitHub username
    const [profileResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
    ]);

    const profileData = await profileResponse.json();
    const data = await reposResponse.json();

    if (!Array.isArray(data)) {
        console.error('Failed to load repos:', data.message ?? data);
        return;
    }

    if (!profileData || typeof profileData.public_repos !== 'number') {
        console.error('Failed to load profile:', profileData?.message ?? profileData);
        return;
    }

    const profile: GitHubUserProfile = profileData;
    allRepos = data.filter(isFeaturedRepo);

    setupProjectFilters(allRepos);
    applyProjectFilters();

    // Update Repositories metric
    const repoMetric = document.querySelector<HTMLElement>('.hero-metrics h3');
    if (repoMetric) {
        repoMetric.dataset.target = profile.public_repos.toString();
        repoMetric.textContent = '0';
        repoMetric.classList.remove('counted');
        animateNumbers();
    }
}
loadProjects();

// Skills
const skills = [
    "Java",
    "Spring Boot",
    "Python",
    "FastAPI",
    "REST APIs",
    "TypeScript",
    "PostgreSQL",
    "MongoDB",
    "IBM ODM",
    "Jenkins",
    "Docker",
    "JUnit + Mockito"
];
const skillsContainer = document.getElementById('skillsContainer')!;
skills.forEach(skill => {
    const span = document.createElement('span');
    span.textContent = skill;
    skillsContainer.appendChild(span);
});

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