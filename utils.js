const Utils = {
    // Shuffle an array (Fisher-Yates)
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    // Get 3 random countries from the same region that aren't the correct one
    generateDistractors(correctCountry, region, allSites) {
        const sameRegionCountries = allSites
            .filter(s => s.region_en === region && s.states_name_en !== correctCountry)
            .map(s => s.states_name_en);
        
        // Remove duplicates and shuffle
        const uniqueOptions = [...new Set(sameRegionCountries)];
        return this.shuffle(uniqueOptions).slice(0, 3);
    },

    // Session Storage helpers
    getVisited() {
        const visited = sessionStorage.getItem('visited_heritage');
        return visited ? JSON.parse(visited) : [];
    },

    saveVisited(id) {
        const visited = this.getVisited();
        if (!visited.includes(id)) {
            visited.push(id);
            sessionStorage.setItem('visited_heritage', JSON.stringify(visited));
        }
    }
};