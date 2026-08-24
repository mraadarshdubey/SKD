document.addEventListener('DOMContentLoaded', () => {

    // ============ NAVIGATION ============
    // Every section of the site now has its own page. If a legacy
    // navigateTo('id') call targets a section that is not present (or is
    // hidden) on the current page, fall back to the matching page.
    const PAGES = {
        home: 'index.html',
        about: 'about.html',
        services: 'services.html',
        contact: 'contact.html',
        privacy: 'privacy.html',
        terms: 'terms.html',
        refund: 'refund.html'
    };

    window.navigateTo = function (sectionId) {
        const section = document.getElementById(sectionId);
        const isVisible = section && section.offsetParent !== null;

        if (isVisible) {
            section.scrollIntoView({ behavior: 'smooth' });
            closeMenu();
            return;
        }

        if (PAGES[sectionId]) {
            window.location.href = PAGES[sectionId];
            return;
        }

        console.error('Section not found:', sectionId);
    };


    // ============ CONTACT FORM ============
    window.handleSubmit = function (event) {
        event.preventDefault();

        const name = document.getElementById('name')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        const business = document.getElementById('business')?.value || '';
        const message = document.getElementById('message')?.value || '';

        const mailtoLink =
            `mailto:hajarekiran210@gmail.com?subject=Contact from ${encodeURIComponent(name)}` +
            `&body=Name: ${encodeURIComponent(name)}%0A` +
            `Email: ${encodeURIComponent(email)}%0A` +
            `Phone: ${encodeURIComponent(phone)}%0A` +
            `Business: ${encodeURIComponent(business)}%0A%0A` +
            `Message:%0A${encodeURIComponent(message)}`;

        window.location.href = mailtoLink;
        alert('Please send the email from your email client. Our team will respond within 24–48 hours.');

        document.getElementById('contactForm')?.reset();
    };


    // ============ 3D CANVAS BACKGROUND ============
    const canvas = document.getElementById('canvas-bg');

    if (canvas) {
        const ctx = canvas.getContext('2d');

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const particles = [];
        const particleCount = 50;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5);
                this.vy = (Math.random() - 0.5);
                this.size = Math.random() * 2 + 1;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = `rgba(0, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, 'rgba(10, 14, 39, 0.3)');
            gradient.addColorStop(0.5, 'rgba(26, 31, 58, 0.2)');
            gradient.addColorStop(1, 'rgba(10, 42, 74, 0.3)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(180, 0, 255, 0.05)';
            ctx.beginPath();
            ctx.arc(canvas.width * 0.2, canvas.height * 0.3, 300, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(0, 255, 255, 0.03)';
            ctx.beginPath();
            ctx.arc(canvas.width * 0.8, canvas.height * 0.7, 350, 0, Math.PI * 2);
            ctx.fill();

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animate);
        }

        animate();
    }


    // ============ WORKSHOP SESSION DATES ============
    // Sessions run every Sunday and Thursday at 8:00 PM IST. The page never
    // carries a hard-coded date: it works out the next two upcoming sessions on
    // every load, so 16 Aug rolls to 20 Aug, then 23 Aug, then 27 Aug, forever.
    const SESSION_WEEKDAYS = [0, 4];   // 0 = Sunday, 4 = Thursday
    const SESSION_HOUR_IST = 20;       // 8:00 PM
    const SESSION_MINUTE_IST = 0;
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

    // "Now" expressed as an IST wall clock, so every visitor sees the same date
    // regardless of the timezone their device is set to.
    function istParts() {
        const ist = new Date(Date.now() + IST_OFFSET_MS);
        return {
            year: ist.getUTCFullYear(),
            month: ist.getUTCMonth(),
            day: ist.getUTCDate(),
            minutes: ist.getUTCHours() * 60 + ist.getUTCMinutes()
        };
    }

    // The next `count` session dates from now, as UTC-midnight anchors.
    function upcomingSessions(count) {
        const now = istParts();
        const startMinutes = SESSION_HOUR_IST * 60 + SESSION_MINUTE_IST;
        const today = Date.UTC(now.year, now.month, now.day);
        const found = [];

        for (let i = 0; found.length < count && i < 30; i++) {
            const day = new Date(today + i * 86400000);
            if (!SESSION_WEEKDAYS.includes(day.getUTCDay())) continue;
            // Today only counts while the session has not started yet.
            if (i === 0 && now.minutes >= startMinutes) continue;
            found.push(day);
        }
        return found;
    }

    function formatSession(day) {
        return day.toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
        });
    }

    // Real UTC instant the session begins, used for the countdown.
    function sessionStartUtc(day) {
        return day.getTime()
            + (SESSION_HOUR_IST * 60 + SESSION_MINUTE_IST) * 60000
            - IST_OFFSET_MS;
    }

    function renderSessionDates() {
        const dateEls = document.querySelectorAll('[data-ws="date"]');
        const nextEls = document.querySelectorAll('[data-ws="next"]');
        const countdownEls = document.querySelectorAll('[data-ws="countdown"]');
        if (!dateEls.length && !nextEls.length && !countdownEls.length) return;

        const [first, second] = upcomingSessions(2);
        if (!first) return;

        dateEls.forEach(el => { el.textContent = formatSession(first); });
        if (second) nextEls.forEach(el => { el.textContent = formatSession(second); });

        function tick() {
            const remaining = sessionStartUtc(first) - Date.now();
            if (remaining <= 0) {
                // Session has begun — recompute so the page rolls to the next date.
                renderSessionDates();
                return;
            }
            const days = Math.floor(remaining / 86400000);
            const hours = Math.floor(remaining / 3600000) % 24;
            const mins = Math.floor(remaining / 60000) % 60;
            const parts = [];
            if (days) parts.push(days + (days === 1 ? ' day' : ' days'));
            parts.push(hours + ' hr', mins + ' min');
            countdownEls.forEach(el => {
                el.textContent = 'Registration closes in ' + parts.join(' · ');
            });
        }

        tick();
        clearInterval(window.__wsCountdown);
        window.__wsCountdown = setInterval(tick, 30000);
    }

    renderSessionDates();


    // ============ WORKSHOP REGISTRATION ============
    window.handleWorkshopSubmit = function (event) {
        event.preventDefault();

        const name = document.getElementById('ws-name')?.value || '';
        const phone = document.getElementById('ws-phone')?.value || '';
        const email = document.getElementById('ws-email')?.value || '';
        const business = document.getElementById('ws-business')?.value || '';
        const session = document.querySelector('[data-ws="date"]')?.textContent || '';

        const mailtoLink =
            `mailto:hajarekiran210@gmail.com?subject=${encodeURIComponent('Workshop registration - ' + name)}` +
            `&body=Session: ${encodeURIComponent(session)} at 8:00 PM IST%0A%0A` +
            `Name: ${encodeURIComponent(name)}%0A` +
            `WhatsApp: ${encodeURIComponent(phone)}%0A` +
            `Email: ${encodeURIComponent(email)}%0A` +
            `Business: ${encodeURIComponent(business)}`;

        window.location.href = mailtoLink;
        alert('Please send the email from your email client to confirm your seat. We will share the joining link on WhatsApp and email.');

        document.getElementById('workshopForm')?.reset();
    };


    // ============ MOBILE MENU ============
    // Toggled with a class instead of inline styles, so the desktop layout is
    // restored automatically when the viewport grows.
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    function closeMenu() {
        if (!navLinks) return;
        navLinks.classList.remove('open');
        mobileMenu?.setAttribute('aria-expanded', 'false');
    }

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            mobileMenu.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.addEventListener('click', (event) => {
            if (event.target.closest('a')) closeMenu();
        });
    }

});
