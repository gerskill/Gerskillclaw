// US Stock Backtest Runner - Fictive Mode
// Usage: node scripts/us_stock_backtest_runner.js

const FinancialDatasetsAPI = require('../lib/financial-datasets');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load config
const strategyConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config/us_stock_strategy.json'), 'utf-8')
);

// Initialize API
const api = new FinancialDatasetsAPI(process.env.FINANCIAL_DATASETS_API_KEY);

console.log('🚀 US Stock Backtest Runner (Fictive Mode)\n');

// Generate date range (lookback period)
const today = new Date();
const startDate = new Date(today);
startDate.setDate(startDate.getDate() - strategyConfig.backtest_settings.lookback_days);

const formatDate = (date) => date.toISOString().split('T')[0];
const formatDateDB = (date) => date.toISOString().split('T')[0];

console.log(`📊 Period: ${formatDate(startDate)} to ${formatDate(today)}\n`);

// Backtest a strategy
async function backtestStrategy(strategy) {
  console.log(`🔧 Backtesting: ${strategy.name} (${strategy.symbol})`);
  console.log(`   Description: ${strategy.description}\n`);

  try {
    // Fetch historical prices
    console.log(`📥 Fetching prices for ${strategy.symbol}...`);
    const prices = await api.getPrices(
      strategy.symbol,
      formatDate(startDate),
      formatDate(today)
    );

    if (prices.length === 0) {
      console.log(`⚠️  No data found for ${strategy.symbol}\n`);
      return null;
    }

    console.log(`✅ Fetched ${prices.length} price points\n`);

    // Apply strategy logic (placeholder - customize per strategy)
    const results = applyStrategyLogic(prices, strategy);

    // Calculate performance metrics
    const metrics = calculateMetrics(results, strategy);

    // Print results
    console.log('📊 BACKTEST RESULTS:');
    console.log(`   ROI: ${metrics.roi.toFixed(2)}%`);
    console.log(`   Win Rate: ${metrics.winRate.toFixed(2)}%`);
    console.log(`   Total Trades: ${metrics.totalTrades}`);
    console.log(`   Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}`);
    console.log(`   Max Drawdown: ${metrics.maxDrawdown.toFixed(2)}%\n`);

    // Save results
    saveResults(strategy.name, strategy.symbol, metrics);

    return metrics;

  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    return null;
  }
}

// Strategy logic - customize per strategy type
function applyStrategyLogic(prices, strategy) {
  const results = {
    trades: [],
    entries: [],
    exits: []
  };

  if (strategy.name.includes('RSI')) {
    backtestRSI(prices, strategy, results);
  } else if (strategy.name.includes('Momentum')) {
    backtestMomentum(prices, strategy, results);
  } else if (strategy.name.includes('Bollinger')) {
    backtestBollinger(prices, strategy, results);
  }

  return results;
}

// RSI Strategy
function backtestRSI(prices, strategy, results) {
  for (let i = strategy.rsi_period; i < prices.length; i++) {
    const slice = prices.slice(i - strategy.rsi_period, i);
    const currentPrice = prices[i];
    const rsi = api.calculateRSI(slice, strategy.rsi_period);

    // Entry: RSI < oversold
    if (rsi < strategy.rsi_oversold) {
      results.entries.push({
        date: prices[i].date,
        price: currentPrice,
        rsi: rsi
      });
    }

    // Exit: RSI > overbought
    if (rsi > strategy.rsi_overbought && results.entries.length > 0) {
      const entry = results.entries[results.entries.length - 1];
      results.exits.push({
        date: prices[i].date,
        price: currentPrice,
        rsi: rsi
      });

      results.trades.push({
        entry: entry.price,
        exit: currentPrice,
        profit: (currentPrice - entry.price) / entry.price
      });
    }
  }
}

