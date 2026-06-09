const API = {
    // A larger, more diverse starter pack in case of network issues
    starterSites: [
        { id: '1', name: 'Taj Mahal', country: 'India', region: 'Asia', lat: 27.1751, lon: 78.0421, info: 'An immense mausoleum of white marble.' },
        { id: '2', name: 'Machu Picchu', country: 'Peru', region: 'Latin America', lat: -13.1631, lon: -72.5450, info: 'A 15th-century Inca citadel.' },
        { id: '3', name: 'Mont-Saint-Michel', country: 'France', region: 'Europe', lat: 48.6361, lon: -1.5115, info: 'A tidal island and mainland commune in Normandy.' },
        { id: '4', name: 'Great Pyramid of Giza', country: 'Egypt', region: 'Africa', lat: 29.9792, lon: 31.1342, info: 'The oldest and largest of the pyramids.' },
        { id: '5', name: 'Colosseum', country: 'Italy', region: 'Europe', lat: 41.8902, lon: 12.4922, info: 'An oval amphitheatre in the centre of Rome.' },
        { id: '6', name: 'Petra', country: 'Jordan', region: 'Arab States', lat: 30.3285, lon: 35.4444, info: 'A famous archaeological site in Jordan.' },
        { id: '7', name: 'Statue of Liberty', country: 'United States', region: 'North America', lat: 40.6892, lon: -74.0445, info: 'A colossal neoclassical sculpture in NYC.' },
        { id: '8', name: 'Angkor Wat', country: 'Cambodia', region: 'Asia', lat: 13.4125, lon: 103.8670, info: 'Largest religious monument in the world.' }
    ],

    async fetchUNESCOData() {
        // This is a stable, public JSON mirror of the UNESCO list (over 1,000 sites)
        const DATAHUB_URL = 'https://pkgstore.datahub.io/core/unesco-world-heritage-sites/unesco-world-heritage-sites_json/data/78393e96191c98a58d34190c13745330/unesco-world-heritage-sites_json.json';
        
        console.log("Fetching full heritage database...");
        try {
            const response = await fetch(DATAHUB_URL);
            if (!response.ok) throw new Error("DataHub Mirror Unreachable");
            
            const data = await response.json();
            console.log(`Success! Loaded ${data.length} sites.`);

            // We map the data to a consistent format regardless of source
            return data.map((item, index) => ({
                id: index.toString(),
                name: item.site || item.name_en,
                country: item.states || item.states_name_en,
                region: item.region || item.region_en,
                // Some APIs use a string "lat,lon", others use separate fields
                lat: item.latitude || (item.coordinates ? item.coordinates.split(',')[0] : 0),
                lon: item.longitude || (item.coordinates ? item.coordinates.split(',')[1] : 0),
                info: item.short_description || item.short_description_en || ""
            }));
        } catch (err) {
            console.warn("API failed, using Starter Pack:", err.message);
            return this.starterSites;
        }
    },

    async getWikiDetails(siteName, country) {
        // Clean the name for Wikipedia (e.g., remove "Historic Centre of...")
        const cleanName = siteName.split('(')[0].split(',')[0].trim();
        const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro&explaintext&titles=${encodeURIComponent(cleanName)}&pithumbsize=1000&origin=*`;
        
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pageId === "-1") {
                // If the specific site fails, search for the Country as a fallback image
                return await this.callWikiAPI(country);
            }
            
            return {
                description: pages[pageId].extract,
                thumbnail: pages[pageId].thumbnail ? pages[pageId].thumbnail.source : null
            };
        } catch (err) {
            return null;
        }
    },

    async callWikiAPI(query) {
        const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro&explaintext&titles=${encodeURIComponent(query)}&pithumbsize=1000&origin=*`;
        const response = await fetch(endpoint);
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId === "-1") return null;
        return {
            description: pages[pageId].extract,
            thumbnail: pages[pageId].thumbnail ? pages[pageId].thumbnail.source : null
        };
    }
};