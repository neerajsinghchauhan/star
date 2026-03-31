/**
 * Star Theme Manager
 * Handles Light/Dark mode transitions
 */

const ThemeManager = {
    init() {
        this.toggleBtn = document.getElementById('themeToggle');
        this.html = document.documentElement;
        this.iconSun = document.querySelector('.icon-sun');
        this.iconMoon = document.querySelector('.icon-moon');

        // Check local storage or system preference
        const savedTheme = localStorage.getItem('star-theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme(systemDark ? 'dark' : 'light');
        }

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }
    },

    setTheme(theme) {
        this.html.setAttribute('data-theme', theme);
        localStorage.setItem('star-theme', theme);
        this.updateIcons(theme);
    },

    toggle() {
        const current = this.html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';

        // Add transition class to body temporarily for smooth color switch
        document.body.classList.add('theme-transition');
        this.setTheme(next);

        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 500);
    },

    updateIcons(theme) {
        if (!this.iconSun || !this.iconMoon) return;

        if (theme === 'dark') {
            this.iconSun.style.display = 'block';
            this.iconMoon.style.display = 'none';
        } else {
            this.iconSun.style.display = 'none';
            this.iconMoon.style.display = 'block';
        }
    }
};

const PwaManager = {
    init() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome from automatically showing the mini-infobar
            e.preventDefault();
            // Stash the event so it can be triggered later
            deferredPrompt = e;
            // Show our custom Install button in the UI
            this.showInstallButton(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            this.hideInstallButton();
            deferredPrompt = null;
            console.log('PWA was installed');
        });
    },

    showInstallButton(deferredPrompt) {
        if (document.getElementById('pwaInstallBtn')) return;

        const navActions = document.querySelector('.navbar > div');
        if (!navActions) return;

        const btn = document.createElement('button');
        btn.id = 'pwaInstallBtn';
        btn.className = 'btn-ghost';
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span style="margin-left: 0.5rem; font-weight: 600;">Install App</span>
        `;
        
        // Highlight it beautifully
        btn.style.borderColor = 'var(--accent)';
        btn.style.color = 'var(--accent)';
        btn.style.background = 'var(--accent-glow)';

        btn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') this.hideInstallButton();
            deferredPrompt = null;
        });

        // Insert at the beginning of the button row
        navActions.insertBefore(btn, navActions.firstChild);
    },

    hideInstallButton() {
        const btn = document.getElementById('pwaInstallBtn');
        if (btn) btn.remove();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    PwaManager.init();
    
    // Register Service Worker for PWA installability everywhere
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW registration failed:', err));
        });
    }
});
