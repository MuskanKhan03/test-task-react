'use client';
import React, { useState, useEffect } from 'react';
import styles from './Test.module.css';

const WeatherData = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [pinnedProviders, setPinnedProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiKeyOpenWeatherMap = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  const apiKeyWeatherAPI = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;
  const apiKeyWeatherStack = process.env.NEXT_PUBLIC_WEATHERSTACK_API_KEY;

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    const providers = [
      {
        name: 'OpenWeatherMap',
        url: `https://api.openweathermap.org/data/2.5/weather?lat=19.0760&lon=72.8777&appid=${apiKeyOpenWeatherMap}`
      },
      {
        name: 'WeatherAPI',
        url: `https://api.weatherapi.com/v1/current.json?q=19.0760,72.8777&key=${apiKeyWeatherAPI}`
      },
      {
        name: 'WeatherStack',
        url: `https://api.weatherstack.com/current?access_key=${apiKeyWeatherStack}&query=19.0760,72.8777`
      }
    ];

    const responses = await Promise.all(
      providers.map(async (provider) => {
        try {
          const response = await fetch(provider.url);
          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          return {
            provider: provider.name,
            data
          };
        } catch (error) {
          console.error(`Error fetching from ${provider.name}:`, error.message);
          return null;
        }
      })
    );

    const validResults = responses.filter(response => response !== null);
    setWeatherData(validResults);
    setLoading(false);
  };

  const handlePinProvider = (providerName) => {
    setPinnedProviders((prevPinned) => {
      const newPinned = [...prevPinned];
      if (newPinned.includes(providerName)) {
        return newPinned.filter(name => name !== providerName);
      }
      return [...newPinned, providerName];
    });
  };

  const sortedWeatherData = weatherData.sort((a, b) => {
    if (pinnedProviders.includes(a.provider) && !pinnedProviders.includes(b.provider)) {
      return -1;
    }
    if (!pinnedProviders.includes(a.provider) && pinnedProviders.includes(b.provider)) {
      return 1;
    }
    return 0;
  });

  return (
    <div className={styles.container}>
      <button onClick={fetchWeatherData} className={styles.fetchButton}>
        {loading ? 'Loading...' : 'Fetch Weather Data'}
      </button>
      <table className={styles.weatherTable}>
        <thead>
          <tr>
            <th>Provider</th>
            <th>City</th>
            <th>Temperature</th>
            <th>Weather</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedWeatherData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.provider}</td>
              <td>
                {entry.data?.location?.name || entry.data?.name || 'Unknown'}
              </td>
              <td>
                {entry.data?.main?.temp
                  ? `${entry.data.main.temp}°C`
                  : entry.data?.current?.temp_c
                  ? `${entry.data.current.temp_c}°C`
                  : entry.data?.current?.temperature
                  ? `${entry.data.current.temperature}°C`
                  : 'N/A'}
              </td>
              <td>
                {entry.data?.weather?.[0]?.description ||
                  entry.data?.current?.condition?.text ||
                  entry.data?.current?.weather_descriptions?.[0] ||
                  'N/A'}
              </td>
              <td>
                <button onClick={() => handlePinProvider(entry.provider)}>
                  {pinnedProviders.includes(entry.provider) ? 'Unpin' : 'Pin'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeatherData;
