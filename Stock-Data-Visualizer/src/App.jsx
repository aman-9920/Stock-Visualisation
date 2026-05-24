import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
  
} from "recharts";

const chartTypes = [
  { label: "Line Chart", value: "line" },
  { label: "Bar Chart", value: "bar" },
];

function App() {
  const [stockData, setstockData] = useState(null);
  const [processedData, setprocessedData] = useState([]);
  const [selectedChart, setselectedChart] = useState("line");
  const apiKey = "demo"; //Replace with your  API key
  const symbol = "IBM"; // Example stock symbol. This symbol 'GOOGL' represents Alphabet Inc. You can use any symbol of your choice which represents any company.

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          // Demo API key is used here. You can use your own API key instead of the demo API key. Demo key is used because Alpha Vantage provides free API requests for upto 25 per day and when this limit gets exhausted then you will not be able to get new requests till the time resets. Demo API has no limit to use.
          `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=full&apikey=${apiKey}` // To use your own API key use this URL `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&interval=5min&outputsize=full&apikey=${apiKey}` or the URL given in Alpha Vantage's official website as this URL may not work and replace ${symbol} with your chosen symbol and ${apiKey} with the API key provided by Alpha Vantage.
        );
        const data = await response.json();
        setstockData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [apiKey, symbol]);

  useEffect(() => {
    if (stockData && stockData["Time Series (5min)"]) {
      const timeSeries = stockData["Time Series (5min)"];
      const processed = Object.keys(timeSeries)
        .sort((a, b) => new Date(a) - new Date(b))
        .map((date) => ({
          date: new Date(date), //Convert date string to date object
          open: parseFloat(timeSeries[date]["1. open"]),
          high: parseFloat(timeSeries[date]["2. high"]),
          low: parseFloat(timeSeries[date]["3. low"]),
          close: parseFloat(timeSeries[date]["4. close"]),
          volume: parseInt(timeSeries[date]["5. volume"]),
        })); // Use the names and values given in the json file fetched from Alpha Vantage. Here the names and values are used from the demo json file fetched from Alpha Vantage.
      setprocessedData(processed);
      console.log("Processed data:", processed); // For debugging
    }
  }, [stockData]); // Process data whenever stockData updates

  const handleChartChange = (event) => {
    setselectedChart(event.target.value);
  };

  const renderChart = () => {
    switch (selectedChart) {
      case "line":
        return (
          <div className="w-full h-screen flex justify-center items-center">
            <LineChart width={1000} height={350} data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis domain={["dataMin", "dataMax"]} />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(value)
                }
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line type="monotone" dataKey="high" />
            </LineChart>
          </div>
        );

      case "bar":
        return (
          <div className="flex w-full h-screen justify-center items-center">
            <BarChart width={1000} height={350} data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                  }).format(value)
                }
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Bar dataKey="high" fill="#a4c63n" />
            </BarChart>
          </div>
        );

      default:
        return <p>Select a Chart type</p>;
    }
  };

  return (
    <div>
      <h1 className="text-4xl w-full flex justify-center mt-5">
        Stock Data Visualizer
      </h1>{" "}
      <br />
      <h2 className="text-3xl w-full flex justify-center">High Price</h2><br />
      <div className="flex w-full justify-center text-xl">
        <label htmlFor="chartType">Select Chart Type:&nbsp;&nbsp; </label>

        <span className="border-zinc-700 border-2">
          <select
            id="chartType"
            value={selectedChart}
            onChange={handleChartChange}
          >
            {chartTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </span>
      </div>
      <br />
      <br />
      <h2 className="flex w-full justify-center text-3xl">
        {chartTypes.find((type) => type.value === selectedChart)?.label}
      </h2>
      {processedData.length > 0 ? (
        renderChart()
      ) : (
        <p>{stockData ? "Processing data..." : "Loading data..."}</p>
      )}
    </div>
  );
}

export default App;
