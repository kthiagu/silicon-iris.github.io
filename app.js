let allSites = [];
let currentSite = null;

async function initApp() {
    allSites = await API.fetchUNESCOData();
    loadNewSite();
}

async function loadNewSite() {
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('discovery-card').classList.add('hidden');

    const visited = Utils.getVisited();
    let availableSites = allSites.filter(s => !visited.includes(s.id));
    if (availableSites.length === 0) {
        sessionStorage.clear();
        availableSites = allSites;
    }

    currentSite = availableSites[Math.floor(Math.random() * availableSites.length)];
    const wiki = await API.getWikiDetails(currentSite.name, currentSite.country);
    
    // UI Update
    document.getElementById('site-name').innerText = currentSite.name;
    document.getElementById('site-region').innerText = currentSite.region;
    document.getElementById('site-description').innerText = wiki?.description || currentSite.desc;
    document.getElementById('site-image-bg').style.backgroundImage = `url('${wiki?.thumbnail || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80"}')`;
    document.getElementById('street-view-link').href = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${currentSite.lat},${currentSite.lon}`;

    setupQuiz();
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('discovery-card').classList.remove('hidden');
    Utils.saveVisited(currentSite.id);
}

// Ensure the rest of setupQuiz uses clean country names for logic
function setupQuiz() {
    const container = document.getElementById('quiz-options');
    container.innerHTML = '';
    const correct = currentSite.country.split(',')[0].trim();
    
    let distractors = allSites
        .filter(s => s.region === currentSite.region && s.country !== currentSite.country)
        .map(s => s.country.split(',')[0].trim());
    
    // Ensure 3 unique distractors
    distractors = [...new Set(distractors)].sort(() => 0.5 - Math.random()).slice(0, 3);
    const choices = Utils.shuffle([correct, ...distractors]);

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.innerText = choice;
        btn.onclick = () => {
            btn.style.background = (choice === correct) ? "#2ecc71" : "#e74c3c";
            if(choice !== correct) alert(`Actually, it's in ${correct}!`);
            document.querySelectorAll('.quiz-btn').forEach(b => b.disabled = true);
        };
        container.appendChild(btn);
    });
}

document.getElementById('next-site-btn').addEventListener('click', loadNewSite);
initApp();