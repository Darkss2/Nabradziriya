document.addEventListener('DOMContentLoaded', () => {
    // ===== Mobile Navigation (Hamburger Menu) =====
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const mainNav = document.querySelector('.main-nav');

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('is-open');
        });
    }

    // ===== Theme Switcher =====
    const themeSwitcher = document.querySelector('.theme-switcher');
    const body = document.body;
    const logoImg = document.getElementById('site-logo');

    const applyTheme = (theme) => {
        if (theme === 'light') {
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
            if (logoImg) logoImg.src = 'dark.png';
        } else {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            if (logoImg) logoImg.src = 'white.png';
        }
        localStorage.setItem('theme', theme);
    };

    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const newTheme = body.classList.contains('dark-theme') ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    // ===== Slider Button Controls (Video Editing, Logo, UGC, Landing Page) =====
    const scrollButtons = document.querySelectorAll('.scroll-btn');
    scrollButtons.forEach(button => {
        button.addEventListener('click', () => {
            const slider = button.parentElement.querySelector('.preview-slider');
            if (!slider) return;
            const scrollAmount = 300;
            if (button.classList.contains('left')) {
                slider.scrollLeft -= scrollAmount;
            } else {
                slider.scrollLeft += scrollAmount;
            }
        });
    });

    // ===== DESIGN SECTION (Grid + Zoom with Slider Arrows) =====
    const designCards = document.querySelectorAll('.design-card, .logo-card, .landing-page-card');
    const modalOverlay = document.querySelector('.modal-overlay');
    const arrowsContainer = document.querySelector('.design-arrows');
    const prevBtn = arrowsContainer.querySelector('.left');
    const nextBtn = arrowsContainer.querySelector('.right');

    const wiggleAngles = [-3, -1, 0, 2, 3];
    designCards.forEach((card, index) => {
        card.style.setProperty('--angle', `${wiggleAngles[index % wiggleAngles.length]}deg`);
    });

    let currentIndex = null;

    const showCard = (index) => {
        designCards.forEach(c => {
            c.classList.remove('zoomed');
            c.style.animationPlayState = "running";
        });
        const card = designCards[index];
        card.classList.add('zoomed');
        card.style.animationPlayState = "paused";
        modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
        currentIndex = index;
    };

    const closeZoom = () => {
        designCards.forEach(c => {
            c.classList.remove('zoomed');
            c.style.animationPlayState = "running";
        });
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
        currentIndex = null;
    };

    designCards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (!card.classList.contains('zoomed')) {
                showCard(index);
                e.stopPropagation();
            }
        });
    });

    modalOverlay.addEventListener('click', () => {
        closeZoom();
    });

    document.addEventListener('keydown', (e) => {
        if (currentIndex === null) return;
        if (e.key === "Escape") { closeZoom(); } 
        else if (e.key === "ArrowLeft") { showCard((currentIndex - 1 + designCards.length) % designCards.length); } 
        else if (e.key === "ArrowRight") { showCard((currentIndex + 1) % designCards.length); }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex !== null) { showCard((currentIndex - 1 + designCards.length) % designCards.length); }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex !== null) { showCard((currentIndex + 1) % designCards.length); }
    });

    // ===================================
    // === VOICE OVER PLAYER LOGIC ===
    // ===================================
    const allPlayers = document.querySelectorAll('.vo-player-card');

    allPlayers.forEach(player => {
        const audio = player.querySelector('audio');
        const playBtn = player.querySelector('.play-pause-btn');
        const progressBar = player.querySelector('.progress-bar');
        const progressBarFill = player.querySelector('.progress-bar-fill');
        const timeDisplay = player.querySelector('.time-display');

        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        };

        audio.addEventListener('loadedmetadata', () => {
            if (audio.duration) {
                timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
            }
        });

        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isPlaying = player.classList.contains('is-playing');

            if (isPlaying) {
                audio.pause();
            } else {
                allPlayers.forEach(otherPlayer => {
                    if (otherPlayer !== player) {
                        otherPlayer.querySelector('audio').pause();
                        otherPlayer.classList.remove('is-playing');
                    }
                });
                audio.play();
            }
            player.classList.toggle('is-playing');
        });

        audio.addEventListener('timeupdate', () => {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressBarFill.style.width = `${progressPercent}%`;
            timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        });

        audio.addEventListener('ended', () => {
            player.classList.remove('is-playing');
            progressBarFill.style.width = '0%';
            timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
        });

        progressBar.addEventListener('click', (e) => {
            const barWidth = progressBar.clientWidth;
            const clickX = e.offsetX;
            audio.currentTime = (clickX / barWidth) * audio.duration;
        });
    });

    // =========================================================
    // === NEW: "FIND MORE" ANIMATION ON SCROLL ===
    // =========================================================
    const sections = document.querySelectorAll('.portfolio-category');
    const animationDelay = 30000; // 30 seconds

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const findMoreLink = entry.target.querySelector('.find-more');
            if (!findMoreLink) return;

            // Clear any existing timer when the element's state changes
            const existingTimeoutId = findMoreLink.dataset.timeoutId;
            if (existingTimeoutId) {
                clearTimeout(parseInt(existingTimeoutId));
            }

            if (entry.isIntersecting) {
                // When section enters the view, set a timer to add the animation class
                const timeoutId = setTimeout(() => {
                    findMoreLink.classList.add('animate');
                }, animationDelay);
                findMoreLink.dataset.timeoutId = timeoutId;
            } else {
                // When section leaves the view, remove the animation class immediately
                findMoreLink.classList.remove('animate');
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the section is visible
    });

    sections.forEach(section => {
        observer.observe(section);
    });
});
