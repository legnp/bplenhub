// site.js — Global utilities, Navigation, and Shared Components — LENS by Lis.

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Global Prefix
    window.LENS_PREFIX = getBasePrefix();

    // 2. Load Universal Header, Footer & Social
    await Promise.all([loadHeader(), loadFooter(), loadSocial()]);

    // 2. Load dynamic content (Social & Policies)
    loadExternalData();

    // 3. Initialize UI Components
    initMobileMenu();
    initServicePopup();
});

/**
 * Universally loads header.html into #global-header
 */
async function loadHeader() {
    const headerPlaceholder = document.getElementById('global-header');
    if (!headerPlaceholder) return;

    const prefix = window.LENS_PREFIX;

    try {
        const response = await fetch(`${prefix}header.html?t=${Date.now()}`);
        if (!response.ok) throw new Error('Header load failed');
        let html = await response.text();

        // Create a temporary container to manipulate the DOM
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Fix ALL relative paths in the loaded HTML
        adjustPaths(temp, prefix);

        headerPlaceholder.innerHTML = temp.innerHTML;
        headerPlaceholder.style.width = '100%'; // Ensure full width alignment

        // Mark active link
        const currentPath = window.location.pathname;
        const links = headerPlaceholder.querySelectorAll('.nav-links a');

        links.forEach(a => {
            const href = a.getAttribute('href');
            // Check if current path ends with href or if it's a services subpage
            if (currentPath.endsWith(href) || (currentPath.includes('/service/') && href.includes('service.html'))) {
                a.classList.add('nav-active');
            }
        });

    } catch (err) {
        console.error('Error loading global header:', err);
    }
}

/**
 * Universally loads footer.html into #global-footer
 */
async function loadFooter() {
    const placeholders = document.querySelectorAll('#global-footer, .global-footer-placeholder');
    if (placeholders.length === 0) return;

    const prefix = window.LENS_PREFIX;

    try {
        const response = await fetch(`${prefix}footer.html?t=${Date.now()}`);
        if (!response.ok) throw new Error('Footer load failed');
        let html = await response.text();

        const temp = document.createElement('div');
        temp.innerHTML = html;
        adjustPaths(temp, prefix);

        placeholders.forEach(el => {
            el.innerHTML = temp.innerHTML;
            el.style.width = '100%';
        });

        // Note: applyPolicyLinks will run after this via loadExternalData()
    } catch (err) {
        console.error('Error loading global footer:', err);
    }
}

/**
 * Universally loads socialmedia.html into #global-social
 */
async function loadSocial() {
    const socialPlaceholder = document.getElementById('global-social');
    if (!socialPlaceholder) return;

    const prefix = window.LENS_PREFIX;

    try {
        const response = await fetch(`${prefix}socialmedia.html?v=${Date.now()}`);
        if (!response.ok) throw new Error('Social load failed');
        let html = await response.text();

        const temp = document.createElement('div');
        temp.innerHTML = html;
        adjustPaths(temp, prefix);

        socialPlaceholder.innerHTML = temp.innerHTML;
        socialPlaceholder.style.width = '100%';

        // Final sanity check: if applySocialLinks ran too early, we'll hit it again in loadExternalData
    } catch (err) {
        console.error('Error loading global social:', err);
    }
}

/**
 * Loads social media links from links/socialmedia.txt 
 * and policy links from policies/policies.txt
 */
async function loadExternalData() {
    const prefix = window.LENS_PREFIX;

    // Load Social Links
    try {
        const res = await fetch(`${prefix}links/socialmedia.txt?t=${Date.now()}`);
        if (res.ok) {
            const txt = await res.text();
            const socialData = parseTxtToMap(txt);
            window.siteData = socialData; // Export to global scope
            applySocialLinks(socialData);
        }
    } catch (e) { console.warn('Social links load failed', e); }

    // Load Policy Links
    try {
        const res = await fetch(`${prefix}policies/policies.txt?t=${Date.now()}`);
        if (res.ok) {
            const txt = await res.text();
            const policyLines = txt.split('\n').filter(Boolean);
            applyPolicyLinks(policyLines);
        }
    } catch (e) { console.warn('Policy links load failed', e); }
}

function getBasePrefix() {
    // Robust detection for nested pages
    const path = window.location.pathname;

    // If we're inside the /service/ folder
    if (path.includes('/service/')) {
        const parts = path.split('/');
        const serviceIdx = parts.indexOf('service');
        // Depth is number of steps to get BACK to the root where index.html lives
        // e.g., /service/parapessoas/page.html -> parts: ["", "service", "parapessoas", "page.html"]
        // serviceIdx is 1. length is 4. depth needed: 2 (../../)
        const depth = parts.length - serviceIdx - 1;
        return '../'.repeat(depth);
    }
    return '';
}

/**
 * Helper to adjust relative paths in injected HTML
 */
function adjustPaths(container, prefix) {
    if (!prefix) return;

    // Fix Images
    container.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('/')) {
            img.src = prefix + src;
        }
    });

    // Fix Anchors
    container.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('/')) {
            a.href = prefix + href;
        }
    });

    // Clean diagnostic comments or scripts
    container.innerHTML = container.innerHTML.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function parseTxtToMap(txt) {
    return parseInfoText(txt);
}

