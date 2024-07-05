require('dotenv').config();
const express = require('express');
const axios = require('axios');
const validator = require('validator');

const app = express();
const port = process.env.PORT || 3000;

// Root path handler
app.get('/', (req, res) => {
  res.send(`
    <h1>Weather API</h1>
    <p>To use this API, make a GET request to:</p>
    <code>/api/hello?visitor_name=your_name&city=your_city</code>
  `);
});

// Improved weather route
app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Guest';
  const city = validator.trim(req.query.city) || '';

  if (city && !validator.isLength(city, { min: 2, max: 50 })) {
    return res.status(400).json({ message: 'Invalid city name. Must be 2-50 characters.' });
  }

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('Weather API key is not set');
    }

    console.log('API Key:', apiKey); // Log API key (remove in production)
    console.log('City:', city); // Log city

    const weatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

    console.log('Making request to:', weatherApiUrl); // Log the full URL

    const weatherResponse = await axios.get(weatherApiUrl);
    const data = weatherResponse.data;

    console.log('Weather API response:', data); // Log the full response

    const location = data.location.name;
    const temperature = data.current.temp_c;

    res.json({
      client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      location,
      greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}`
    });
  } catch (error) {
    console.error('Detailed error:', error);
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    } else {
      console.error('Error message:', error.message);
    }
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

// Test route using a simple API
app.get('/test', async (req, res) => {
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
      console.log('Test API response:', response.data);
      res.json({
        message: 'Test successful',
        data: response.data
      });
    } catch (error) {
      console.error('Test API error:', error);
      res.status(500).json({ error: 'Error in test API call' });
    }
  });
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Weather API Key is ${process.env.WEATHER_API_KEY ? 'set' : 'not set'}`);
});