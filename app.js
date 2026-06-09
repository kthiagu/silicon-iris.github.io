/** 
 * HERITAGE EXPLORER - UNIFIED CORE 
 */

// 1. LOCAL DATA (The "Always Works" fallback)
const LOCAL_SITES = [
    { id: "1", name: "Taj Mahal", country: "India", region: "Asia", lat: 27.1751, lon: 78.0421, desc: "A white marble mausoleum." },
    { id: "2", name: "Machu Picchu", country: "Peru", region: "Latin America", lat: -13.1631, lon: -72.5450, desc: "Inca citadel in the Andes." },
    { id: "3", name: "Colosseum", country: "Italy", region: "Europe", lat: 41.8902, lon: 12.4922, desc: "Ancient Roman amphitheatre." },
    { id: "4", name: "Petra", country: "Jordan", region: "Arab States", lat: 30.3285, lon: 35.4444, desc: "City carved into red sandstone." },
    { id: "5", name: "Great Pyramid of Giza", country: "Egypt", region: "Africa", lat: 29.9792, lon: 31.1342, desc: "Oldest of the Seven Wonders." }
];

// 2. UTILS
const Utils = {
    shuffle: (arr) => arr.sort(() => Math.random() - 0.5),
    getVisited: () => JSON.parse(sessionStorage.getItem('visited_heritage') || "[]"),
    saveVisited: (id) => {
        const v = Utils.getVisited();
        if (!v.includes(id)) { v.push(id); sessionStorage.setItem('visited_heritage', JSON.stringify(v)); }
    }
};

// 3. APP STATE
let allSites = [];
let currentSite = null;

// 4. MAIN FUNCTIONS
async function initApp() {
    console.log("App Initializing...");
    try {
        const response = await fetch('https://data.unesco.org/api/explore/v2.1/catalog/datasets/whc001/records?limit=100');
        if (!response.ok) throw new Error("API Offline");
        const data = await response.json();
        
        allSites = data.results.map((item, index) => ({
            id: item.ref_no || index.toString(),
            name: item.name_en,
            country: item.states_name_en || "Unknown",
            region: item.region_en || "Global",
            lat: item.latitude || 0,
            lon: item.longitude || 0,
            desc: item.short_description_en || ""
        }));
        console.log("UNESCO Data Loaded");
    } catch (err) {
        console.warn("Using Local Backup Data");
        allSites = LOCAL_SITES;
    }
    loadNewSite();
}

async function loadNewSite() {
    // UI References
    const loader = document.getElementById('loader');
    const card = document.getElementById('discovery-card');
    const bg = document.getElementById('site-image-bg');

    // Show Loader
    loader.classList.remove('hidden');
    card.classList.add('hidden');

    // Pick Site
    const visited = Utils.getVisited();
    let pool = allSites.filter(s => !visited.includes(s.id));
    if (pool.length === 0) { sessionStorage.clear(); pool = allSites; }
    currentSite = pool[Math.floor(Math.random() * pool.length)];

    // Fetch Wikipedia
    let wikiData = { description: currentSite.desc, thumbnail: "" };
    try {
        const query = currentSite.name.split('(')[0].trim();
        const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro&explaintext&titles=${encodeURIComponent(query)}&pithumbsize=1000&origin=*`);
        const data = await wikiRes.json();
        const page = Object.values(data.query.pages)[0];
        if (page.extract) wikiData.description = page.extract;
        if (page.thumbnail) wikiData.thumbnail = page.thumbnail.source;
    } catch (e) { console.error("Wiki error", e); }

    // Update UI Elements
    try {
        document.getElementById('site-name').innerText = currentSite.name;
        document.getElementById('site-region').innerText = currentSite.region;
        document.getElementById('site-description').innerText = wikiData.description;
        document.getElementById('visited-count').innerText = Utils.getVisited().length;
        
        const finalImg = wikiData.thumbnail || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80";
        bg.style.backgroundImage = `url('${finalImg}')`;
        
        document.getElementById('street-view-link').href = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${currentSite.lat},${currentSite.lon}`;
        
        setupQuiz();
    } catch (err) {
        console.error("UI Update Error:", err);
    }

    // CRITICAL: Hide loader and show card
    loader.classList.add('hidden');
    card.classList.remove('hidden');
    Utils.saveVisited(currentSite.id);
}

function setupQuiz() {
    const container = document.getElementById('quiz-options');
    container.innerHTML = '';
    
    const correctCountry = currentSite.country.split(',')[0].trim();
    
    // Get 3 random countries from allSites that aren't the correct one
    let others = allSites
        .map(s => s.country.split(',')[0].trim())
        .filter(c => c !== correctCountry);
    
    const distractors = Utils.shuffle([...new Set(others)]).slice(0, 3);
    const choices = Utils.shuffle([correctCountry, ...distractors]);

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.innerText = choice;
        btn.onclick = () => {
            btn.style.background = (choice === correctCountry) ? "#2ecc71" : "#e74c3c";
            btn.style.color = "white";
            if (choice !== correctCountry) alert(`This site is actually in ${correctCountry}!`);
            document.querySelectorAll('.quiz-btn').forEach(b => b.disabled = true);
        };
        container.appendChild(btn);
    });
}

// Event Listeners
document.getElementById('next-site-btn').addEventListener('click', loadNewSite);

// Start
initApp();