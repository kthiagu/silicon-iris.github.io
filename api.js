const UNESCO_URL = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/world-heritage-list/records?limit=100';

const API = {
    async fetchUNESCOData() {
        try {
            console.log("Fetching UNESCO list...");
            const response = await fetch(UNESCO_URL);
            if (!response.ok) throw new Error("UNESCO API unreachable");
            const data = await response.json();
            
            // Ensure we are returning the results array
            return data.results || []; 
        } catch (err) {
            console.error("UNESCO Fetch Error:", err);
            return []; // Return empty array so app doesn't crash
        }
    },

    async getWikiDetails(siteName, country) {
        // We use the site name (site_en) for a much cleaner Wikipedia search
        const query = `${siteName}`;
        console.log(`Searching Wiki for: ${query}`);
        
        let data = await this.callWikiAPI(query);
        
        // Fallback: If site name fails, search for the Country
        if (!data || !data.thumbnail) {
            console.log("Wiki site search failed, trying country...");
            data = await this.callWikiAPI(country);
        }

        return data;
    },

    async callWikiAPI(query) {
        // The 'origin=*' is vital for avoiding CORS errors
        const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro&explaintext&titles=${encodeURIComponent(query)}&pithumbsize=1000&origin=*`;
        
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pageId === "-1") return null;
            
            return {
                description: pages[pageId].extract || "No description available.",
                thumbnail: pages[pageId].thumbnail ? pages[pageId].thumbnail.source : null
            };
        } catch (err) {
            console.error("Wiki API Error:", err);
            return null;
        }
    }
};