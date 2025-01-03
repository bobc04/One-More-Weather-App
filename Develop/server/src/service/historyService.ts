// historyService.ts
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define City interface
interface City {
    id: string;
    name: string;
}

class HistoryService {
    private filePath: string;

    constructor() {
        this.filePath = path.join(process.cwd(), 'db.json');
    }

    // Read from the searchHistory.json file
    private async read(): Promise<City[]> {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    // Write the updated cities array to the searchHistory.json file
    private async write(cities: City[]): Promise<void> {
        await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2));
    }

    // Get cities from the searchHistory.json file
    async getCities(): Promise<City[]> {
        return await this.read();
    }

    // Add a city to the searchHistory.json file
    async addCity(cityName: string): Promise<City> {
        const cities = await this.read();
        
        // Check if city already exists
        const existingCity = cities.find(city => city.name.toLowerCase() === cityName.toLowerCase());
        if (existingCity) {
            return existingCity;
        }

        // Create new city object
        const newCity: City = {
            id: uuidv4(),
            name: cityName
        };

        // Add to array and write to file
        cities.push(newCity);
        await this.write(cities);
        return newCity;
    }

    // Remove a city from the searchHistory.json file
    async removeCity(id: string): Promise<void> {
        const cities = await this.read();
        const filteredCities = cities.filter(city => city.id !== id);
        await this.write(filteredCities);
    }
}

export default new HistoryService();