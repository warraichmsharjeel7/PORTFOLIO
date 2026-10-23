/**
 * ==========================================================================
 * MUHAMMAD AZHAN — PORTFOLIO
 * Master Production JavaScript (Vanilla JS - Zero External Dependencies)
 * ==========================================================================
 */

'use strict';

/* ==========================================================================
   01. CONFIGURATION & BRAND REGISTRY
   ========================================================================== */
const CONFIG = {
  // Brand Identity
  fullName: 'Muhammad Azhan',
  professionalTitle: 'Web Developer | Full Stack Developer',

  // Social & Contact Integrations
  githubUsername: 'Azhan787',
  githubProfileUrl: 'https://github.com/Azhan787',
  githubApiUrl: 'https://api.github.com/users/Azhan787/repos?sort=updated&direction=desc&per_page=100',
  whatsappNumber: '923701366877',
  whatsappFormatted: '+92 370-1366877',
  whatsappPrefillText: 'Hello Muhammad, I visited your portfolio and would like to get in touch.',
  linkedinUrl: 'https://www.linkedin.com/in/muhammad-azhan-54724537a',
  
  // Official Email Address
  emailAddress: 'itxazhan32@gmail.com',

  // Assets
  cvFilename: 'Muhammad_Azhan_CV.pdf',

  // Projects View Configuration
  projectsPageSize: 6,
  cacheDurationMs: 15 * 60 * 1000 // 15 minutes local cache
};

/* ==========================================================================
   02. THEME ENGINE (White + Yellow default, optional night mode)
   ========================================================================== */
const ThemeEngine = {
  STORAGE_KEY: 'ma_theme_v2',

  init() {
    // White + yellow ("light") is the default. Night mode is opt-in through the toggle.
    let saved = null;
    try { saved = localStorage.getItem(this.STORAGE_KEY); } catch (e) { /* storage blocked */ }
    this.setTheme(saved === 'dark' ? 'dark' : 'light', false);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    toggleBtn?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      this.setTheme(current === 'dark' ? 'light' : 'dark', true);
    });
  },

  setTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) {
      try { localStorage.setItem(this.STORAGE_KEY, theme); } catch (e) { /* storage blocked */ }
    }
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      const next = theme === 'dark' ? 'light' : 'dark';
      toggleBtn.setAttribute('aria-label', `Switch to ${next} mode`);
      toggleBtn.setAttribute('title', `Switch to ${next} mode`);
    }
  }
};

/* ==========================================================================
   03. NAVIGATION & SCROLL MANAGEMENT
   ========================================================================== */
const Navigation = {
  init() {
    const header = document.querySelector('.site-header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    // Sticky header shadow on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    }, { passive: true });

    // Mobile menu toggle
    const toggleMobileMenu = (open) => {
      const isOpen = open !== undefined ? open : !mobileDrawer?.classList.contains('open');
      mobileDrawer?.classList.toggle('open', isOpen);
      mobileOverlay?.classList.toggle('visible', isOpen);
      mobileToggle?.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    mobileToggle?.addEventListener('click', () => toggleMobileMenu());
    mobileOverlay?.addEventListener('click', () => toggleMobileMenu(false));

    // Close mobile nav on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer?.classList.contains('open')) {
        toggleMobileMenu(false);
      }
    });

    // Close mobile nav and smooth scroll when links are clicked
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileDrawer?.classList.contains('open')) {
          toggleMobileMenu(false);
        }
      });
    });

    // Active Section Scroll Spy with IntersectionObserver
    this.initScrollSpy();

    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top-btn');
    backToTopBtn?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px'
    });

    sections.forEach((sec) => observer.observe(sec));
  }
};

/* ==========================================================================
   04. LIVE GITHUB PROJECT ECOSYSTEM
   ========================================================================== */
