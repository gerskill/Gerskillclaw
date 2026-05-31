// Financial Datasets API Wrapper
// Usage: const api = new FinancialDatasetsAPI(process.env.FINANCIAL_DATASETS_API_KEY);

class FinancialDatasetsAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://financialdatasets.ai/v1';
  }

  // Fetch stock prices
  async getPrices(symbol, start_date, end_date) {
    const url = `${this.baseURL}/stocks/${symbol}/prices?start_date=${start_date}&end_date=${end_date}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.prices || [];
  }

  // Calculate RSI
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50; // Default neutral RSI

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;
    if (avgGain === 0) return 0;

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
  }

  // Calculate moving average
  calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  // Calculate Bollinger Bands
  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) return null;

    const sma = this.calculateSMA(prices, period);
    const slice = prices.slice(-period);
    const squaredDiffs = slice.map(price => Math.pow(price - sma, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(variance);

    return {
      sma,
      upperBand: sma + (stdDev * std),
      lowerBand: sma - (stdDev * std),
      middleBand: sma
    };
  }

  // Validate API key
  validateApiKey() {
    return this.apiKey && this.apiKey.length > 10;
  }
}

module.exports = FinancialDatasetsAPI;
