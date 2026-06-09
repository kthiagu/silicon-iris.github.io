const API = {
    async fetchUNESCOData() {
        // The most official current UNESCO endpoint
        const OFFICIAL_URL = 'https://data.unesco.org/api/explore/v2.1/catalog/datasets/whc001/records?limit=100';

        try {
            console.log("Fetching from UNESCO DataHub...");
            const response = await fetch(OFFICIAL_URL);
            if (!response.ok) throw new Error("UNESCO API currently unavailable.");
            
            const data = await response.json();
            console.log(`Success! Loaded ${data.results.length} sites from UNESCO.`);
            
            // Map the official schema to our app
            return data.results.map((item, index) => ({
                id: item.ref_no || index.toString(),
                name: item.name_en,
                country: item.states_name_en,
                region: item.region_en,
                lat: item.latitude,
                lon: item.longitude,
                desc: item.short_description_en
            }));
        } catch (err) {
            console.warn("API Error:", err.message);
            console.log("Switching to Local Starter Sites...");
            return LOCAL_SITES; // Uses the data from data.js
        }
    },

    async getWikiDetails(siteName, country) {
        // Clean the name: "Historic Centre of Rome" -> "Rome"
        let query = siteName.split('(')[0].split(',')[0].replace('Historic Centre of ', '').trim();
        const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro&explaintext&titles=${encodeURIComponent(query)}&pithumbsize=1000&origin=*`;
        
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pageId === "-1") return await this.callWikiAPI(country);
            
            return {
                description: pages[pageId].extract,
                thumbnail: pages[pageId].thumbnail ? pages[pageId].thumbnail.source : null
            };
        } catch (err) { return null; }
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