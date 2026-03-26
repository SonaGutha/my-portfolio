(function () {
    const featuredRepoOrder = ['wattznow', 'yahtzee', 'weatherapp'];

    function isFeaturedRepo(repo) {
        return featuredRepoOrder.indexOf(repo.name.toLowerCase()) !== -1;
    }

    function prioritizeFeaturedRepos(repos) {
        const featuredSet = new Set(featuredRepoOrder);
        const featured = [];
        const others = [];

        repos.forEach((repo) => {
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

        return featured.concat(others);
    }

    function setRepoMetric(value) {
        const repoMetric = document.querySelector('.hero-metrics h3');
        if (!repoMetric) {
            return;
        }

        repoMetric.dataset.target = String(value);
        repoMetric.textContent = String(value);
        repoMetric.classList.add('counted');
    }

    function ProjectCard(props) {
        const repo = props.repo;
        const safeRepoUrl = repo.html_url && repo.html_url.startsWith('https://') ? repo.html_url : '#';
        const safeHomepage = repo.homepage && repo.homepage.startsWith('https://') ? repo.homepage : null;

        return React.createElement(
            'article',
            { className: 'project-card' },
            React.createElement('p', { className: 'tag' }, repo.language || 'Misc'),
            React.createElement(
                'div',
                { className: 'project-card-header' },
                React.createElement('h3', null, repo.name),
                isFeaturedRepo(repo)
                    ? React.createElement('span', { className: 'featured-badge' }, 'Featured')
                    : null
            ),
            React.createElement('p', null, repo.description || 'No description provided.'),
            React.createElement(
                'div',
                { className: 'project-meta' },
                React.createElement('span', null, `★ ${repo.stargazers_count}`),
                React.createElement('span', null, `⑂ ${repo.forks_count}`)
            ),
            React.createElement(
                'div',
                { className: 'project-links' },
                React.createElement(
                    'a',
                    { href: safeRepoUrl, target: '_blank', rel: 'noopener noreferrer' },
                    'Repository'
                ),
                safeHomepage
                    ? React.createElement(
                        'a',
                        { href: safeHomepage, target: '_blank', rel: 'noopener noreferrer' },
                        'Live'
                    )
                    : null
            )
        );
    }

    function ProjectsApp() {
        const [repos, setRepos] = React.useState([]);
        const [searchTerm, setSearchTerm] = React.useState('');
        const [language, setLanguage] = React.useState('all');
        const [loading, setLoading] = React.useState(true);

        React.useEffect(() => {
            const username = 'sonagutha';

            Promise.all([
                fetch(`https://api.github.com/users/${username}`),
                fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
            ])
                .then(([profileResponse, reposResponse]) => Promise.all([profileResponse.json(), reposResponse.json()]))
                .then(([profileData, reposData]) => {
                    if (!Array.isArray(reposData)) {
                        console.error('Failed to load repos:', reposData && reposData.message ? reposData.message : reposData);
                        return;
                    }

                    if (profileData && typeof profileData.public_repos === 'number') {
                        setRepoMetric(profileData.public_repos);
                    }

                    setRepos(prioritizeFeaturedRepos(reposData.filter(isFeaturedRepo)));
                })
                .catch((error) => {
                    console.error('Failed to fetch GitHub data:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, []);

        const languageOptions = React.useMemo(() => {
            const values = new Set();
            repos.forEach((repo) => {
                values.add((repo.language || 'Misc').toLowerCase());
            });
            return Array.from(values).sort((a, b) => a.localeCompare(b));
        }, [repos]);

        const filteredRepos = React.useMemo(() => {
            const normalizedSearch = searchTerm.trim().toLowerCase();

            return repos.filter((repo) => {
                const repoLanguage = (repo.language || 'Misc').toLowerCase();
                const matchesLanguage = language === 'all' || repoLanguage === language;
                const haystack = `${repo.name} ${repo.description || ''}`.toLowerCase();
                const matchesSearch = haystack.indexOf(normalizedSearch) !== -1;
                return matchesLanguage && matchesSearch;
            });
        }, [repos, searchTerm, language]);

        const statusText = filteredRepos.length === repos.length
            ? `Showing all ${filteredRepos.length} projects`
            : `Showing ${filteredRepos.length} of ${repos.length} projects`;

        return React.createElement(
            React.Fragment,
            null,
            React.createElement(
                'div',
                { className: 'projects-tools' },
                React.createElement('input', {
                    type: 'search',
                    placeholder: 'Search projects by name or description',
                    value: searchTerm,
                    onChange: (event) => setSearchTerm(event.target.value)
                }),
                React.createElement(
                    'select',
                    {
                        value: language,
                        'aria-label': 'Filter projects by language',
                        onChange: (event) => setLanguage(event.target.value)
                    },
                    React.createElement('option', { value: 'all' }, 'All languages'),
                    languageOptions.map((item) => React.createElement(
                        'option',
                        { key: item, value: item },
                        item.charAt(0).toUpperCase() + item.slice(1)
                    ))
                )
            ),
            React.createElement('p', { className: 'projects-status' }, statusText),
            loading
                ? React.createElement('p', { className: 'projects-status' }, 'Loading projects...')
                : React.createElement(
                    'div',
                    { className: 'card-grid' },
                    filteredRepos.map((repo) => React.createElement(ProjectCard, { key: repo.id || repo.name, repo: repo }))
                )
        );
    }

    const mountNode = document.getElementById('projectsApp');
    if (mountNode && window.React && window.ReactDOM) {
        const root = ReactDOM.createRoot(mountNode);
        root.render(React.createElement(ProjectsApp));
    }

    // ─── Skills grouped by category ───────────────────────────────────────
    const SKILLS = [
        { category: 'Backend', items: ['Java', 'Spring Boot', 'Python', 'FastAPI', 'REST APIs', 'Microservices', 'TypeScript'] },
        { category: 'Frontend', items: ['HTML', 'CSS'] },
        { category: 'Databases', items: ['PostgreSQL', 'MongoDB', 'SQL'] },
        { category: 'DevOps & Tools', items: ['Docker', 'Jenkins', 'UCD', 'Git', 'IBM ODM'] },
        { category: 'Testing', items: ['JUnit', 'Mockito', 'UAT', 'Regression'] }
    ];

    function SkillsApp() {
        const [activeCategory, setActiveCategory] = React.useState('All');
        const categories = ['All'].concat(SKILLS.map(function (g) { return g.category; }));

        const visibleGroups = SKILLS.filter(function (g) {
            return activeCategory === 'All' || g.category === activeCategory;
        });

        return React.createElement(
            React.Fragment,
            null,
            React.createElement(
                'div',
                { className: 'skills-filter' },
                categories.map(function (cat) {
                    return React.createElement(
                        'button',
                        {
                            key: cat,
                            className: 'skills-filter-btn' + (activeCategory === cat ? ' active' : ''),
                            onClick: function () { setActiveCategory(cat); }
                        },
                        cat
                    );
                })
            ),
            visibleGroups.map(function (group) {
                return React.createElement(
                    'div',
                    { key: group.category, className: 'skills-group' },
                    React.createElement('p', { className: 'skills-group-label' }, group.category),
                    React.createElement(
                        'div',
                        { className: 'chips' },
                        group.items.map(function (skill) {
                            return React.createElement('span', { key: skill }, skill);
                        })
                    )
                );
            })
        );
    }

    const skillsMountNode = document.getElementById('skillsApp');
    if (skillsMountNode && window.React && window.ReactDOM) {
        ReactDOM.createRoot(skillsMountNode).render(React.createElement(SkillsApp));
    }

    // ─── Contact form with validation ─────────────────────────────────────
    function ContactForm() {
        const [fields, setFields] = React.useState({ name: '', email: '', message: '' });
        const [errors, setErrors] = React.useState({});
        const [submitted, setSubmitted] = React.useState(false);
        const [sending, setSending] = React.useState(false);
        const [sendError, setSendError] = React.useState(null);

        function validate(values) {
            var errs = {};
            if (!values.name.trim()) errs.name = 'Name is required.';
            if (!values.email.trim()) {
                errs.email = 'Email is required.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
                errs.email = 'Enter a valid email address.';
            }
            if (!values.message.trim()) errs.message = 'Message is required.';
            else if (values.message.trim().length < 10) errs.message = 'Message must be at least 10 characters.';
            return errs;
        }

        function handleChange(e) {
            var updated = Object.assign({}, fields, { [e.target.name]: e.target.value });
            setFields(updated);
            // Clear error for this field once user starts fixing it
            if (errors[e.target.name]) {
                var updatedErrors = Object.assign({}, errors);
                delete updatedErrors[e.target.name];
                setErrors(updatedErrors);
            }
        }

        function handleSubmit(e) {
            e.preventDefault();
            var errs = validate(fields);
            if (Object.keys(errs).length > 0) {
                setErrors(errs);
                return;
            }
            setSending(true);
            setSendError(null);
            fetch('https://formsubmit.co/ajax/3e3abaffc842c60f5a881c52af17b796', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    name: fields.name,
                    email: fields.email,
                    message: fields.message,
                    _subject: 'Portfolio Contact from ' + fields.name,
                    _captcha: 'false'
                })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                setSending(false);
                if (data.success) {
                    setSubmitted(true);
                } else {
                    setSendError('Something went wrong. Please try again or email directly.');
                }
            })
            .catch(function() {
                setSending(false);
                setSendError('Network error. Please try again or email directly.');
            });
        }

        if (submitted) {
            return React.createElement(
                'div',
                { className: 'contact-success', role: 'status' },
                React.createElement('p', null, "✅ Message sent! Thanks for reaching out, " + fields.name + ". I'll get back to you soon.")
            );
        }

        function field(label, name, type, placeholder, multiline) {
            var hasError = Boolean(errors[name]);
            var inputProps = {
                id: 'contact-' + name,
                name: name,
                placeholder: placeholder,
                value: fields[name],
                onChange: handleChange,
                className: 'contact-input' + (hasError ? ' input-error' : ''),
                'aria-describedby': hasError ? 'contact-' + name + '-error' : undefined,
                'aria-invalid': hasError ? 'true' : undefined
            };
            var input = multiline
                ? React.createElement('textarea', Object.assign({}, inputProps, { rows: 5 }))
                : React.createElement('input', Object.assign({}, inputProps, { type: type }));

            return React.createElement(
                'div',
                { key: name, className: 'contact-field' },
                React.createElement('label', { htmlFor: 'contact-' + name, className: 'contact-label' }, label),
                input,
                hasError
                    ? React.createElement('span', { id: 'contact-' + name + '-error', className: 'contact-error', role: 'alert' }, errors[name])
                    : null
            );
        }

        return React.createElement(
            'form',
            { className: 'contact-form', onSubmit: handleSubmit, noValidate: true },
            field('Name', 'name', 'text', 'Your name', false),
            field('Email', 'email', 'email', 'your@email.com', false),
            field('Message', 'message', 'text', 'What would you like to discuss?', true),
            sendError ? React.createElement('p', { className: 'contact-error', role: 'alert' }, sendError) : null,
            React.createElement('div', { className: 'contact-actions' },
                React.createElement('button', { type: 'submit', className: 'btn primary', disabled: sending }, sending ? 'Sending…' : 'Send Message ↗'),
                React.createElement('a', { className: 'btn ghost', href: 'https://www.linkedin.com/in/sona-gutha/', target: '_blank', rel: 'noopener noreferrer' }, 'Connect on LinkedIn')
            )
        );
    }

    const contactMountNode = document.getElementById('contactApp');
    if (contactMountNode && window.React && window.ReactDOM) {
        ReactDOM.createRoot(contactMountNode).render(React.createElement(ContactForm));
    }

    // ─── Back-to-top button ────────────────────────────────────────────────
    function BackToTop() {
        const [visible, setVisible] = React.useState(false);

        React.useEffect(function () {
            function onScroll() {
                setVisible(window.scrollY > 400);
            }
            window.addEventListener('scroll', onScroll, { passive: true });
            return function () { window.removeEventListener('scroll', onScroll); };
        }, []);

        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (!visible) return null;

        return React.createElement(
            'button',
            {
                className: 'back-to-top',
                onClick: scrollToTop,
                'aria-label': 'Back to top'
            },
            '↑'
        );
    }

    const backToTopMountNode = document.getElementById('backToTopApp');
    if (backToTopMountNode && window.React && window.ReactDOM) {
        ReactDOM.createRoot(backToTopMountNode).render(React.createElement(BackToTop));
    }

    // ─── Booking section ───────────────────────────────────────────────────
    // Replace CALENDLY_URL with your real Calendly link, e.g.:
    // https://calendly.com/your-username
    var CALENDLY_URL = 'https://calendly.com/sonashree';

    var MEETING_TYPES = [
        {
            id: 'intro',
            title: 'Schedule a Call',
            duration: '30 min',
            description: 'Let\'s connect — discuss a role, a project, or just say hello.',
            path: '/30min'
        }
    ];

    function BookingCard(props) {
        var meeting = props.meeting;
        var url = CALENDLY_URL + meeting.path;

        return React.createElement(
            'article',
            { className: 'booking-card' },
            React.createElement(
                'div',
                { className: 'booking-card-header' },
                React.createElement('h3', null, meeting.title),
                React.createElement('span', { className: 'booking-duration' }, meeting.duration)
            ),
            React.createElement('p', null, meeting.description),
            React.createElement(
                'a',
                {
                    href: url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'btn primary booking-btn'
                },
                'Book ' + meeting.title + ' →'
            )
        );
    }

    function BookingSection() {
        return React.createElement(
            React.Fragment,
            null,
            React.createElement(
                'div',
                { className: 'booking-grid' },
                MEETING_TYPES.map(function (meeting) {
                    return React.createElement(BookingCard, { key: meeting.id, meeting: meeting });
                })
            ),
            React.createElement(
                'p',
                { className: 'booking-note' },
                'Powered by ',
                React.createElement('a', { href: 'https://calendly.com', target: '_blank', rel: 'noopener noreferrer' }, 'Calendly'),
                '. You\'ll be taken to my scheduling page to pick a time that works.'
            )
        );
    }

    var bookingMountNode = document.getElementById('bookingApp');
    if (bookingMountNode && window.React && window.ReactDOM) {
        ReactDOM.createRoot(bookingMountNode).render(React.createElement(BookingSection));
    }
})();
