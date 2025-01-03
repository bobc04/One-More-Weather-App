// weatherService.ts
import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
    lat: number;
    lon: number;
}

interface Weather {
    date: string;
    temp: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
}

class WeatherService {
    private baseURL: string;
    private apiKey: string;
    private city: string;

    constructor() {
        this.baseURL = 'https://api.openweathermap.org/';
        this.apiKey = process.env.OPENWEATHER_API_KEY || '';
        this.city = '';
    }

    private async fetchLocationData(query: string): Promise<any> {
        const response = await fetch(query);
        if (!response.ok) {
            throw new Error('Failed to fetch location data');
        }
        return response.json();
    }

    private destructureLocationData(locationData: any): Coordinates {
        return {
            lat: locationData[0].lat,
            lon: locationData[0].lon
        };
    }

    private buildGeocodeQuery(): string {
        return `${this.baseURL}geo/1.0/direct?q=${encodeURIComponent(this.city)}&limit=1&appid=${this.apiKey}`;
    }

    private buildWeatherQuery(coordinates: Coordinates): string {
        return `${this.baseURL}data/3.0/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${this.apiKey}`;
    }

    private async fetchAndDestructureLocationData(): Promise<Coordinates> {
        const query = this.buildGeocodeQuery();
        const locationData = await this.fetchLocationData(query);
        return this.destructureLocationData(locationData);
    }

    private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
        const query = this.buildWeatherQuery(coordinates);
        const response = await fetch(query);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        return response.json();
    }

    private parseCurrentWeather(response: any): Weather {
        return {
            date: new Date(response.current.dt * 1000).toLocaleDateString(),
            temp: Math.round(response.current.temp),
            humidity: response.current.humidity,
            windSpeed: Math.round(response.current.wind_speed),
            description: response.current.weather[0].description,
            icon: response.current.weather[0].icon
        };
    }

    private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
        const forecast = weatherData.slice(1, 6).map(day => ({
            date: new Date(day.dt * 1000).toLocaleDateString(),
            temp: Math.round(day.temp.day),
            humidity: day.humidity,
            windSpeed: Math.round(day.wind_speed),
            description: day.weather[0].description,
            icon: day.weather[0].icon
        }));
        
        return [currentWeather, ...forecast];
    }

    async getWeatherForCity(city: string): Promise<Weather[]> {
        try {
            this.city = city;
            const coordinates = await this.fetchAndDestructureLocationData();
            const weatherResponse = await this.fetchWeatherData(coordinates);
            const currentWeather = this.parseCurrentWeather(weatherResponse);
            return this.buildForecastArray(currentWeather, weatherResponse.daily);
        } catch (error) {
            throw new Error(`Failed to get weather for ${city}`);
        }
    }
}

export default new WeatherService();