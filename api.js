const UNESCO_URL = 'https://data.unesco.org/api/explore/v2.1/catalog/datasets/world-heritage-list/records?limit=100';

const API = {
    async fetchUNESCOData() {
        try {
            console.log("Connecting to UNESCO DataHub...");
            const response = await fetch(UNESCO_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Data received:", data);
            return data.results || []; 
        } catch (err) {
            console.error("UNESCO Fetch Error:", err);
            return []; 
        }
    },

    async getWikiDetails(siteName, country) {
        // We use the 'name_en' field for the search
        const query = siteName.split('(')[0].trim();
        let data = await this.callWikiAPI(query);
        
        if (!data || !data.thumbnail) {
            data = await this.callWikiAPI(`${query}, ${country}`);
        }
        return data;
    },

    async callWikiAPI(query) {
        const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro&explaintext&titles=${encodeURIComponent(query)}&pithumbsize=1000&origin=*`;
        
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pageId === "-1") return null;
            
            return {
                description: pages[pageId].extract || "History details are being updated...",
                thumbnail: pages[pageId].thumbnail ? pages[pageId].thumbnail.source : null
            };
        } catch (err) {
            return null;
        }
    }
};