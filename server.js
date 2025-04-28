const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// OpenWeatherMap API
const API_KEY = "4bdf6241920dbeb57f92120e7a34788b";
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

// Route to fetch weather
app.get("/weather", async (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.status(400).json({ error: "City parameter is required" });
    }

    try {
        const response = await axios.get(WEATHER_API_URL, {
            params: {
                q: city,
                appid: API_KEY,
                units: "metric"
            }
        });

        const data = response.data;

        // Convert to simplified format for frontend
        const result = {
            location: {
                name: data.name,
                country: data.sys.country
            },
            current: {
                temp_c: data.main.temp,
                condition: {
                    text: data.weather[0].description,
                    icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
                },
                humidity: data.main.humidity,
                wind_kph: data.wind.speed * 3.6 // convert m/s to km/h
            }
        };

        res.json(result);

    } catch (error) {
        console.error("❌ Error:", error.message);
        if (error.response) {
            res.status(error.response.status).json({ error: error.response.data.message });
        } else {
            res.status(500).json({ error: "Unable to fetch weather data" });
        }
    }
});

// Start server
app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Weather backend running at http://0.0.0.0:${port}`);
});
