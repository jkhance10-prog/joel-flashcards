(function() {
    // =================================================================
    // CONSTANTS
    // =================================================================
    const SELECTORS = {
        flashcardContainer: 'flashcard-container',
        headerTextContainer: 'header-text-container',
        themeToggle: 'theme-toggle',
    };

    const HEADER_TEXT = "Joel's Flashcards";

    const KINETIC_SETTINGS = {
        repelRadius: 120,
        maxRepel: 40,
        orbitStrength: 0.5
    };

    // =================================================================
    // DATA HANDLING
    // =================================================================
    async function fetchSubjects() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Could not fetch subjects:", error);
            return []; // Return empty array on error
        }
    }

    // =================================================================
    // FLASHCARD RENDERING LOGIC
    // =================================================================

    function cleanCardTitle(title) {
        return title.replace(/Roots? - /, "");
    }

    function createLink(url, text) {
        const link = document.createElement('a');
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer"; // Added for security
        link.className = 'text-primary-blue text-base font-bold';
        link.textContent = text;
        return link;
    }

    function createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'block min-h-[220px] p-6 card-gradient-bg rounded-xl shadow-lg transition-all duration-300 transform border border-transparent hover:border-primary-blue group card-glow card-tilt-effect flex flex-col justify-between';

        const title = document.createElement('h3');
        title.className = 'text-light-grey text-2xl font-semibold mb-2 group-hover:text-primary-blue transition-colors';
        title.textContent = cleanCardTitle(card.term);

        const ctaContainer = document.createElement('div');
        ctaContainer.className = 'mt-4 pt-2';

        if (card.knowtUrl) {
            ctaContainer.appendChild(createLink(card.knowtUrl, 'Study Knowt Set →'));
        }

        if (card.quizletUrl) {
            if (card.knowtUrl) {
                const separator = document.createElement('span');
                separator.className = 'text-medium-grey mx-2';
                separator.textContent = '|';
                ctaContainer.appendChild(separator);
            }
            ctaContainer.appendChild(createLink(card.quizletUrl, 'Study Quizlet Set →'));
        }

        cardElement.appendChild(title);
        cardElement.appendChild(ctaContainer);

        return cardElement;
    }

    async function renderFlashcards() {
        const container = document.getElementById(SELECTORS.flashcardContainer);
        if (!container) {
            console.error("Flashcard container not found.");
            return;
        }
        container.innerHTML = '';

        const subjects = await fetchSubjects();

        subjects.forEach(subjectData => {
            const sectionHeader = document.createElement('h2');
            sectionHeader.className = 'text-3xl sm:text-4xl font-extrabold text-primary-blue mt-10 mb-6 pb-2 border-b-2 border-primary-blue';
            sectionHeader.textContent = subjectData.name;
            container.appendChild(sectionHeader);

            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

            subjectData.cards.forEach(card => {
                grid.appendChild(createCardElement(card));
            });

            container.appendChild(grid);
        });
    }


    // =================================================================
    // KINETIC TEXT LOGIC (MAIN HEADER)
    // =================================================================

    let chars = [];
    let lastKnownE = null;
    let ticking = false;
    let mouseX = 0;
    let mouseY = 0;

    function handleMouseMove(e) {
        lastKnownE = e;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (lastKnownE) {
                    mouseX = lastKnownE.clientX;
                    mouseY = lastKnownE.clientY;
                    runKineticCalculation();
                    ticking = false;
                }
            });
            ticking = true;
        }
    }

    function runKineticCalculation() {
        const { repelRadius, maxRepel, orbitStrength } = KINETIC_SETTINGS;

        chars.forEach(char => {
            const rect = char.getBoundingClientRect();
            const charCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            let dx = mouseX - charCenter.x;
            let dy = mouseY - charCenter.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < repelRadius) {
                const repelFactor = 1 - (distance / repelRadius);
                let ux = dx / distance;
                let uy = dy / distance;
                let repelX = -ux * maxRepel * repelFactor;
                let repelY = -uy * maxRepel * repelFactor;
                let orbitX = -uy * maxRepel * orbitStrength * repelFactor;
                let orbitY = ux * maxRepel * orbitStrength * repelFactor;
                let finalX = repelX + orbitX;
                let finalY = repelY + orbitY;

                char.style.transform = `translate(${finalX}px, ${finalY}px)`;
            } else {
                char.style.transform = 'translate(0, 0)';
            }
        });
    }


    function initializeKineticText() {
        const headerContainer = document.getElementById(SELECTORS.headerTextContainer);
        if (!headerContainer) {
            console.error("Header text container not found.");
            return;
        }
        headerContainer.innerHTML = '';

        chars = HEADER_TEXT.split('').map((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.className = 'kinetic-char';

            if (index < 7) {
                span.classList.add('text-initial-white');
            } else {
                span.classList.add('text-primary-blue');
            }

            headerContainer.appendChild(span);
            return span;
        });

        headerContainer.addEventListener('mousemove', handleMouseMove);
        headerContainer.addEventListener('mouseleave', () => {
            chars.forEach(char => {
                char.style.transform = 'translate(0, 0)';
            });
        });
    }


    // =================================================================
    // THEME TOGGLE LOGIC
    // =================================================================

    function applyTheme(isLight) {
        const body = document.body;
        const toggleCheckbox = document.getElementById(SELECTORS.themeToggle);

        if (isLight) {
            body.classList.add('light-mode');
            if (toggleCheckbox) toggleCheckbox.checked = true;
        } else {
            body.classList.remove('light-mode');
            if (toggleCheckbox) toggleCheckbox.checked = false;
        }
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const isLight = savedTheme === 'light';
        applyTheme(isLight);
        const toggleCheckbox = document.getElementById(SELECTORS.themeToggle);
        if (toggleCheckbox) {
            toggleCheckbox.addEventListener('change', (e) => {
                const isCurrentlyLight = e.target.checked;
                applyTheme(isCurrentlyLight);
                localStorage.setItem('theme', isCurrentlyLight ? 'light' : 'dark');
            });
        }
    }

    // =================================================================
    // MAIN EXECUTION
    // =================================================================

    document.addEventListener('DOMContentLoaded', () => {
        try {
            renderFlashcards();
            initializeKineticText();
            initializeTheme();
        } catch (error) {
            console.error("An error occurred during initialization:", error);
        }
    });
})();