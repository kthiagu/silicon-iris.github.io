let allSites = [];
let currentSite = null;

const UI = {
    loader: document.getElementById('loader'),
    card: document.getElementById('discovery-card'),
    bg: document.getElementById('site-image-bg'),
    name: document.getElementById('site-name'),
    desc: document.getElementById('site-description'),
    region: document.getElementById('site-region'),
    quizOptions: document.getElementById('quiz-options'),
    streetView: document.getElementById('street-view-link'),
    nextBtn: document.getElementById('next-site-btn'),
    count: document.getElementById('visited-count')
};

async function initApp() {
    allSites = await API.fetchUNESCOData();
    loadNewSite();
}

async function loadNewSite() {
    UI.loader.classList.remove('hidden');
    UI.card.classList.add('hidden');

    const visited = Utils.getVisited();
    UI.count.innerText = visited.length;

    let availableSites = allSites.filter(s => !visited.includes(s.id));
    if (availableSites.length === 0) {
        sessionStorage.clear();
        availableSites = allSites;
    }

    currentSite = availableSites[Math.floor(Math.random() * availableSites.length)];
    const wiki = await API.getWikiDetails(currentSite.name, currentSite.country);
    updateUI(wiki);
}

function updateUI(wiki) {
    UI.name.innerText = currentSite.name;
    UI.region.innerText = currentSite.region;
    UI.desc.innerText = wiki?.description || currentSite.info || "Discovering history...";
    
    const imgUrl = wiki?.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80';
    UI.bg.style.backgroundImage = `url('${imgUrl}')`;
    
    UI.streetView.href = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${currentSite.lat},${currentSite.lon}`;

    setupQuiz();

    UI.loader.classList.add('hidden');
    UI.card.classList.remove('hidden');
    Utils.saveVisited(currentSite.id);
}

function setupQuiz() {
    UI.quizOptions.innerHTML = '';
    // Handle cases where country field has multiple countries like "France, Italy"
    const correct = currentSite.country.split(',')[0].split(';')[0].trim();
    
    // Distractor logic
    const sameRegion = allSites.filter(s => s.region === currentSite.region && s.country !== currentSite.country);
    const distractorNames = [...new Set(sameRegion.map(s => s.country.split(',')[0].trim()))];
    const finalDistractors = Utils.shuffle(distractorNames).slice(0, 3);
    
    const choices = Utils.shuffle([correct, ...finalDistractors]);

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.innerText = choice;
        btn.onclick = () => {
            if (choice === correct) {
                btn.style.background = "#2ecc71";
                btn.style.borderColor = "#2ecc71";
            } else {
                btn.style.background = "#e74c3c";
                btn.style.borderColor = "#e74c3c";
                alert(`The correct country is ${correct}`);
            }
            document.querySelectorAll('.quiz-btn').forEach(b => b.disabled = true);
        };
        UI.quizOptions.appendChild(btn);
    });
}

UI.nextBtn.addEventListener('click', loadNewSite);
initApp();