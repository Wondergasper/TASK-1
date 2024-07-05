require('dotenv').config();
const express = require('express');
const axios = require('axios');
const validator = require('validator'); // Optional for validation

const app = express();
const port = process.env.PORT || 3000;

// Root path (optional)
//app.get('/', (req, res) => {
 // res.send("Welcome to the weather API. Please use /api/hello?visitor_name=your_name&city=your_city");
//});

// Improved weather route
app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Guest';
  const city = validator.trim(req.query.city) || ''; // Allow empty city for default behavior

  // Validate city name (optional)
  if (city && !validator.isLength(city, { min: 2, max: 50 })) {
    return res.status(400).json({ message: 'Invalid city name. Must be 2-50 characters.' });
  }

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const weatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`; // Use city for location

    const weatherResponse = await axios.get(weatherApiUrl);
    const data = weatherResponse.data;

    const location = data.location.name;
    const temperature = data.current.temp_c;

    res.json({
      client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, // Still log IP for informational purposes
      location,
      greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}`
    });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
