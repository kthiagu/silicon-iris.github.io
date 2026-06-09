// NEW STABLE URL
const UNESCO_URL = 'https://public.opendatasoft.com/api/records/1.0/search/?dataset=world-heritage-list&q=&rows=100';

const API = {
    async fetchUNESCOData() {
        console.log("Attempting to fetch from:", UNESCO_URL);
        try {
            const response = await fetch(UNESCO_URL);
            
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            
            const data = await response.json();
            console.log("UNESCO Data Loaded Successfully:", data);
            
            // In this specific API version, results are in 'records', 
            // and data is nested inside 'fields'
            return data.records.map(record => record.fields); 
        } catch (err) {
            console.error("CRITICAL ERROR:", err);
            return []; 
        }
    },

    async getWikiDetails(siteName, country) {
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
                description: pages[pageId].extract,
                thumbnail: pages[pageId].thumbnail ? pages[pageId].thumbnail.source : null
            };
        } catch (err) { return null; }
    }
};