// Momentum Strategy
function backtestMomentum(prices, strategy, results) {
  const lookback = strategy.lookback_days;

  for (let i = lookback; i < prices.length; i++) {
    const priceSlice = prices.slice(i - lookback, i);
    const lastPrice = priceSlice[priceSlice.length - 1];
    const previousHigh = Math.max(...priceSlice.slice(0, -1));

    // Entry: Price breaks previous high
    if (lastPrice > previousHigh * strategy.entry_threshold) {
      results.entries.push({
        date: prices[i].date,
        price: lastPrice
      });
    }

    // Exit: Price drops below entry - 2%
    if (lastPrice < (results.entries.length > 0 ? results.entries[results.entries.length - 1].price * 0.98 : lastPrice)) {
      if (results.entries.length > 0) {
        const entry = results.entries.pop();
        results.exits.push({
          date: prices[i].date,
          price: lastPrice
        });

        results.trades.push({
          entry: entry.price,
          exit: lastPrice,
          profit: (lastPrice - entry.price) / entry.price
        });
      }
    }
  }
}

// Bollinger Bands Strategy
function backtestBollinger(prices, strategy, results) {
  const lookback = strategy.lookback_days;

  for (let i = strategy.bollinger_period; i < prices.length; i++) {
    const slice = prices.slice(i - strategy.bollinger_period, i);
    const currentPrice = prices[i];
    const bb = api.calculateBollingerBands(slice, strategy.bollinger_period, strategy.bollinger_std);

    if (!bb) continue;

    // Entry: Price at or below lower band with volume spike (simplified)
    if (currentPrice <= bb.lowerBand && results.entries.length === 0) {
      results.entries.push({
        date: prices[i].date,
        price: currentPrice
      });
    }

    // Exit: Price at or above upper band
    if (currentPrice >= bb.upperBand && results.entries.length > 0) {
      const entry = results.entries.pop();
      results.exits.push({
        date: prices[i].date,
        price: currentPrice
      });

      results.trades.push({
        entry: entry.price,
        exit: currentPrice,
        profit: (currentPrice - entry.price) / entry.price
      });
    }
  }
}

// Calculate performance metrics
function calculateMetrics(results, strategy) {
  const trades = results.trades;

  if (trades.length === 0) {
    return {
      roi: 0,
      winRate: 0,
      totalTrades: 0,
      sharpeRatio: 0,
      maxDrawdown: 0
    };
  }

  const profits = trades.map(t => t.profit);
  const wins = profits.filter(p => p > 0).length;
  const totalReturn = trades.reduce((sum, t) => sum + t.profit, 0);
  const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
  const winRate = wins / trades.length;

  // Simplified Sharpe Ratio
  const excessReturns = profits.map(p => p - 0.0001); // 0.01% risk-free rate
  const avgExcessReturn = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
  const stdExcessReturn = Math.sqrt(excessReturns.reduce((sum, r) => sum + Math.pow(r - avgExcessReturn, 2), 0) / excessReturns.length);
  const sharpeRatio = stdExcessReturn === 0 ? 0 : avgExcessReturn / stdExcessReturn;

  // Max Drawdown (simplified)
  let peak = trades[0]?.entry || 0;
  let maxDD = 0;
  trades.forEach(t => {
    peak = Math.max(peak, t.entry);
    const drawdown = (t.exit - peak) / peak;
    if (drawdown < maxDD) maxDD = drawdown;
  });

  return {
    roi: totalReturn * 100,
    winRate: winRate * 100,
    totalTrades: trades.length,
    sharpeRatio: sharpeRatio,
    maxDrawdown: maxDD * 100
  };
}

// Save results to JSON
function saveResults(strategyName, symbol, metrics) {
  const resultsDir = path.join(__dirname, '../data');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const filename = `backtest_results_${symbol}_${Date.now()}.json`;
  const filepath = path.join(resultsDir, filename);

  const data = {
    timestamp: new Date().toISOString(),
    strategy: strategyName,
    symbol: symbol,
    metrics: metrics
  };

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`💾 Results saved to ${filename}\n`);
}

// Main execution
async function main() {
  if (!api.validateApiKey()) {
    console.error('❌ Invalid API key. Please set FINANCIAL_DATASETS_API_KEY in .env\n');
    process.exit(1);
  }

  // Run all strategies
  for (const strategy of strategyConfig.strategies) {
    if (strategy.test_trades) {
      await backtestStrategy(strategy);
      console.log('---\n');
    }
  }

  console.log('✅ All backtests completed!\n');
}

main().catch(console.error);
