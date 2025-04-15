const express = require("express");
const axios = require("axios");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createPool({
    host: "20.0.200.182", // Replace with your MySQL private IP
    user: "weather_user",
    password: "YourWeatherPassword", // Replace with the actual password
    database: "weather_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// OpenWeather API
const API_KEY = "b5be91c7171744db894120614250204"; // Replace with your API key
const WEATHER_API_URL = "http://api.weatherapi.com/v1/current.json";

// 🔹 Fetch Weather Data and Store in DB
app.get("/weather", async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({ error: "City parameter is required" });
    }

    try {
        const response = await axios.get(WEATHER_API_URL, {
            params: { key: API_KEY, q: city }
        });      const weatherData = response.data;
        const { temp_c, condition } = weatherData.current;
        const conditionText = condition.text;

        // Insert data into MySQL
        db.query(
            "INSERT INTO weather_searches (city, temperature, condition_text) VALUES (?, ?, ?)",
            [city, temp_c, conditionText],
            (err, result) => {
                if (err) {
                    console.error("❌ Database Insertion Failed:", err);
                    return res.status(500).json({ error: "Database insertion failed" });
                }
                console.log("✅ Data Inserted Successfully!");
            }
        );

        res.json({
            city,
            temperature: temp_c,
            condition: conditionText
        });
    } catch (error) {
        console.error("❌ Error Fetching Weather:", error);
        res.status(500).json({ error: "Unable to fetch weather data" });
    }
});

// 🔹 Fetch All Stored Weather Details
app.get("/weather/history", (req, res) => {
    db.query("SELECT * FROM weather_searches ORDER BY id DESC", (err, results) => {
        if (err) {
            console.error("❌ Error Fetching History:", err);
            return res.status(500).json({ error: "Database query failed" });
        }
        res.json(results);
    });
});

// Start the server
app.listen(port, () => {
    console.log(🚀 Server running on http://localhost:${port});
});
