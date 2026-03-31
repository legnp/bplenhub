// product-page.js — Shared logic for dedicated product pages

document.addEventListener('DOMContentLoaded', async () => {
    const scriptTag = document.querySelector('script[data-service-id]');
    const serviceId = scriptTag ? scriptTag.getAttribute('data-service-id') : null;

    if (!serviceId) {
        console.error('Service ID not found in script tag.');
        return;
    }

    const path = `../../assets/service/${serviceId}/`;

    // Reusing the parsing logic
    function parseInfoText(text) {
        const lines = text.split('\n');
        const data = {};
        let currentKey = '';
        let currentValue = [];

        lines.forEach(line => {
            const match = line.match(/^([\w\s]+):\s*(.*)/);
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

    function parseSEOText(text) {
        const seoData = {};
        const titleMatch = text.match(/<title>(.*?)<\/title>/);
        if (titleMatch) seoData.title = titleMatch[1];

        const descMatch = text.match(/<meta name="description" content="(.*?)">/);
        if (descMatch) seoData.description = descMatch[1];

        const sections = text.split(/\[.*?\]/);
        const faqBlock = text.split('[BODY - CONTEÚDO / SEO + FAQ + CTAs]')[1];
        if (faqBlock) {
            seoData.body = faqBlock.trim();
        }
        return seoData;
    }

    async function loadProductData() {
        try {
            const infoRes = await fetch(`${path}infos.txt`);
            if (!infoRes.ok) throw new Error('Info file not found');
            const infoText = await infoRes.text();
            const info = parseInfoText(infoText);

            const seoRes = await fetch(`${path}seo.txt`);
            let seo = {};
            if (seoRes.ok) {
                const seoText = await seoRes.text();
                seo = parseSEOText(seoText);
            }

            injectData(info, seo);
        } catch (err) {
            console.error('Error loading product data:', err);
        }
    }

    function injectData(info, seo) {
        // Basic Info
        const titleEl = document.getElementById('productTitle');
        const introEl = document.getElementById('productIntro');
        const priceEl = document.getElementById('productPrice');
        const payEl = document.getElementById('productPay');
        const imgEl = document.getElementById('productImage');
        const buyBtn = document.getElementById('buyBtn');

        if (titleEl) titleEl.textContent = info.name;

        if (introEl) {
            const content = info['description total'] || info['description preview'] || '';
            const lines = content.split('\n').map(l => l.trim()).filter(l => l !== '');

            let htmlResult = '';
            let inList = false;

            const headersToHighlight = [
                "O que você vai levar daqui",
                "Ferramentas usadas",
                "Como funciona",
                "Entregáveis",
                "Importante"
            ];

            lines.forEach(line => {
                // Check for Headers
                const isHeader = headersToHighlight.some(h => line.toLowerCase().startsWith(h.toLowerCase()));

                // Check for Bullet Points
                if (line.startsWith('•')) {
                    if (!inList) {
                        htmlResult += '<ul class="product-list">';
                        inList = true;
                    }
                    htmlResult += `<li>${line.substring(1).trim()}</li>`;
                } else {
                    if (inList) {
                        htmlResult += '</ul>';
                        inList = false;
                    }

                    if (isHeader) {
                        htmlResult += `<h4 class="product-subtitle">${line}</h4>`;
                    } else {
                        htmlResult += `<p>${line}</p>`;
                    }
                }
            });

            if (inList) htmlResult += '</ul>';
            introEl.innerHTML = htmlResult;
        }

        if (priceEl) priceEl.textContent = info.price || 'Sob consulta';
        if (payEl) payEl.textContent = info['pay format'] || '';
        if (imgEl) {
            imgEl.src = `${path}img.png`;
            imgEl.alt = info['img description'] || info.name;
        }
        if (buyBtns.length > 0) {
            buyBtns.forEach(btn => btn.href = info.link || '#');
        }

        // SEO Content and FAQ handling
        const seoBodyEl = document.getElementById('seoBody');
        if (seoBodyEl) {
            // We no longer inject the redundant body text here as it duplicates the productIntro.
            // But we keep the container hidden if not used.
            seoBodyEl.style.display = 'none';
        }

        // FAQ
        const faqList = document.getElementById('faqList');
        const faqSectionContainer = document.getElementById('faqSection');
        if (faqList && seo.body) {
            const faqParts = seo.body.split('<section id="faq-');
            if (faqParts.length > 1) {
                const cleanFAQ = faqParts[1].split('</section>')[0].replace(/<h[12].*?>.*?<\/h[12]>/i, '');

                // Wrap Q&A in better structured div for styling
                const faqDoc = new DOMParser().parseFromString(cleanFAQ, 'text/html');
                const qs = faqDoc.querySelectorAll('h3');
                const ps = faqDoc.querySelectorAll('p');

                let faqHtml = '';
                qs.forEach((q, idx) => {
                    faqHtml += `
                        <div class="faq-item">
                            <h3 class="faq-question">${q.textContent}</h3>
                            <p class="faq-answer">${ps[idx] ? ps[idx].textContent : ''}</p>
                        </div>
                    `;
                });

                faqList.innerHTML = faqHtml;
                if (faqSectionContainer) faqSectionContainer.style.display = 'block';
            } else {
                if (faqSectionContainer) faqSectionContainer.style.display = 'none';
            }
        }

        // Meta Tags
        if (seo.title) document.title = seo.title;
        if (seo.description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = 'description';
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = seo.description;
        }
    }

    // --- Purchase & Doubts Buttons Logic ---
    const buyBtns = document.querySelectorAll('.btn-buy-trigger');
    const doubtsBtns = document.querySelectorAll('.btn-doubts-trigger');
    const doubtsModal = document.getElementById('doubtsModal');
    const closeDoubts = document.getElementById('closeDoubts');
    const optCalendly = document.getElementById('optCalendly');
    const optWhatsapp = document.getElementById('optWhatsapp');

    if (doubtsBtns.length > 0 && doubtsModal) {
        doubtsBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                doubtsModal.style.visibility = 'visible';
                doubtsModal.style.opacity = '1';
                doubtsModal.removeAttribute('aria-hidden');
                document.body.style.overflow = 'hidden';
            });
        });

        const hideDoubts = () => {
            doubtsModal.style.visibility = 'hidden';
            doubtsModal.style.opacity = '0';
            doubtsModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        if (closeDoubts) closeDoubts.addEventListener('click', hideDoubts);
        doubtsModal.addEventListener('click', (e) => {
            if (e.target === doubtsModal) hideDoubts();
        });

        // Options Actions
        if (optCalendly) {
            optCalendly.addEventListener('click', () => {
                const calendlyLink = window.siteData?.calendly || 'https://calendly.com/lenspartner';
                window.open(calendlyLink, '_blank');
                hideDoubts();
            });
        }

        if (optWhatsapp) {
            optWhatsapp.addEventListener('click', () => {
                const productName = document.getElementById('productTitle')?.textContent || "Analise Comportamental";
                const message = encodeURIComponent(`Olá, gostaria de tirar dúvida sobre o serviço ${productName}`);

                let waLink = window.siteData?.whatsapp || 'https://wa.me/5511945152088';

                // Add message parameter
                const separator = waLink.includes('?') ? '&' : '?';
                const finalLink = `${waLink}${separator}text=${message}`;

                window.open(finalLink, '_blank');
                hideDoubts();
            });
        }
    }

    loadProductData();
});
