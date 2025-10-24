// =================================================================
// FLASHCARD DATA
// =================================================================
const subjects = [
    {
        name: "Honors ELA 2",
        cards: [
            { term: "Roots - Cide, mal, intra, soph", knowtUrl: "https://knowt.com/flashcards/756470c2-0f86-461c-924f-efe9722802b6" },
            { term: "Roots - Hab, mis, chron, temp", knowtUrl: "https://knowt.com/flashcards/1b54785b-08c7-4625-9090-c3c70b8e4043" },
            { term: "Roots - Mor, bene, omni…", knowtUrl: "https://knowt.com/flashcards/2c8f9cf3-c0c7-42e1-a9a3-12fe2dec1959" },
        ]
    },
    {
        name: "Honors Chemistry 1",
        cards: [
            { term: "Unit 1 and 2 Objectives", knowtUrl: "https://knowt.com/flashcards/108f2415-7e4b-408a-a9b9-e1cffb5eb015" },
            { term: "Unit 2", knowtUrl: "https://youtu.be/dQw4w9WgXcQ?list=RDdQw4w9WgXcQ" },
            { term: "Unit 3", knowtUrl: "https://knowt.com/flashcards/3a391478-d695-428b-85c3-e4f33250c466" },
        ]
    }
];

const container = document.getElementById('flashcard-container');

// =================================================================
// FLASHCARD RENDERING LOGIC
// =================================================================

function cleanCardTitle(title) {
    return title; 
}

function createCardElement(card) {
    const cardElement = document.createElement('a');
    cardElement.href = card.knowtUrl;
    cardElement.target = "_blank"; 
    
    // min-h-[220px] for the flashcard look
    cardElement.className = 'block min-h-[220px] p-6 card-gradient-bg rounded-xl shadow-lg transition-all duration-300 transform border border-transparent hover:border-primary-blue group card-glow card-tilt-effect cursor-pointer flex flex-col justify-between';

    const title = document.createElement('h3');
    title.className = 'text-light-grey text-2xl font-semibold mb-2 group-hover:text-primary-blue transition-colors'; 
    title.textContent = cleanCardTitle(card.term);
    
    const cta = document.createElement('p');
    cta.className = 'text-primary-blue text-base font-bold mt-4 pt-2'; 
    cta.textContent = 'Study Knowt Set →'; 

    cardElement.appendChild(title);
    cardElement.appendChild(cta);

    return cardElement;
}

function renderFlashcards() { 
    if (!container) return;
    container.innerHTML = ''; 
    
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

const HEADER_TEXT = "Joel's Flashcards";
const headerContainer = document.getElementById('header-text-container');
const KINETIC_SETTINGS = {
    repelRadius: 120, 
    maxRepel: 40, 
    orbitStrength: 0.5
};
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
    if (!headerContainer) return;
    headerContainer.innerHTML = ''; 
    
    chars = HEADER_TEXT.split('').map((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char; 
        span.className = 'kinetic-char';

        // Split words for color application: "Joel's " (7 chars) is white, "Flashcards" (starts at index 7) is blue
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
// THEME TOGGLE LOGIC (UPDATED FOR SLIDER CHECKBOX)
// =================================================================

function applyTheme(isLight) {
    const body = document.body;
    const toggleCheckbox = document.getElementById('theme-toggle');
    
    if (isLight) {
        body.classList.add('light-mode');
        // Set checkbox state to checked
        toggleCheckbox.checked = true; 
    } else {
        body.classList.remove('light-mode');
        // Set checkbox state to unchecked
        toggleCheckbox.checked = false;
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    // Default to dark, unless saved theme is 'light'
    const isLight = savedTheme === 'light'; 
    
    // Apply initial theme
    applyTheme(isLight);
    
    // Use the 'change' event on the hidden checkbox
    document.getElementById('theme-toggle').addEventListener('change', (e) => {
        const isCurrentlyLight = e.target.checked;
        
        // Toggle the theme
        applyTheme(isCurrentlyLight);
        
        // Save the new preference
        localStorage.setItem('theme', isCurrentlyLight ? 'light' : 'dark');
    });
}

// =================================================================
// MAIN EXECUTION
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    renderFlashcards();
    initializeKineticText();
    initializeTheme(); 
});
