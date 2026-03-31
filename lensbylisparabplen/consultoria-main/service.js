// service.js — Logic for service.html (Dynamic loading, Tabs, Modals)

document.addEventListener('DOMContentLoaded', () => {
    // 1. Tab switching (Pessoas / Empresas / Parceiros)
    const toggleBtns = document.querySelectorAll('.section-toggle .toggle-btn');
    const subsections = document.querySelectorAll('.subsection');

    function activateTab(tabId) {
        if (!tabId) return;
        const btn = document.querySelector(`.section-toggle .toggle-btn[data-tab="${tabId}"]`);
        const section = document.getElementById(tabId);
        if (!btn || !section) return;
        toggleBtns.forEach(b => b.classList.remove('active'));
        subsections.forEach(s => s.classList.remove('active-sub'));
        btn.classList.add('active');
        section.classList.add('active-sub');
    }

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            activateTab(tabId);
            history.replaceState(null, null, `#${tabId}`);
        });
    });

    // 2. Business internal sub-tabs (Carreira / Analytics / Cultura)
    const bizBtns = document.querySelectorAll('.biz-toggle .biz-btn');
    const bizPanels = document.querySelectorAll('.biz-panel');

    bizBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            bizBtns.forEach(b => b.classList.remove('active'));
            bizPanels.forEach(p => p.classList.remove('active-biz'));
            btn.classList.add('active');
            const panelId = btn.dataset.biz;
            const panel = document.querySelector(`.biz-panel[data-panel="${panelId}"]`);
            if (panel) panel.classList.add('active-biz');
        });
    });

    // 3. Dynamic Service Loading & Parsing
    const grids = {
        pessoas: document.getElementById('pessoas-grid'),
        carreira: document.getElementById('carreira-grid'),
        analytics: document.getElementById('analytics-grid'),
        cultura: document.getElementById('cultura-grid'),
        parceiros: document.getElementById('parceiros-grid')
    };

    const serviceMapping = {
        service1: 'pessoas', service2: 'pessoas', service3: 'pessoas', service4: 'pessoas',
        service5: 'carreira', service6: 'carreira', service7: 'carreira', service8: 'carreira',
        service9: 'analytics', service10: 'analytics',
        service11: 'cultura', service12: 'cultura'
    };

    const productPageMapping = {
        service1: 'service/parapessoas/analise-comportamental.html'
    };

    // Use global parsing utilities from site.js

    async function loadServices() {
        for (let i = 1; i <= 12; i++) {
            const serviceKey = `service${i}`;
            const path = `assets/service/${serviceKey}/`;
            const section = serviceMapping[serviceKey];
            const grid = grids[section];

            if (!grid) continue;

            try {
                const infoRes = await fetch(`${path}infos.txt`);
                if (!infoRes.ok) continue; // Skip if folder/file doesn't exist
                const infoText = await infoRes.text();
                const info = parseInfoText(infoText);

                const seoRes = await fetch(`${path}seo.txt`);
                let seo = {};
                if (seoRes.ok) {
                    const seoText = await seoRes.text();
                    seo = parseSEOText(seoText);
                }

                renderServiceCard(grid, serviceKey, info, seo);
            } catch (err) {
                console.warn(`Could not load ${serviceKey}`, err);
            }
        }
    }

    function renderServiceCard(grid, id, info, seo) {
        const card = document.createElement('article');
        card.className = 'product-card fade-in';
        card.innerHTML = `
            <div class="card-media">
                <img src="assets/service/${id}/img.png" alt="${info['img description'] || info.name}" loading="lazy">
            </div>
            <div class="card-body">
                <h4 class="card-title">${info.name}</h4>
                <p class="card-desc">${info['description preview']}</p>
            </div>
            <div class="card-footer">
                <div class="price">${info.price || 'Sob consulta'}</div>
                <div class="pay">${info['pay format'] || '-'}</div>
            </div>
            <div class="card-actions">
                ${productPageMapping[id] ? `<a href="${productPageMapping[id]}" class="btn btn-glass btn-sm">Saber mais</a>` : ''}
                <a class="btn btn-primary btn-sm" href="${info.link || '#'}" target="_blank">Contratar</a>
            </div>
        `;

        grid.appendChild(card);
    }

    async function loadPartners() {
        const grid = grids.parceiros;
        if (!grid) return;

        // Assuming 7 partners based on folder structure
        for (let i = 1; i <= 7; i++) {
            const partnerId = `parceiro${i}`;
            const path = `assets/parceiros/${partnerId}/`;

            try {
                const res = await fetch(`${path}info.json`);
                if (!res.ok) continue;
                const info = await res.json();
                renderPartnerCard(grid, partnerId, info);
            } catch (err) {
                console.warn(`Could not load ${partnerId}`, err);
            }
        }
    }

    function renderPartnerCard(grid, id, info) {
        const card = document.createElement('article');
        card.className = 'product-card fade-in'; // Reusing product-card style for consistency
        card.innerHTML = `
            <div class="card-media partner-media">
                <img src="assets/parceiros/${id}/fotoperfil.jpg" alt="${info.nome}" onerror="this.src='assets/parceiros/logo-placeholder.png'" loading="lazy">
            </div>
            <div class="card-body">
                <h4 class="card-title">${info.nome}</h4>
                <p class="card-desc">${info.descricao}</p>
            </div>
            <div class="card-footer" style="display: flex; justify-content: center;">
                ${(!info.site || info.site === '-')
                ? `<a class="btn btn-primary btn-sm btn-calendly-trigger" href="${window.siteData?.calendly || '#'}" target="_blank">Agendar conversa</a>`
                : `<a class="btn btn-glass btn-sm" href="${info.site}" target="_blank">Visitar Website</a>`
            }
            </div>
        `;
        grid.appendChild(card);
    }


    // 5. Initial Load
    loadServices();
    loadPartners();

    const initialHash = location.hash.replace('#', '');
    if (initialHash) activateTab(initialHash);
    window.addEventListener('hashchange', () => {
        const hash = location.hash.replace('#', '');
        if (hash) activateTab(hash);
    });
});
