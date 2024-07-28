let cities : any;

export async function fetchData(): Promise<void> {
    try {
        const response = await fetch(`${import.meta.env.BASE_URL}slovakia-cities.geojson`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch GeoJSON file');
        }

        const data = await response.json();
        cities = data;

    } catch (error) {
        console.error('Error loading GeoJSON:', error);
        throw error;
    }
}

export function getCounties(): string[] {
    const counties = cities.features.map((feature: any) => feature.properties.county);
    return [...new Set(counties)] as string[];
}

export function getRegions(): string[] {
    const regions = cities.features.map((feature: any) => feature.properties.region);
    return [...new Set(regions)] as string[];
}

export function pickRandomCity(county: string | null, region: string | null): any {
    let cityFeature = null;
    
    let filteredCities = cities.features;

    if (county !== null) {
        filteredCities = filteredCities.filter((feature: any) => feature.properties.county === county);
    } else if (region !== null) {
        filteredCities = filteredCities.filter((feature: any) => feature.properties.region === region);
    }

    if (filteredCities.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredCities.length);
        cityFeature = filteredCities[randomIndex];
    }

    return cityFeature;
}