/**
 * Robust parsing for .txt files with Key: Value format
 * Supports multi-line values.
 */
function parseInfoText(text) {
    if (!text) return {};
    const lines = text.split('\n');
    const data = {};
    let currentKey = '';
    let currentValue = [];

    lines.forEach(line => {
        const match = line.match(/^([\w\s-]+):\s*(.*)/);
        if (match) {
            if (currentKey) data[currentKey] = currentValue.join('\n').trim();
            currentKey = match[1].toLowerCase().trim();
            currentValue = [match[2]];
        } else if (currentKey) {
            currentValue.push(line);
        }
    });
    if (currentKey) data[currentKey] = currentValue.join('\n').trim();
    return data;
}

/**
 * Specialized parsing for SEO metadata and body content
 */
function parseSEOText(text) {
    const seoData = {};
    if (!text) return seoData;

    const titleMatch = text.match(/<title>(.*?)<\/title>/);
    if (titleMatch) seoData.title = titleMatch[1];

    const descMatch = text.match(/<meta name="description" content="(.*?)">/);
    if (descMatch) seoData.description = descMatch[1];

    const bodyParts = text.split('[BODY - CONTEÚDO / SEO + FAQ + CTAs]');
    if (bodyParts.length > 1) {
        seoData.body = bodyParts[1].trim();
    }
    return seoData;
}

function applySocialLinks(data) {
    if (!data) return;

    // Apply to CTAs (Calendly)
    const calendlyTriggers = document.querySelectorAll('.btn-calendly-trigger');
    if (calendlyTriggers.length > 0 && data.calendly) {
        calendlyTriggers.forEach(btn => {
            btn.href = data.calendly;
            btn.target = '_blank';
            btn.rel = 'noopener';
        });
    }

    // Apply to existing CTA buttons (legacy)
    if (data.calendly) {
        document.querySelectorAll('.btn-nav-cta, .btn-convite').forEach(a => {
            a.href = data.calendly;
            a.target = '_blank';
            a.rel = 'noopener';
        });
    }

    const labels = {
        instagram: 'Instagram',
        linkedin: 'LinkedIn',
        whatsapp: 'WhatsApp',
        x: 'X'
    };
    Object.entries(labels).forEach(([key, label]) => {
        const url = data[key];
        if (!url) return;

        document.querySelectorAll(`.side-social a[aria-label="${label}"], .footer-social a[aria-label="${label}"]`).forEach(a => {
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener';
        });
    });
}

function applyPolicyLinks(lines) {
    lines.forEach(line => {
        const [label, path] = line.split(':').map(s => s.trim());
        if (!label || !path) return;

        document.querySelectorAll('.footer-links a').forEach(a => {
            if (a.textContent.toLowerCase().includes(label.toLowerCase())) {
                a.href = path;
                a.target = '_blank';
                a.rel = 'noopener';
            }
        });
    });
}

/**
 * Universal Mobile Menu Toggle
 */
function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        toggle.classList.toggle('open');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            toggle.classList.remove('open');
        }
    });
}

/**
 * Service Picker Popup Logic
 */
function initServicePopup() {
    const PICKER_ID = 'servicePicker';

    // Check if picker already in DOM
    let picker = document.getElementById(PICKER_ID);

    if (!picker) {
        const prefix = window.LENS_PREFIX || '';
        // Try to fetch from publico.html
        fetch(`${prefix}publico.html`)
            .then(r => r.ok ? r.text() : null)
            .then(html => {
                if (html) {
                    const tmp = document.createElement('div');
                    tmp.innerHTML = html;
                    const fetchedPicker = tmp.querySelector(`#${PICKER_ID}`);
                    if (fetchedPicker) {
                        document.body.appendChild(fetchedPicker);
                        setupPickerHandlers(fetchedPicker);
                    }
                }
            })
            .catch(() => { /* Silent fail */ });
    } else {
        setupPickerHandlers(picker);
    }
}

function setupPickerHandlers(picker) {
    const closeBtn = picker.querySelector('.modal-close');
    const opts = picker.querySelectorAll('.opt, .picker-card');

    const show = () => {
        picker.style.visibility = 'visible';
        picker.style.opacity = '1';
        picker.setAttribute('aria-hidden', 'false');
    };

    const hide = () => {
        picker.style.visibility = 'hidden';
        picker.style.opacity = '0';
        picker.setAttribute('aria-hidden', 'true');
    };

    // Attach to all relevant triggers
    document.querySelectorAll('a[href="service.html"], .btn-services-popup').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            show();
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', hide);
    picker.addEventListener('click', e => { if (e.target === picker) hide(); });

    // Handle options selection (standard and card-style)
    opts.forEach(o => {
        o.addEventListener('click', (e) => {
            // If it's the new style card with a link inside, we might let the link handle it
            const link = o.querySelector('a.picker-btn');
            if (link && e.target !== link) {
                location.href = link.href;
            } else if (!link) {
                const target = o.dataset.target;
                if (target) location.href = `service.html#${target}`;
            }
            hide();
        });
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hide();
    });
}

