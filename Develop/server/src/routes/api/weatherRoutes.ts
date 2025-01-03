// weatherRoutes.ts
import { Router } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();

// POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
    try {
        const { city } = req.body;
        if (!city) {
            return res.status(400).json({ error: 'City name is required' });
        }

        // Get weather data from city name
        const weatherData = await WeatherService.getWeatherForCity(city);
        
        // Save city to search history
        await HistoryService.addCity(city);

        res.json(weatherData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// GET search history
router.get('/history', async (req, res) => {
    try {
        const cities = await HistoryService.getCities();
        res.json(cities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch search history' });
    }
});

// DELETE city from search history
router.delete('/history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await HistoryService.removeCity(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete city from history' });
    }
});

export default router;