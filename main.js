document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================================================
       1. GLOBAL SETUP & LIBRARY CHECKS
       ========================================================================== */
    const hasGSAP = typeof gsap !== 'undefined';
    
    if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    } else if (hasGSAP) {
        console.warn("GSAP loaded, but ScrollTrigger is missing.");
    } else {
        console.warn("GSAP is not loaded. Animations will not run.");
    }

    /* ==========================================================================
       2. HERO SECTION ANIMATION
       ========================================================================== */
    function initHero() {
        if (!hasGSAP || !document.querySelector('.mep-hero__title')) return;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".mep-hero__title", {
            y: 50,
            opacity: 0,
            duration: 1,
            delay: 0.2
        })
        .from(".mep-hero__description", {
            y: 30,
            opacity: 0,
            duration: 0.8
        }, "-=0.4")
        .from(".mep-hero__btn", {
            scale: 0.8,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(1.7)"
        }, "-=0.2");
    }

    /* ==========================================================================
       3. ABOUT SECTION ANIMATION (#au-about-section)
       ========================================================================== */
    function initAbout() {
        const aboutSection = document.querySelector('#au-about-section');
        if (!hasGSAP || !aboutSection) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#au-about-section",
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });

        tl.to(".au-content-card", {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "power3.out"
        })
        .from(".au-heading, .au-text, .au-btn-wrapper", {
            duration: 0.8,
            y: 20,
            opacity: 0,
            stagger: 0.2,
            ease: "back.out(1.7)"
        }, "-=0.5");
    }

    /* ==========================================================================
       4. HOME PAGE SERVICES (Reads "homeServices" from JSON)
       ========================================================================== */
    function initHomeServices() {
        const track = document.querySelector('#services-track');
        // Stop if we are not on the home page (or wherever the carousel is)
        if (!track) return;

        const dotsContainer = document.querySelector('.srv-carousel-dots');
        const nextBtn = document.querySelector('.srv-carousel-btn.next');
        const prevBtn = document.querySelector('.srv-carousel-btn.prev');

        let servicesData = [];
        let currentIndex = 0;
        let sliderInterval = null;

        // Fetch Data
        fetch('services-data.json')
            .then(res => res.json())
            .then(data => {
                // IMPORTANT: Access the "homeServices" array
                if (data.homeServices) {
                    servicesData = data.homeServices;
                    renderHomeCards();
                    updateCarouselLayout();
                    setupCarouselEvents();
                } else {
                    console.error("JSON is missing 'homeServices' key.");
                }
            })
            .catch(err => console.error("Home Services Load Error:", err));

        function renderHomeCards() {
            track.innerHTML = ''; 
            if(dotsContainer) dotsContainer.innerHTML = '';

            servicesData.forEach((service, index) => {
                const card = document.createElement('article');
                card.className = 'srv-card'; 
                card.innerHTML = `
                    <div class="srv-icon-box">
                        <i class="${service.icon || 'fa-solid fa-layer-group'}"></i>
                    </div>
                    <h3 class="srv-card-title">${service.title}</h3>
                    <p class="srv-card-desc">${service.homePageDescription}</p>
                    <a href="services.html" class="srv-btn">
                        Read More <i class="fa-solid fa-arrow-right" style="margin-left:5px; font-size:12px;"></i>
                    </a>
                `;
                track.appendChild(card);

                if (dotsContainer) {
                    const dot = document.createElement('span');
                    dot.className = `srv-dot ${index === 0 ? 'active' : ''}`;
                    dot.dataset.index = index;
                    dotsContainer.appendChild(dot);
                }
            });
        }

        function updateCarouselLayout() {
            const isMobile = window.innerWidth <= 992;
            
            if (!isMobile) {
                // Desktop Grid
                track.style.display = 'grid';
                track.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
                track.style.gap = '20px';
                track.style.transform = 'none';
                
                // Desktop Animation
                if (hasGSAP) {
                    gsap.from("#services-track .srv-card", {
                        scrollTrigger: {
                            trigger: "#services-track",
                            start: "top 80%",
                        },
                        y: 50,
                        opacity: 0,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: "power2.out"
                    });
                }
            } else {
                // Mobile Carousel
                track.style.display = 'flex';
                track.style.gap = '0';
                setupMobileCarousel();
            }
        }

        function setupMobileCarousel() {
            const cards = document.querySelectorAll('#services-track .srv-card');
            if(cards.length === 0) return;
            
            const wrapper = document.querySelector('.srv-carousel-wrapper');
            const width = wrapper.offsetWidth;
            
            cards.forEach(card => {
                card.style.minWidth = `${width}px`;
                card.style.marginRight = '0px'; 
            });
            startAutoplay();
        }

        function startAutoplay() {
            if(sliderInterval) clearInterval(sliderInterval);
            sliderInterval = setInterval(() => moveCarousel(1), 3000);
        }

        function moveCarousel(direction) {
            const cards = document.querySelectorAll('#services-track .srv-card');
            if(cards.length === 0) return;

            currentIndex += direction;
            if (currentIndex >= cards.length) currentIndex = 0;
            if (currentIndex < 0) currentIndex = cards.length - 1;

            const wrapper = document.querySelector('.srv-carousel-wrapper');
            const width = wrapper.offsetWidth;
            
            track.style.transition = 'transform 0.5s ease';
            track.style.transform = `translateX(-${currentIndex * width}px)`;

            document.querySelectorAll('.srv-dot').forEach(d => d.classList.remove('active'));
            const activeDot = document.querySelector(`.srv-dot[data-index="${currentIndex}"]`);
            if(activeDot) activeDot.classList.add('active');
        }

        function setupCarouselEvents() {
            if(nextBtn) nextBtn.onclick = () => { moveCarousel(1); startAutoplay(); };
            if(prevBtn) prevBtn.onclick = () => { moveCarousel(-1); startAutoplay(); };
            
            window.addEventListener('resize', () => {
                updateCarouselLayout();
                currentIndex = 0;
            });
        }
    }

    /* ==========================================================================
       5. SERVICES PAGE CONTENT (Reads "servicesPage" from JSON)
       ========================================================================== */
    function initServicesPage() {
        const container = document.querySelector('.srv-container');
        
        // Safety Check 1: Ensure container exists
        if (!container) return;
        
        // Safety Check 2: Ensure we are NOT on the Index Page
        // The Index page has #services-track. The Services page does not.
        if (document.querySelector('#services-track')) return; 

        fetch('services-data.json')
            .then(res => res.json())
            .then(data => {
                // IMPORTANT: Access the "servicesPage" array
                if (data.servicesPage) {
                    const pageData = data.servicesPage;
                    container.innerHTML = '';

                    pageData.forEach((service, index) => {
                        const card = document.createElement('article');
                        // Zig-zag colors
                        const bgClass = (index % 3 === 2) ? 'srv-bg-purple' : 'srv-bg-pink'; 
                        card.className = `srv-card ${bgClass}`;
                        
                        card.innerHTML = `
                            <div class="srv-text-content">
                                <h3>${service.title}</h3>
                                <p>${service.description}</p>
                            </div>
                            <div class="srv-img-wrapper">
                                <img src="${service.image}" alt="${service.title}">
                            </div>
                        `;
                        container.appendChild(card);
                    });
                    
                    animateServicesPage();
                } else {
                    console.error("JSON is missing 'servicesPage' key.");
                }
            })
            .catch(err => console.error("Services Page Load Error:", err));
    }

    function animateServicesPage() {
        if (!hasGSAP) return;
        
        // Animate Hero Title on Services Page
        gsap.from(".srv-main-title", {
            duration: 1.2, y: -50, opacity: 0, ease: "power3.out"
        });

        const cards = document.querySelectorAll(".srv-container .srv-card");
        cards.forEach((card, index) => {
            // Zig-zag slide direction
            let xValue = index % 2 === 0 ? -50 : 50;
            
            gsap.fromTo(card, 
                { opacity: 0, x: xValue, y: 30 },
                {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    },
                    opacity: 1, x: 0, y: 0, duration: 1, ease: "power3.out"
                }
            );
        });
    }

    /* ==========================================================================
       6. TESTIMONIALS & CLIENTS
       ========================================================================== */
    function initTestimonials() {
        if (!hasGSAP) return;

        // Animate Section Title
        if (document.querySelector(".section-title-unique")) {
            gsap.from(".section-title-unique", {
                scrollTrigger: {
                    trigger: ".section-title-unique",
                    start: "top 85%"
                },
                opacity: 0, y: -50, duration: 1, ease: "power3.out"
            });
        }

        // Animate Cards
        const cards = document.querySelectorAll(".testimonial-card-unique");
        if (cards.length > 0) {
            gsap.from(cards, {
                scrollTrigger: {
                    trigger: cards[0], 
                    start: "top 85%"
                },
                opacity: 0, y: 50, duration: 0.8, ease: "power2.out", stagger: 0.2
            });

            cards.forEach(card => {
                card.addEventListener('mouseenter', () => gsap.to(card, { scale: 1.02, duration: 0.2 }));
                card.addEventListener('mouseleave', () => gsap.to(card, { scale: 1, duration: 0.2 }));
            });
        }
    }

    function initClients() {
        const logos = document.querySelectorAll('.slide img');
        logos.forEach(logo => {
            logo.addEventListener('click', () => {
                const clientName = logo.alt.replace(' Logo', '');
                console.log(`Clicked client: ${clientName}`);
            });
        });
    }

    /* ==========================================================================
       7. QUOTE ANIMATION
       ========================================================================== */
    function initQuote() {
        const quoteTextElement = document.querySelector('.quote-text');
        if (!quoteTextElement) return;

        const text = quoteTextElement.textContent;
        quoteTextElement.textContent = ''; 
        
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            quoteTextElement.appendChild(span);
        });

        const startAnimation = () => {
            const charSpans = quoteTextElement.querySelectorAll('span');
            charSpans.forEach((span, index) => {
                setTimeout(() => {
                    span.classList.add('visible');
                }, index * 30);
            });
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAnimation();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(quoteTextElement);
    }

    /* ==========================================================================
       8. LEGACY / FALLBACK ANIMATIONS
       ========================================================================== */
    function initLegacyScroll() {
        const boxes = document.querySelectorAll('.service-box');
        if (boxes.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        boxes.forEach(box => observer.observe(box));
    }

    /* ==========================================================================
       9. ABOUT PAGE CONTENT (Specific to About Page)
       ========================================================================== */
    function initAboutPageContent() {
        if (!hasGSAP || !document.querySelector('#about-hero')) return;

        gsap.from(".about-hero__title", {
            duration: 1.2, y: 50, opacity: 0, ease: "power3.out"
        });

        gsap.from("#who-we-are .section-title, #who-we-are .section-desc", {
            scrollTrigger: {
                trigger: "#who-we-are",
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            y: 30, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out"
        });

        const mvTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: "#mission-vision",
                start: "top 75%",
            }
        });

        mvTimeline.from(".mission-card", {
            x: -50, opacity: 0, duration: 0.8, ease: "power2.out"
        })
        .from(".vision-card", {
            x: 50, opacity: 0, duration: 0.8, ease: "power2.out"
        }, "-=0.6");

        gsap.from(".offer-item", {
            scrollTrigger: {
                trigger: "#what-we-offer",
                start: "top 80%",
            },
            y: 40, opacity: 0, duration: 0.6, stagger: 0.15, ease: "back.out(1.7)"
        });
    }

    /* ==========================================================================
       INITIALIZE ALL
       ========================================================================== */
    initHero();
    initAbout();
    
    // Services Initialization
    initHomeServices();    // Runs on Index Page
    initServicesPage();    // Runs on Services Page
    
    initTestimonials();
    initClients();
    initQuote();
    initLegacyScroll();
    initAboutPageContent();
});