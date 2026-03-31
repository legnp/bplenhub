/*
  LENS by Lis. - Interactions
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- Services Triad Logic ---
    const triadCircles = document.querySelectorAll('.triad-circle');
    const serviceTitle = document.getElementById('service-title');
    const serviceDesc = document.getElementById('service-desc');
    const serviceList = document.getElementById('service-list');
    const serviceContent = document.getElementById('service-content');

    const serviceData = {
        pessoas: {
            title: 'Para Pessoas',
            desc: 'Carreira, repertório e execução com método para destravar seu próximo passo profissional.',
            bullets: ['Mentoria de Carreira', 'Desenvolvimento de Liderança', 'Gestão de Repertório']
        },
        empresas: {
            title: 'Para Empresas',
            desc: 'Diagnóstico, estratégia e desenvolvimento organizacional para empresas que buscam impacto real.',
            bullets: ['Estruturação de RH/DHO', 'Cultura Organizacional', 'Programas de Performance']
        },
        parceiros: {
            title: 'Para Parceiros',
            desc: 'Projetos em conjunto e alavancas de impacto para consultores e parceiros de negócio.',
            bullets: ['Projetos Customizados', 'Treinamentos em Co-autoria', 'Expansão de Impacto']
        }
    };

    triadCircles.forEach(circle => {
        circle.addEventListener('click', () => {
            const type = circle.dataset.service;

            // UI Update
            triadCircles.forEach(c => c.classList.remove('active'));
            circle.classList.add('active');

            // Content Update with Animation
            serviceContent.classList.remove('fade-in');
            void serviceContent.offsetWidth; // Trigger reflow

            const data = serviceData[type];
            serviceTitle.textContent = data.title;
            serviceDesc.textContent = data.desc;
            serviceList.innerHTML = data.bullets.map(b => `<li>${b}</li>`).join('');

            serviceContent.classList.add('fade-in');
        });
    });

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            }
        });
    });

    // --- Contact Form ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;

            btn.textContent = 'Enviando...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = 'Recebido! Entraremos em contato.';
                btn.style.background = 'var(--pitaya)';
                contactForm.reset();

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }, 1000);
        });
    }

    // --- Scroll Effects ---
    const nav = document.querySelector('.site-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(7, 7, 11, 0.85)';
            nav.style.top = '10px';
        } else {
            nav.style.background = 'var(--glass-bg)';
            nav.style.top = '20px';
        }
    });
});
