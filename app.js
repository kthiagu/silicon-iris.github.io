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
    
    if (allSites.length === 0) {
        UI.loader.innerHTML = "<p style='color:red'>Failed to load UNESCO data. Please check your internet connection or try again later.</p>";
        return;
    }
    
    loadNewSite();
}

async function loadNewSite() {
    // Show loader, hide card
    UI.loader.classList.remove('hidden');
    UI.card.classList.add('hidden');

    const visited = Utils.getVisited();
    UI.count.innerText = visited.length;

    // Filter logic
    let availableSites = allSites.filter(s => !visited.includes(s.recordid));
    if (availableSites.length === 0) {
        sessionStorage.clear(); // Reset if all sites seen
        availableSites = allSites;
    }

    currentSite = availableSites[Math.floor(Math.random() * availableSites.length)];
    
    // FETCH: Using site_en instead of description
    const wiki = await API.getWikiDetails(
        currentSite.site_en, 
        currentSite.states_name_en
    );

    updateUI(wiki);
}

function updateUI(wiki) {
    // Fill in the data
    UI.name.innerText = currentSite.site_en;
    UI.region.innerText = currentSite.region_en;
    UI.desc.innerText = wiki?.description || "History details currently being archived...";
    
    // Image Handling
    const imgUrl = wiki?.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80';
    UI.bg.style.backgroundImage = `url('${imgUrl}')`;
    
    // Google Maps Link
    const lat = currentSite.coordinates?.lat || 0;
    const lon = currentSite.coordinates?.lon || 0;
    UI.streetView.href = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}`;

    setupQuiz();

    // Hide loader, show card
    UI.loader.classList.add('hidden');
    UI.card.classList.remove('hidden');
    Utils.saveVisited(currentSite.recordid);
}

function setupQuiz() {
    UI.quizOptions.innerHTML = '';
    const correct = currentSite.states_name_en;
    const distractors = Utils.generateDistractors(correct, currentSite.region_en, allSites);
    
    // Only take the first country name if there are multiple (e.g. "France, Spain")
    const cleanCorrect = correct.split(',')[0].trim();
    
    const choices = Utils.shuffle([cleanCorrect, ...distractors]);

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.innerText = choice;
        btn.onclick = () => {
            if (choice === cleanCorrect) {
                btn.classList.add('correct');
            } else {
                btn.classList.add('wrong');
                alert(`Actually, it's in ${cleanCorrect}!`);
            }
            document.querySelectorAll('.quiz-btn').forEach(b => b.disabled = true);
        };
        UI.quizOptions.appendChild(btn);
    });
}

UI.nextBtn.addEventListener('click', loadNewSite);
initApp();