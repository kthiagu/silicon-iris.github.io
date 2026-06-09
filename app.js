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
        UI.loader.innerHTML = "<p style='color:#ffcc00; padding:20px;'>Wait, we couldn't reach the UNESCO archives. <br><br> Please check if you are connected to the internet and refresh.</p>";
        return;
    }
    
    loadNewSite();
}

async function loadNewSite() {
    UI.loader.classList.remove('hidden');
    UI.card.classList.add('hidden');

    const visited = Utils.getVisited();
    UI.count.innerText = visited.length;

    let availableSites = allSites.filter(s => !visited.includes(s.name_en)); // Using name_en as ID
    if (availableSites.length === 0) {
        sessionStorage.clear();
        availableSites = allSites;
    }

    currentSite = availableSites[Math.floor(Math.random() * availableSites.length)];
    
    // FETCH: Using name_en
    const wiki = await API.getWikiDetails(
        currentSite.name_en, 
        currentSite.states_name_en
    );

    updateUI(wiki);
}

function updateUI(wiki) {
    UI.name.innerText = currentSite.name_en;
    UI.region.innerText = currentSite.region_en;
    UI.desc.innerText = wiki?.description || currentSite.short_description_en || "No additional history available.";
    
    const imgUrl = wiki?.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80';
    UI.bg.style.backgroundImage = `url('${imgUrl}')`;
    
    // Coordinates in this dataset are usually in a geo_point_2d object
    const lat = currentSite.geo_point_2d?.lat || 0;
    const lon = currentSite.geo_point_2d?.lon || 0;
    UI.streetView.href = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}`;

    setupQuiz();

    UI.loader.classList.add('hidden');
    UI.card.classList.remove('hidden');
    Utils.saveVisited(currentSite.name_en);
}

function setupQuiz() {
    UI.quizOptions.innerHTML = '';
    const correct = currentSite.states_name_en.split(',')[0].trim();
    const distractors = Utils.generateDistractors(currentSite.states_name_en, currentSite.region_en, allSites);
    
    const choices = Utils.shuffle([correct, ...distractors]);

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.innerText = choice;
        btn.onclick = () => {
            if (choice === correct) {
                btn.classList.add('correct');
                UI.nextBtn.innerText = "Correct! Discover More →";
            } else {
                btn.classList.add('wrong');
                alert(`Not quite! This site is located in ${correct}.`);
                UI.nextBtn.innerText = "Try Another Site →";
            }
            document.querySelectorAll('.quiz-btn').forEach(b => b.disabled = true);
        };
        UI.quizOptions.appendChild(btn);
    });
}

UI.nextBtn.addEventListener('click', loadNewSite);
initApp();