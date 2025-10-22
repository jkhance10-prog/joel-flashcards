// =================================================================
// FLASHCARD DATA
// =================================================================
const subjects = [
    {
        name: "Mr. Cline Vocab",
        cards: [
            { 
                term: "Cline Vocab: Cide, mal, intra, soph", 
                description: "Set of flashcards focusing on the Latin and Greek roots cide, mal, intra, and soph.",
                knowtUrl: "https://knowt.com/flashcards/756470c2-0f86-461c-924f-efe9722802b6"
            },
            { 
                term: "Cline Vocab: Hab, mis, chron, temp", 
                description: "Set of flashcards focusing on the Latin and Greek roots hab, mis, chron, and temp.",
                knowtUrl: "https://knowt.com/flashcards/1b54785b-08c7-4625-9090-c3c70b8e4043"
            },
            { 
                term: "Cline Vocab: Mor, bene, omni...", 
                description: "Set of flashcards focusing on the Latin and Greek roots mor, bene, omni, and others.",
                knowtUrl: "https://knowt.com/flashcards/2c8f9cf3-c0c7-42e1-a9a3-12fe2dec1959"
            },
        ]
    },
    {
        name: "Mr. Hodge Chemistry",
        cards: [
            { 
                term: "Hodge Chem: Unit 1 and 2 Objectives", 
                description: "Key learning objectives and definitions for Chemistry Units 1 and 2.",
                knowtUrl: "https://knowt.com/flashcards/108f2415-7e4b-408a-a9b9-e1cffb5eb015"
            },
            { 
                term: "Hodge Chem: Unit 2", 
                description: "Specific flashcards covering the core concepts of Chemistry Unit 2.",
                knowtUrl: "https://knowt.com/flashcards/6e32d56a-f8bc-4863-8256-5182a7d02f7d"
            },
            { 
                term: "Hodge Chem: Unit 3", 
                description: "Specific flashcards covering the core concepts of Chemistry Unit 3.",
                knowtUrl: "https://knowt.com/flashcards/3a391478-d695-428b-85c3-e4f33250c466"
            },
        ]
    }
];

// Get the container where all card sections will be placed
const container = document.getElementById('flashcard-container');


// =================================================================
// FLASHCARD RENDERING LOGIC
// =================================================================

// Helper function to clean the card title
function cleanCardTitle(title) {
    const prefixes = ["Cline Vocab: ", "Hodge Chem: "];
    for (const prefix of prefixes) {
        if (title.startsWith(prefix)) {
            return title.substring(prefix.length);
        }
    }
    return title;
}


function createCardElement(card) {
    // The entire card element is the anchor tag
    const cardElement = document.createElement('a');
    cardElement.href = card.knowtUrl;
    cardElement.target = "_blank"; 
    
    // Taller card height h-52 is maintained
    cardElement.className = 'block h-52 p-6 card-gradient-bg rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-primary-blue group card-glow cursor-pointer';

    const title = document.createElement('h3');
    // text-2xl size is maintained
    title.className = 'text-light-grey text-2xl font-semibold mb-2 group-hover:text-primary-blue transition-colors'; 
    title.textContent = cleanCardTitle(card.term);
    
    const cta = document.createElement('p');
    // text-base size is maintained
    cta.className = 'text-primary-blue text-base font-bold mt-auto pt-2'; 
    cta.textContent = 'Click to Study Set →';

    cardElement.appendChild(title);
    cardElement.appendChild(cta);

    return cardElement;
}


function renderFlashcards() { 
    subjects.forEach(subjectData => {
        const sectionHeader = document.createElement('h2');
        
        // Subject header uses standard Tailwind border/spacing for the line
        sectionHeader.className = 'text-2xl sm:text-3xl font-bold mt-10 mb-6 text-primary-blue border-b-2 border-primary-blue pb-2'; 
        
        sectionHeader.textContent = subjectData.name;
        container.appendChild(sectionHeader);

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

        subjectData.cards.forEach(card => {
            const cardElement = createCardElement(card);
            grid.appendChild(cardElement);
        });

        container.appendChild(grid);
    });
}


// =================================================================
// KINETIC TEXT LOGIC (MAIN HEADER)
// =================================================================

const HEADER_TEXT = "Joel's Flashcards";
const headerContainer = document.getElementById('header-text-container');
const repelRadius = 120; 
const maxRepel = 40; 
const orbitStrength = 0.5; 
let chars = []; 
let lastKnownE = null;
let ticking = false;

// OPTIMIZATION: Throttles the mousemove event using requestAnimationFrame
function handleMouseMove(e) {
    lastKnownE = e;
    if (!ticking) {
        window.requestAnimationFrame(() => {
            if (lastKnownE) {
                // Run the expensive calculation only when the browser is ready
                runKineticCalculation(lastKnownE); 
                ticking = false;
            }
        });
        ticking = true;
    }
}

function runKineticCalculation(e) {
    chars.forEach(char => {
        const rect = char.getBoundingClientRect();
        const charCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        let dx = e.clientX - charCenter.x;
        let dy = e.clientY - charCenter.y;
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
    
    chars = HEADER_TEXT.split('').map((char) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char; 
        span.className = 'kinetic-char';
        headerContainer.appendChild(span);
        return span;
    });

    // Use the throttled handler
    headerContainer.addEventListener('mousemove', handleMouseMove);
    headerContainer.addEventListener('mouseleave', handleMouseLeave);
}

function handleMouseLeave() {
    // No throttling needed here, this is a simple reset
    chars.forEach(char => {
        char.style.transform = 'translate(0, 0)';
    });
}


// Start the rendering process once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    renderFlashcards();
    initializeKineticText(); 
});