const GitHubProjects = {
  rawRepositories: [],
  filteredRepositories: [],
  selectedLanguage: 'All',
  searchQuery: '',
  sortBy: 'updated',
  visibleCount: CONFIG.projectsPageSize,

  STORAGE_DATA_KEY: 'ma_gh_repos_data',
  STORAGE_TIME_KEY: 'ma_gh_repos_timestamp',

  languageColors: {
    'JavaScript': '#F7DF1E',
    'HTML': '#E34F26',
    'CSS': '#1572B6',
    'TypeScript': '#3178C6',
    'Python': '#3776AB',
    'PHP': '#777BB4',
    'C++': '#00599C',
    'C#': '#239120',
    'Java': '#B07219',
    'Vue': '#4FC08D',
    'Default': '#E5A700'
  },

  // Verified Curated Showcase Projects (with active Live Demos)
  curatedRepositories: [
    {
      name: 'Muhammad-Azhan-Portfolio',
      description: 'This portfolio website, built with HTML5, CSS3, and JavaScript',
      language: 'JavaScript',
      stargazers_count: 0,
      forks_count: 0,
      updated_at: new Date().toISOString(),
      html_url: 'https://github.com/Azhan787/Muhammad-Azhan-Portfolio',
      homepage: 'https://muhammadazhan.dpdns.org',
      topics: ['portfolio', 'html', 'css', 'javascript']
    }
  ],

  init() {
    this.bindControls();
    this.loadRepositories();
  },

  bindControls() {
    const searchInput = document.getElementById('project-search-input');
    const sortSelect = document.getElementById('project-sort-select');
    const loadMoreBtn = document.getElementById('projects-load-more-btn');

    // Debounced search
    let debounceTimer;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.applyFilters();
      }, 250);
    });

    // Sort order change
    sortSelect?.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.applyFilters();
    });

    // Load More pagination
    loadMoreBtn?.addEventListener('click', () => {
      this.visibleCount += CONFIG.projectsPageSize;
      this.renderProjects();
    });
  },

  async loadRepositories() {
    const grid = document.getElementById('projects-grid');
    const loadMoreContainer = document.getElementById('projects-pagination');
    
    // Check local cache first
    const cachedData = localStorage.getItem(this.STORAGE_DATA_KEY);
    const cachedTime = localStorage.getItem(this.STORAGE_TIME_KEY);
    const now = Date.now();

    if (cachedData && cachedTime && (now - parseInt(cachedTime, 10) < CONFIG.cacheDurationMs)) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.rawRepositories = parsed;
          this.buildLanguageFilters();
          this.applyFilters();
          return;
        }
      } catch (e) {
        localStorage.removeItem(this.STORAGE_DATA_KEY);
      }
    }

    // Render skeleton loaders while fetching
    this.renderSkeletons();

    try {
      const response = await fetch(CONFIG.githubApiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API HTTP Status: ${response.status}`);
      }

      const repos = await response.json();

      if (!Array.isArray(repos) || repos.length === 0) {
        throw new Error('Empty repository payload from GitHub API');
      }

      this.rawRepositories = repos;

      // Save to localStorage cache
      localStorage.setItem(this.STORAGE_DATA_KEY, JSON.stringify(repos));
      localStorage.setItem(this.STORAGE_TIME_KEY, String(now));

      this.buildLanguageFilters();
      this.applyFilters();

    } catch (error) {
      console.warn('GitHub Repository Fetch Alert, activating resilient showcase:', error);

      // If we had stale cache, use it as fallback
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.rawRepositories = parsed;
            this.buildLanguageFilters();
            this.applyFilters();
            return;
          }
        } catch (_) {}
      }

      // Gracefully populate with verified curated showcase repositories
      this.rawRepositories = this.curatedRepositories;
      this.buildLanguageFilters();
      this.applyFilters();
    }
  },

  buildLanguageFilters() {
    const filterRow = document.getElementById('filter-pills-row');
    if (!filterRow) return;

    // Collect unique languages
    const languagesSet = new Set();
    this.rawRepositories.forEach((repo) => {
      if (repo.language) {
        languagesSet.add(repo.language);
      }
    });

    const uniqueLanguages = ['All', ...Array.from(languagesSet).sort()];

    filterRow.innerHTML = '';
    uniqueLanguages.forEach((lang) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `filter-pill ${lang === this.selectedLanguage ? 'active' : ''}`;
      button.textContent = lang;
      button.addEventListener('click', () => {
        this.selectedLanguage = lang;
        filterRow.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.applyFilters();
      });
      filterRow.appendChild(button);
    });
  },

  applyFilters() {
    let list = [...this.rawRepositories];

    // Language filter
    if (this.selectedLanguage !== 'All') {
      list = list.filter(repo => repo.language === this.selectedLanguage);
    }

    // Search query filter
    if (this.searchQuery) {
      list = list.filter(repo => {
        const name = (repo.name || '').toLowerCase();
        const desc = (repo.description || '').toLowerCase();
        const lang = (repo.language || '').toLowerCase();
        const topics = Array.isArray(repo.topics) ? repo.topics.join(' ').toLowerCase() : '';
        return name.includes(this.searchQuery) || desc.includes(this.searchQuery) || lang.includes(this.searchQuery) || topics.includes(this.searchQuery);
      });
    }

    // Sorting
    if (this.sortBy === 'stars') {
      list.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else if (this.sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: recently updated
      list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    this.filteredRepositories = list;
    this.visibleCount = CONFIG.projectsPageSize;
    this.renderProjects();
  },

  renderProjects() {
    const grid = document.getElementById('projects-grid');
    const pagination = document.getElementById('projects-pagination');
    const loadMoreBtn = document.getElementById('projects-load-more-btn');
    const counterBadge = document.getElementById('projects-count-indicator');

    if (!grid) return;

    if (this.filteredRepositories.length === 0) {
      grid.innerHTML = `
        <div class="projects-status-message">
          <div class="status-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem; color: var(--text-primary);">No Matching Repositories</h3>
          <p style="color: var(--text-muted); max-width: 420px; margin: 0 auto 1.5rem;">
            No repositories matched "${escapeHtml(this.searchQuery)}" under the selected filter.
          </p>
          <button type="button" class="btn btn-outline btn-sm" id="reset-filter-btn">Reset Filters</button>
        </div>
      `;
      document.getElementById('reset-filter-btn')?.addEventListener('click', () => {
        const searchInput = document.getElementById('project-search-input');
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        this.selectedLanguage = 'All';
        this.buildLanguageFilters();
        this.applyFilters();
      });
      if (pagination) pagination.style.display = 'none';
      if (counterBadge) counterBadge.textContent = '0 Projects';
      return;
    }

    const visibleItems = this.filteredRepositories.slice(0, this.visibleCount);

    grid.innerHTML = visibleItems.map(repo => this.createProjectCardHtml(repo)).join('');

    // Pagination controls visibility
    if (pagination) {
      if (this.visibleCount < this.filteredRepositories.length) {
        pagination.style.display = 'flex';
        if (loadMoreBtn) {
          loadMoreBtn.textContent = `Load More (${this.filteredRepositories.length - this.visibleCount} Remaining)`;
        }
      } else {
        pagination.style.display = 'none';
      }
    }

    if (counterBadge) {
      counterBadge.textContent = `${this.filteredRepositories.length} Projects Available`;
    }
  },

  createProjectCardHtml(repo) {
    const formattedDate = this.formatDate(repo.updated_at);
    const langColor = this.languageColors[repo.language] || this.languageColors.Default;
    const cleanDesc = repo.description ? escapeHtml(repo.description) : 'Curated technical project developed with clean code practices and responsive architecture.';
    const cleanName = escapeHtml(repo.name);
    
    // Live Demo resolution: Check explicit homepage first, else construct standard GitHub Pages demo URL
    let liveDemoUrl = null;
    if (repo.homepage && typeof repo.homepage === 'string' && repo.homepage.trim().startsWith('http')) {
      liveDemoUrl = escapeHtml(repo.homepage.trim());
    } else if (repo.homepage && typeof repo.homepage === 'string' && (repo.homepage.trim().startsWith('./') || repo.homepage.trim().startsWith('/'))) {
      liveDemoUrl = repo.homepage.trim();
    } else {
      const isUserSite = repo.name && repo.name.toLowerCase() === `${CONFIG.githubUsername.toLowerCase()}.github.io`;
      liveDemoUrl = isUserSite
        ? `https://${CONFIG.githubUsername.toLowerCase()}.github.io/`
        : `https://${CONFIG.githubUsername.toLowerCase()}.github.io/${encodeURIComponent(repo.name)}/`;
    }

    // Topics badges if available
    const topicsHtml = Array.isArray(repo.topics) && repo.topics.length > 0
      ? `<div class="project-topics">
          ${repo.topics.slice(0, 3).map(t => `<span class="project-topic-badge">#${escapeHtml(t)}</span>`).join('')}
         </div>`
      : '';

    return `
      <article class="project-card" aria-label="Repository: ${cleanName}">
        <div class="project-card-header">
          <div class="project-folder-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="project-stars-forks">
            <span class="stat-item" title="${repo.stargazers_count} GitHub Stars">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              ${repo.stargazers_count}
            </span>
            <span class="stat-item" title="${repo.forks_count} Forks">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="6" y1="3" x2="6" y2="15"></line>
                <circle cx="18" cy="6" r="3"></circle>
                <circle cx="6" cy="18" r="3"></circle>
                <path d="M18 9a9 9 0 0 1-9 9"></path>
              </svg>
              ${repo.forks_count}
            </span>
          </div>
        </div>

        <h3 class="project-title">
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${cleanName}</a>
        </h3>

        <p class="project-desc">${cleanDesc}</p>

        ${topicsHtml}

        <div class="project-footer">
          <div class="project-language">
            <span class="language-dot" style="background-color: ${langColor};"></span>
            <span>${repo.language || 'Technology'}</span>
            <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: 6px;">• ${formattedDate}</span>
          </div>

          <div class="project-actions">
            <button type="button" class="btn btn-primary btn-sm js-open-live-preview" data-name="${cleanName}" data-url="${liveDemoUrl}" data-repo="${repo.html_url}" aria-label="View live demo of ${cleanName}">
              <span class="live-pulse-dot" aria-hidden="true"></span>
              <span>Live Demo</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" aria-label="View source code of ${cleanName} on GitHub">
              <span>Code</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      </article>
    `;
  },

  renderSkeletons() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = Array(6).fill('<div class="skeleton-card"></div>').join('');
  },

  renderErrorState(errorMsg) {
    const grid = document.getElementById('projects-grid');
    const pagination = document.getElementById('projects-pagination');
    if (!grid) return;

    grid.innerHTML = `
      <div class="projects-status-message">
        <div class="status-icon-wrap" style="color: var(--color-accent);">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem; color: var(--text-primary);">GitHub Ecosystem Standby</h3>
        <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.5rem; font-size: 0.95rem; line-height: 1.6;">
          Direct connection to the GitHub API is temporarily rate-limited or unavailable. The rest of the portfolio remains fully active.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary btn-sm" id="retry-github-btn">
            Retry Connection
          </button>
          <a href="${CONFIG.githubProfileUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
            Visit GitHub Profile (@${CONFIG.githubUsername})
          </a>
        </div>
      </div>
    `;

    document.getElementById('retry-github-btn')?.addEventListener('click', () => {
      this.loadRepositories();
    });

    if (pagination) pagination.style.display = 'none';
  },

  formatDate(isoString) {
    if (!isoString) return 'Active';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (_) {
      return 'Recent';
    }
  }
};

/* ==========================================================================
   05. WHATSAPP & CONTACT SYSTEM
   ========================================================================== */
const ContactSystem = {
  init() {
    this.setupWhatsAppButtons();
    this.setupEmailCard();
    this.setupContactForm();
  },

  setupWhatsAppButtons() {
    const encodedMsg = encodeURIComponent(CONFIG.whatsappPrefillText);
    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMsg}`;

    const waLinks = document.querySelectorAll('.js-whatsapp-link');
    waLinks.forEach((link) => {
      link.setAttribute('href', waUrl);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  },

  setupEmailCard() {
    const copyBtn = document.getElementById('btn-copy-email');
    const copyLabel = document.getElementById('copy-btn-label');
    const emailCard = document.getElementById('email-action-card');
    const emailAddress = CONFIG.emailAddress;

    const copyToClipboard = async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(emailAddress);
        } else {
          // Fallback for older browser contexts
          const tempInput = document.createElement('input');
          tempInput.value = emailAddress;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        if (copyBtn && copyLabel) {
          copyBtn.classList.add('copied');
          copyLabel.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyLabel.textContent = 'Copy';
          }, 2500);
        }
      } catch (e) {
        console.warn('Clipboard copy error:', e);
      }
    };

    copyBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      copyToClipboard();
    });

    // Also copy when clicking card area
    emailCard?.addEventListener('click', (e) => {
      if (e.target.closest('#btn-open-email')) {
        return; // Allow direct open in Gmail
      }
      copyToClipboard();
    });
  },

  setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const feedbackBox = document.getElementById('contact-feedback');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Real-time validation helper
    const validateField = (input, testFn, errorId) => {
      const errorEl = document.getElementById(errorId);
      const isValid = testFn(input.value.trim());
      if (!isValid) {
        input.classList.add('error');
        errorEl?.classList.add('visible');
      } else {
        input.classList.remove('error');
        errorEl?.classList.remove('visible');
      }
      return isValid;
    };

    const isEmailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    nameInput?.addEventListener('input', () => validateField(nameInput, val => val.length >= 2, 'err-name'));
    emailInput?.addEventListener('input', () => validateField(emailInput, isEmailValid, 'err-email'));
    subjectInput?.addEventListener('input', () => validateField(subjectInput, val => val.length >= 3, 'err-subject'));
    messageInput?.addEventListener('input', () => validateField(messageInput, val => val.length >= 10, 'err-message'));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const v1 = validateField(nameInput, val => val.length >= 2, 'err-name');
      const v2 = validateField(emailInput, isEmailValid, 'err-email');
      const v3 = validateField(subjectInput, val => val.length >= 3, 'err-subject');
      const v4 = validateField(messageInput, val => val.length >= 10, 'err-message');

      if (!v1 || !v2 || !v3 || !v4) {
        if (feedbackBox) {
          feedbackBox.className = 'form-feedback error';
          feedbackBox.textContent = 'Please fill out all required fields properly before sending.';
          feedbackBox.style.display = 'block';
        }
        return;
      }

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = subjectInput.value.trim();
      const message = messageInput.value.trim();
      const targetEmail = CONFIG.emailAddress || 'itxazhan32@gmail.com';

      // Update hidden inputs for native form serialisation
      const hiddenSubject = document.getElementById('hidden-email-subject');
      const hiddenReplyTo = document.getElementById('hidden-email-replyto');
      if (hiddenSubject) hiddenSubject.value = `[Portfolio Inquiry] ${subject} from ${name}`;
      if (hiddenReplyTo) hiddenReplyTo.value = email;

      // Set loading state on submit button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span>Dispatching to ${targetEmail}...</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn-spinner">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.3"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
        `;
      }

      if (feedbackBox) {
        feedbackBox.style.display = 'none';
      }

      // Prepare Direct Email parameters
      const emailSubject = `[Portfolio Inquiry] ${subject} — from ${name}`;
      const emailBody = `Dear Muhammad Azhan,\n\nYou have received a new inquiry from your portfolio:\n\n• Name: ${name}\n• Email: ${email}\n• Subject: ${subject}\n\n• Message:\n${message}\n\n---\nSent directly to: ${targetEmail}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      const waText = `Hello Muhammad, I sent an inquiry from your portfolio:\n\n*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject}\n\n*Message:*\n${message}`;
      const waUrl = `https://wa.me/${CONFIG.whatsappNumber || '923701366877'}?text=${encodeURIComponent(waText)}`;

      const isFileMode = window.location.protocol === 'file:';

      const showFeedback = (title, desc, showBackupButtons = true) => {
        if (!feedbackBox) return;
        feedbackBox.className = 'form-feedback success';
        feedbackBox.innerHTML = `
          <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div>
              <div style="font-weight: 700; color: #25D366; font-size: 0.95rem; margin-bottom: 4px;">
                ${title}
              </div>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                ${desc}
              </p>
            </div>
          </div>
          ${showBackupButtons ? `
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" class="email-action-btn email-open-btn" style="padding: 7px 14px; font-size: 0.82rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>Open in Gmail</span>
            </a>
            <a href="${mailtoUrl}" class="email-action-btn" style="padding: 7px 14px; font-size: 0.82rem;">
              <span>Default Email App</span>
            </a>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="email-action-btn" style="padding: 7px 14px; font-size: 0.82rem; border-color: #25D366; color: #25D366;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              <span>Send via WhatsApp</span>
            </a>
          </div>
          ` : ''}
        `;
        feedbackBox.style.display = 'block';
      };

      try {
        if (isFileMode) {
          // Local desktop preview (file:// protocol) -> Launch direct Gmail Compose
          window.open(gmailUrl, '_blank');
          showFeedback(
            'Direct Email to itxazhan32@gmail.com Triggered!',
            `Your inquiry is pre-filled for <strong>${targetEmail}</strong>. Gmail Compose has been opened in a new tab so you can click send immediately.`
          );
          form.reset();
        } else {
          // Web server / live deployment: transmit via FormSubmit AJAX API
          const payload = {
            name: name,
            email: email,
            _replyto: email,
            subject: subject,
            _subject: emailSubject,
            message: message,
            _captcha: 'false',
            _template: 'table'
          };

          const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          const result = await response.json().catch(() => ({}));

          if (response.ok && (result.success === 'true' || result.success === true)) {
            form.reset();
            showFeedback(
              'Message Sent Directly to itxazhan32@gmail.com!',
              `Thank you, <strong>${name}</strong>. Your message has been sent directly to Muhammad Azhan's inbox.`,
              false
            );
          } else if (result.message && result.message.toLowerCase().includes('activate')) {
            // First time activation link sent to inbox
            window.open(gmailUrl, '_blank');
            showFeedback(
              'Confirmation Link Sent to itxazhan32@gmail.com',
              `FormSubmit sent an initial confirmation link to <strong>${targetEmail}</strong>. Meanwhile, Gmail Compose has been opened so your message is delivered right away!`
            );
            form.reset();
          } else {
            throw new Error(result.message || 'Server error');
          }
        }
      } catch (err) {
        console.warn('Direct delivery fallback initiated:', err);
        window.open(gmailUrl, '_blank');
        showFeedback(
          'Direct Email Dispatch to itxazhan32@gmail.com',
          `Your message has been addressed directly to <strong>${targetEmail}</strong>. Gmail Compose has opened with your inquiry pre-filled.`
        );
        form.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span>Send Inquiry Message</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          `;
        }
      }
    });
  }
};

/* ==========================================================================
   06. CV DOWNLOAD SYSTEM & INSTRUCTION MODAL
   ========================================================================== */
const CVSystem = {
  init() {
    const cvButtons = document.querySelectorAll('.js-download-cv');
    const modal = document.getElementById('cv-modal');
    const closeBtn = document.getElementById('cv-modal-close');
    const modalDirectBtn = document.getElementById('modal-direct-download');

    cvButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleDownloadRequest();
      });
    });

    closeBtn?.addEventListener('click', () => {
      modal?.classList.remove('active');
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });

    modalDirectBtn?.addEventListener('click', () => {
      this.triggerDirectFileDownload();
    });
  },

  handleDownloadRequest() {
    if (!CONFIG.cvFilename) return; // No CV file configured
    // CV download is disabled until a genuine CV file is added
    const cvLink = document.createElement('a');
    cvLink.href = CONFIG.cvFilename;
    cvLink.download = CONFIG.cvFilename;
    document.body.appendChild(cvLink);
    cvLink.click();
    document.body.removeChild(cvLink);

    // Also display the polite guidance modal for clear user feedback
    const modal = document.getElementById('cv-modal');
    modal?.classList.add('active');
  },

  triggerDirectFileDownload() {
    if (!CONFIG.cvFilename) return;
    const cvLink = document.createElement('a');
    cvLink.href = CONFIG.cvFilename;
    cvLink.download = CONFIG.cvFilename;
    document.body.appendChild(cvLink);
    cvLink.click();
    document.body.removeChild(cvLink);
  }
};

/* ==========================================================================
   07. LIVE PROJECT PREVIEW MODAL SYSTEM 
   ========================================================================== */
const LivePreviewModal = {
  modalEl: null,
  iframeEl: null,
  titleEl: null,
  urlTextEl: null,
  directLinkEl: null,
  openNewTabEl: null,
  loadingOverlayEl: null,
  frameContainerEl: null,
  currentUrl: '',

  init() {
    this.modalEl = document.getElementById('project-preview-modal');
    if (!this.modalEl) return;

    this.iframeEl = document.getElementById('preview-iframe');
    this.titleEl = document.getElementById('preview-modal-title');
    this.urlTextEl = document.getElementById('preview-url-text');
    this.directLinkEl = document.getElementById('preview-direct-link');
    this.openNewTabEl = document.getElementById('preview-open-new-tab');
    this.loadingOverlayEl = document.getElementById('preview-loading-overlay');
    this.frameContainerEl = document.getElementById('preview-viewport-frame');

    // Close button
    const closeBtn = document.getElementById('preview-modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    // Close on backdrop click
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl.classList.contains('active')) {
        this.close();
      }
    });

    // Refresh button
    const refreshBtn = document.getElementById('preview-refresh-btn');
    refreshBtn?.addEventListener('click', () => {
      if (this.iframeEl && this.currentUrl) {
        this.loadingOverlayEl?.classList.remove('hidden');
        this.iframeEl.src = this.currentUrl;
      }
    });

    // Viewport mode switchers (Desktop, Tablet, Mobile)
    const viewportButtons = this.modalEl.querySelectorAll('.viewport-btn');
    viewportButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        viewportButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.viewport;
        this.setViewportMode(mode);
      });
    });

    // Hide loading overlay on iframe finish
    this.iframeEl?.addEventListener('load', () => {
      this.loadingOverlayEl?.classList.add('hidden');
    });

    // Global listener for live demo preview buttons (Event Delegation)
    document.addEventListener('click', (e) => {
      const liveBtn = e.target.closest('.js-open-live-preview');
      if (liveBtn) {
        e.preventDefault();
        const url = liveBtn.getAttribute('data-url');
        const title = liveBtn.getAttribute('data-name') || 'Project Live Demo';
        const repoUrl = liveBtn.getAttribute('data-repo') || '';
        this.open(url, title, repoUrl);
      }
    });
  },

  open(url, title) {
    if (!this.modalEl || !url) return;
    this.currentUrl = url;

    if (this.titleEl) this.titleEl.textContent = title;
    if (this.urlTextEl) this.urlTextEl.textContent = url;
    if (this.directLinkEl) this.directLinkEl.href = url;
    if (this.openNewTabEl) this.openNewTabEl.href = url;

    // Reset viewport to desktop
    this.setViewportMode('desktop');
    this.modalEl.querySelectorAll('.viewport-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.viewport === 'desktop');
    });

    // Show loading spinner
    this.loadingOverlayEl?.classList.remove('hidden');

    // Set iframe destination
    if (this.iframeEl) {
      this.iframeEl.src = url;
    }

    // Reveal modal with luxury transition
    this.modalEl.style.display = 'flex';
    requestAnimationFrame(() => {
      this.modalEl.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  },

  close() {
    if (!this.modalEl) return;
    this.modalEl.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      this.modalEl.style.display = 'none';
      if (this.iframeEl) this.iframeEl.src = 'about:blank';
    }, 280);
  },

  setViewportMode(mode) {
    if (!this.frameContainerEl) return;
    this.frameContainerEl.classList.remove('viewport-desktop', 'viewport-tablet', 'viewport-mobile');
    this.frameContainerEl.classList.add(`viewport-${mode}`);
  }
};

/* ==========================================================================
   08. UTILITY FUNCTIONS
   ========================================================================== */
function escapeHtml(string) {
  if (!string) return '';
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}

/* ==========================================================================
   10. MOTION & ANIMATION
   Everything here is skipped when the visitor prefers reduced motion
   (the <html> element only gets the "motion" class in that case).
   ========================================================================== */
const Motion = {
  enabled: document.documentElement.classList.contains('motion'),

  init() {
    this.initScrollProgress();
    if (!this.enabled) return;
    this.splitHeroTitle();
    this.initReveal();
    this.initTilt();
  },

  // Thin yellow bar at the top that fills as the page scrolls
  initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.transform = `scaleX(${pct})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  },

  // The name rises into place word by word on page load
  splitHeroTitle() {
    const title = document.querySelector('.hero-title');
    if (!title || title.dataset.split) return;
    const text = title.textContent.trim();
    title.setAttribute('aria-label', text);
    title.dataset.split = 'true';
    title.textContent = '';
    text.split(/\s+/).forEach((word, i, arr) => {
      const outer = document.createElement('span');
      outer.className = 'hero-word';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.textContent = word;
      inner.style.animationDelay = `${0.15 + i * 0.12}s`;
      outer.appendChild(inner);
      title.appendChild(outer);
      if (i < arr.length - 1) title.appendChild(document.createTextNode(' '));
    });
  },

  // Sections and cards animate in once when they scroll into view
  initReveal() {
    const groups = [
      '.section-header',
      '.about-narrative',
      '.about-cards-grid .fact-card',
      '.skills-grid .skill-box-card',
      '.projects-controls',
      '.cv-copy',
      '.cv-preview',
      '.contact-info-panel > *',
      '.contact-methods > *',
      '.contact-form-panel',
      '.footer-top > div'
    ];

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    groups.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el, i) => this.track(el, i));
    });

    // Project cards are created after the GitHub API responds
    const grid = document.getElementById('projects-grid');
    if (grid) {
      const watchGrid = () => {
        let index = 0;
        grid.querySelectorAll('.project-card:not(.reveal)').forEach((card) => {
          this.track(card, index++);
        });
      };
      new MutationObserver(watchGrid).observe(grid, { childList: true });
      watchGrid();
    }
  },

  track(el, index) {
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${Math.min(index, 8) * 70}ms`);
    this.observer.observe(el);
  },

  // The CV card tilts toward the pointer
  initTilt() {
    const card = document.querySelector('.cv-preview');
    if (!card || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--tilt-x', `${(-y * 7).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(x * 9).toFixed(2)}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  }
};

/* ==========================================================================
   09. INITIALIZATION LIFECYCLE
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  ThemeEngine.init();
  Navigation.init();
  GitHubProjects.init();
  LivePreviewModal.init();
  ContactSystem.init();
  CVSystem.init();
  Motion.init();
});