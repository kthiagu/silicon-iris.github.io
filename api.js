const API = {
    // 1. STARTER PACK (App works even if internet is down or API is 404)
    starterSites: [
        { recordid: '1', site_en: 'Taj Mahal', states_name_en: 'India', region_en: 'Asia', coordinates: [27.1751, 78.0421], short_description_en: 'An immense mausoleum of white marble, built in Agra between 1631 and 1648.' },
        { recordid: '2', site_en: 'Machu Picchu', states_name_en: 'Peru', region_en: 'Latin America', coordinates: [-13.1631, -72.5450], short_description_en: 'A 15th-century Inca citadel located in the Eastern Cordillera of southern Peru.' },
        { recordid: '3', site_en: 'Mont-Saint-Michel', states_name_en: 'France', region_en: 'Europe', coordinates: [48.6361, -1.5115], short_description_en: 'A tidal island and mainland commune in Normandy, France.' },
        { recordid: '4', site_en: 'Great Pyramid of Giza', states_name_en: 'Egypt', region_en: 'Africa', coordinates: [29.9792, 31.1342], short_description_en: 'The oldest and largest of the pyramids in the Giza pyramid complex.' },
        { recordid: '5', site_en: 'Colosseum', states_name_en: 'Italy', region_en: 'Europe', coordinates: [41.8902, 12.4922], short_description_en: 'An oval amphitheatre in the centre of the city of Rome.' },
        { recordid: '6', site_en: 'Petra', states_name_en: 'Jordan', region_en: 'Arab States', coordinates: [30.3285, 35.4444], short_description_en: 'A famous archaeological site in Jordan\'s southwestern desert.' },
        { recordid: '7', site_en: 'Statue of Liberty', states_name_en: 'United States of America', region_en: 'North America', coordinates: [40.6892, -74.0445], short_description_en: 'A colossal neoclassical sculpture on Liberty Island in New York Harbor.' },
        { recordid: '8', site_en: 'Angkor Wat', states_name_en: 'Cambodia', region_en: 'Asia', coordinates: [13.4125, 103.8670], short_description_en: 'A temple complex in Cambodia and the largest religious monument in the world.' }
    ],

    async fetchUNESCOData() {
        console.log("Attempting to fetch full database...");
        try {
            // Trying a stable GitHub mirror of the UNESCO data
            const response = await fetch('https://raw.githubusercontent.com/fomvasss/unesco-world-heritage-list/master/world-heritage-list.json');
            if (!response.ok) throw new Error("GitHub Mirror 404");
            
            const data = await response.json();
            console.log("Successfully loaded full database from GitHub");
            
            // Map the GitHub data format to our app's format
            return data.map((item, index) => ({
                recordid: index.toString(),
                site_en: item.name_en,
                states_name_en: item.states_en,
                region_en: item.region_en,
                coordinates: [parseFloat(item.latitude), parseFloat(item.longitude)],
                short_description_en: item.short_description_en
            }));
        } catch (err) {
            console.warn("External API failed. Using built-in Starter Pack Sites.");
            return this.starterSites;
        }
    },

    async getWikiDetails(siteName, country) {
        const query = siteName.split('(')[0].split(',')[0].trim();
        const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro&explaintext&titles=${encodeURIComponent(query)}&pithumbsize=1000&origin=*`;
        
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pageId === "-1") {
                // If specific site fails, try searching just the country for a generic background
                return await this.callWikiAPI(country);
            }
            
            return {
                description: pages[pageId].extract || "Exploring the history of this site...",
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