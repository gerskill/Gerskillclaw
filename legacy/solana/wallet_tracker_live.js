#!/usr/bin/env node

/**
 * wallet_tracker_live.js
 * Tracker en temps réel de wallets Solana avec alertes de trading
 * - Surveille les transactions des wallets trackés
 * - Détecte achats/ventes de tokens
 * - Simule tes trades avec slippage
 * - Compare les performances
 * - Envoie des alertes formatées
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load configuration from JSON
const CONFIG_PATH = path.join(__dirname, '../config/wallet_tracker.json');
let config;

try {
  const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
  config = JSON.parse(configData);
} catch (error) {
  console.error('❌ Erreur lors du chargement de la configuration:', error.message);
  console.error(`   Fichier attendu: ${CONFIG_PATH}`);
  process.exit(1);
}

// Extract active wallets
const TRACKED_WALLETS = config.wallets
  .filter(w => w.active)
  .map(w => w.address);

if (TRACKED_WALLETS.length === 0) {
  console.error('❌ Aucun wallet actif trouvé dans la configuration!');
  process.exit(1);
}

const MY_WALLET = config.settings.myWallet || 'YOUR_WALLET_ADDRESS_HERE';

const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const DEXSCREENER_API = 'https://api.dexscreener.com/latest';
const JUPITER_API = 'https://public.jupiterapi.com';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Fichier pour les alertes Telegram
const ALERTS_FILE = path.join(__dirname, '../pending_alerts.json');

// Paramètres de trading (depuis config)
const SLIPPAGE_BPS = config.settings.slippageBps || 50;
const ENTRY_DELAY_MS = config.settings.entryDelayMs || 2000;
const EXIT_DELAY_MS = config.settings.exitDelayMs || 1500;
const POLL_INTERVAL = config.settings.pollInterval || 10000;

// État des positions trackées
const positions = new Map(); // tokenMint -> { wallet, entryPrice, entryTime, amount }

// Cache des dernières transactions vues
const lastSeenSignatures = new Map(); // wallet -> Set(signatures)

TRACKED_WALLETS.forEach(wallet => {
  lastSeenSignatures.set(wallet, new Set());
});

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function formatNumber(num, decimals = 6) {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return num.toFixed(decimals);
}

function formatPercent(num) {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
}

function applySlippage(price, slippageBps, isBuy) {
  const slippagePercent = slippageBps / 100;
  if (isBuy) {
    return price * (1 + slippagePercent / 100);
  } else {
    return price * (1 - slippagePercent / 100);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction pour sauvegarder une alerte Telegram
function saveAlert(message) {
  try {
    let alerts = [];
    
    // Lire les alertes existantes
    if (fs.existsSync(ALERTS_FILE)) {
      const content = fs.readFileSync(ALERTS_FILE, 'utf8');
      alerts = JSON.parse(content);
    }
    
    // Ajouter la nouvelle alerte
    alerts.push({
      timestamp: Date.now(),
      message
    });
    
    // Sauvegarder
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'alerte:', error.message);
  }
}

// ============================================
// API CALLS
// ============================================

async function getRecentTransactions(walletAddress, limit = 10) {
  try {
    const response = await axios.post(SOLANA_RPC, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [
        walletAddress,
        { limit }
      ]
    });

    return response.data.result || [];
  } catch (error) {
    console.error(`Erreur getSignaturesForAddress pour ${walletAddress}:`, error.message);
    return [];
  }
}

async function getTransactionDetails(signature) {
  try {
    const response = await axios.post(SOLANA_RPC, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTransaction',
      params: [
        signature,
        { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }
      ]
    });

    return response.data.result;
  } catch (error) {
    console.error(`Erreur getTransaction pour ${signature}:`, error.message);
    return null;
  }
}

async function getTokenInfo(tokenMint) {
  try {
    const response = await axios.get(`${DEXSCREENER_API}/dex/tokens/${tokenMint}`);
    const pairs = response.data.pairs || [];
    
    if (pairs.length === 0) return null;
    
    // Prendre la première paire (généralement la plus liquide)
    const pair = pairs[0];
    
    return {
      mint: tokenMint,
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      priceUsd: parseFloat(pair.priceUsd) || 0,
      pairAddress: pair.pairAddress,
      dexId: pair.dexId,
      liquidity: pair.liquidity?.usd || 0,
      volume24h: pair.volume?.h24 || 0
    };
  } catch (error) {
    console.error(`Erreur DexScreener pour ${tokenMint}:`, error.message);
    return null;
  }
}

async function getJupiterQuote(inputMint, outputMint, amount) {
  try {
    const response = await axios.get(`${JUPITER_API}/quote`, {
      params: {
        inputMint,
        outputMint,
        amount: Math.floor(amount * 1e9), // Convertir en lamports
        slippageBps: SLIPPAGE_BPS
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erreur Jupiter quote:', error.message);
    return null;
  }
}

// ============================================
// ANALYSE DES TRANSACTIONS
// ============================================

function parseSwapTransaction(txDetail, walletAddress) {
  if (!txDetail || !txDetail.meta || txDetail.meta.err) {
    return null;
  }

  const { preBalances, postBalances, preTokenBalances, postTokenBalances } = txDetail.meta;
  const accountKeys = txDetail.transaction.message.accountKeys;

  // Trouver l'index du wallet
  let walletIndex = -1;
  for (let i = 0; i < accountKeys.length; i++) {
    const key = accountKeys[i].pubkey || accountKeys[i];
    if (key === walletAddress) {
      walletIndex = i;
      break;
    }
  }

  if (walletIndex === -1) return null;

  // Analyser les changements de tokens
  const tokenChanges = [];

  // Comparer preTokenBalances et postTokenBalances pour ce wallet
  const preBals = (preTokenBalances || []).filter(b => 
    b.owner === walletAddress || accountKeys[b.accountIndex] === walletAddress
  );
  const postBals = (postTokenBalances || []).filter(b => 
    b.owner === walletAddress || accountKeys[b.accountIndex] === walletAddress
  );

  // Créer un map des balances
  const preBalMap = new Map();
  preBals.forEach(b => {
    preBalMap.set(b.mint, parseFloat(b.uiTokenAmount.uiAmountString || 0));
  });

  const postBalMap = new Map();
  postBals.forEach(b => {
    postBalMap.set(b.mint, parseFloat(b.uiTokenAmount.uiAmountString || 0));
  });

  // Détecter les changements
  const allMints = new Set([...preBalMap.keys(), ...postBalMap.keys()]);
  
  for (const mint of allMints) {
    const preBal = preBalMap.get(mint) || 0;
    const postBal = postBalMap.get(mint) || 0;
    const change = postBal - preBal;

    if (Math.abs(change) > 0.000001) { // Ignorer les micro-changements
      tokenChanges.push({
        mint,
        change,
        preBal,
        postBal,
        isBuy: change > 0,
        isSell: change < 0
      });
    }
  }

  // Analyser SOL
  const solChange = (postBalances[walletIndex] - preBalances[walletIndex]) / 1e9;

  if (tokenChanges.length > 0) {
    // C'est un swap
    const bought = tokenChanges.filter(t => t.isBuy);
    const sold = tokenChanges.filter(t => t.isSell);

    if (bought.length > 0 && sold.length > 0) {
      // Swap token A -> token B
      return {
        type: 'swap',
        tokenIn: sold[0].mint,
        tokenOut: bought[0].mint,
        amountIn: Math.abs(sold[0].change),
        amountOut: bought[0].change,
        solChange
      };
    } else if (bought.length > 0 && solChange < -0.001) {
      // Achat avec SOL
      return {
        type: 'buy',
        token: bought[0].mint,
        amount: bought[0].change,
        solSpent: Math.abs(solChange)
      };
    } else if (sold.length > 0 && solChange > 0.001) {
      // Vente pour SOL
      return {
        type: 'sell',
        token: sold[0].mint,
        amount: Math.abs(sold[0].change),
        solReceived: solChange
      };
    }
  }

  return null;
}

// ============================================
// GESTION DES ALERTES
// ============================================

async function handleBuyAlert(wallet, txInfo, tokenInfo) {
  console.log('\n🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
  console.log('🔔 ALERTE: ACHAT DÉTECTÉ!\n');
  console.log(`📊 Wallet: ${wallet.slice(0, 8)}...`);
  console.log(`🪙 Token: ${tokenInfo.symbol} (${tokenInfo.name})`);
  console.log(`📍 Address: ${tokenInfo.mint}\n`);

  const trackedEntryPrice = tokenInfo.priceUsd;
  const trackedAmount = txInfo.amount;
  const trackedCost = trackedEntryPrice * trackedAmount;

  console.log(`💰 Wallet tracké:`);
  console.log(`   Prix d'entrée: $${formatNumber(trackedEntryPrice, 8)}`);
  console.log(`   Quantité: ${trackedAmount.toLocaleString()} ${tokenInfo.symbol}`);
  console.log(`   Coût: $${formatNumber(trackedCost, 2)}`);
  console.log(`   SOL dépensé: ${formatNumber(txInfo.solSpent, 4)} SOL\n`);

  // Simuler ton achat
  console.log(`⏱️  Simulation de ton achat (délai ${ENTRY_DELAY_MS}ms)...`);
  await sleep(ENTRY_DELAY_MS);

  const myEntryPrice = applySlippage(trackedEntryPrice, SLIPPAGE_BPS, true);
  const myAmount = trackedAmount;
  const myCost = myEntryPrice * myAmount;

  console.log(`✅ Ton achat simulé:`);
  console.log(`   Prix d'entrée: $${formatNumber(myEntryPrice, 8)} (avec slippage)`);
  console.log(`   Quantité: ${myAmount.toLocaleString()} ${tokenInfo.symbol}`);
  console.log(`   Coût: $${formatNumber(myCost, 2)}`);
  console.log(`   Impact slippage: +${SLIPPAGE_BPS / 100}%\n`);

  // Enregistrer la position
  positions.set(tokenInfo.mint, {
    wallet,
    symbol: tokenInfo.symbol,
    name: tokenInfo.name,
    trackedEntryPrice,
    myEntryPrice,
    amount: trackedAmount,
    myAmount,
    trackedCost,
    myCost,
    entryTime: Date.now()
  });

  console.log(`📌 Position ouverte et trackée.`);
  console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥\n');

  // Envoyer alerte Telegram
  const telegramMsg = `🔔 **ACHAT DÉTECTÉ**

📊 Wallet: ${wallet.slice(0, 8)}...
🪙 Token: **${tokenInfo.symbol}** (${tokenInfo.name})

💰 **Wallet tracké:**
• Prix entrée: $${formatNumber(trackedEntryPrice, 8)}
• Quantité: ${trackedAmount.toLocaleString()} ${tokenInfo.symbol}
• Coût: $${formatNumber(trackedCost, 2)}
• SOL dépensé: ${formatNumber(txInfo.solSpent, 4)} SOL

✅ **Ton achat simulé:**
• Prix entrée: $${formatNumber(myEntryPrice, 8)} (avec slippage)
• Quantité: ${myAmount.toLocaleString()} ${tokenInfo.symbol}
• Coût: $${formatNumber(myCost, 2)}
• Impact slippage: +${SLIPPAGE_BPS / 100}%

📌 Position ouverte et trackée`;

  saveAlert(telegramMsg);
}

async function handleSellAlert(wallet, txInfo, tokenInfo, position) {
  console.log('\n🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
  console.log('🔔 ALERTE: VENTE DÉTECTÉE!\n');
  console.log(`📊 Wallet: ${wallet.slice(0, 8)}...`);
  console.log(`🪙 Token: ${tokenInfo.symbol} (${tokenInfo.name})\n`);

  const trackedExitPrice = tokenInfo.priceUsd;
  const trackedExitValue = trackedExitPrice * position.amount;
  const trackedProfit = trackedExitValue - position.trackedCost;
  const trackedProfitPercent = ((trackedExitPrice - position.trackedEntryPrice) / position.trackedEntryPrice) * 100;
  const holdDuration = (Date.now() - position.entryTime) / 1000;

  console.log(`💰 Wallet tracké:`);
  console.log(`   Prix de sortie: $${formatNumber(trackedExitPrice, 8)}`);
  console.log(`   Valeur finale: $${formatNumber(trackedExitValue, 2)}`);
  console.log(`   Profit: $${formatNumber(trackedProfit, 2)} (${formatPercent(trackedProfitPercent)})`);
  console.log(`   SOL reçu: ${formatNumber(txInfo.solReceived, 4)} SOL`);
  console.log(`   Durée hold: ${formatNumber(holdDuration, 0)}s\n`);

  // Simuler ta vente
  console.log(`⏱️  Simulation de ta vente (délai ${EXIT_DELAY_MS}ms)...`);
  await sleep(EXIT_DELAY_MS);

  const myExitPrice = applySlippage(trackedExitPrice, SLIPPAGE_BPS, false);
  const myExitValue = myExitPrice * position.myAmount;
  const myProfit = myExitValue - position.myCost;
  const myProfitPercent = ((myExitPrice - position.myEntryPrice) / position.myEntryPrice) * 100;

  console.log(`✅ Ta vente simulée:`);
  console.log(`   Prix de sortie: $${formatNumber(myExitPrice, 8)} (avec slippage)`);
  console.log(`   Valeur finale: $${formatNumber(myExitValue, 2)}`);
  console.log(`   Profit: $${formatNumber(myProfit, 2)} (${formatPercent(myProfitPercent)})`);
  console.log(`   Impact slippage: -${SLIPPAGE_BPS / 100}%\n`);

  // Comparaison
  const perfDiff = myProfitPercent - trackedProfitPercent;
  const perfDiffAbs = Math.abs(perfDiff);

  console.log('═══════════════════════════════════════════════════');
  console.log('📊 COMPARAISON DES PERFORMANCES\n');

  console.log(`🎯 Wallet tracké: ${formatPercent(trackedProfitPercent)}`);
  console.log(`💼 Ton wallet: ${formatPercent(myProfitPercent)}`);
  
  if (perfDiff < 0) {
    console.log(`📉 Différence: ${formatPercent(perfDiff)}`);
    console.log(`⚠️  Impact slippage: ${formatNumber(perfDiffAbs, 2)}%`);
  } else {
    console.log(`📈 Différence: ${formatPercent(perfDiff)}`);
    console.log(`✨ Meilleure exécution!`);
  }

  console.log('\n💵 RÉSUMÉ FINANCIER');
  console.log(`   Capital investi: $${formatNumber(position.myCost, 2)}`);
  console.log(`   Retour: $${formatNumber(myExitValue, 2)}`);
  console.log(`   Profit net: $${formatNumber(myProfit, 2)}`);
  console.log(`   ROI: ${formatPercent(myProfitPercent)}`);

  console.log('\n🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥\n');

  // Retirer la position
  positions.delete(tokenInfo.mint);

  // Envoyer alerte Telegram
  const holdMin = (holdDuration / 60).toFixed(1);
  const perfEmoji = perfDiff < 0 ? '📉' : '📈';
  const diffText = perfDiff < 0 ? `${perfEmoji} Différence: ${formatPercent(perfDiff)}\n⚠️ Impact slippage: ${formatNumber(perfDiffAbs, 2)}%` : `${perfEmoji} Différence: ${formatPercent(perfDiff)}\n✨ Meilleure exécution!`;

  const telegramMsg = `🔔 **VENTE DÉTECTÉE**

📊 Wallet: ${wallet.slice(0, 8)}...
🪙 Token: **${tokenInfo.symbol}** (${tokenInfo.name})
⏱️ Hold: ${holdMin} min

💰 **Wallet tracké:**
• Prix sortie: $${formatNumber(trackedExitPrice, 8)}
• Valeur finale: $${formatNumber(trackedExitValue, 2)}
• Profit: $${formatNumber(trackedProfit, 2)} (${formatPercent(trackedProfitPercent)})

✅ **Ta vente simulée:**
• Prix sortie: $${formatNumber(myExitPrice, 8)}
• Valeur finale: $${formatNumber(myExitValue, 2)}
• Profit: $${formatNumber(myProfit, 2)} (${formatPercent(myProfitPercent)})

📊 **COMPARAISON:**
🎯 Wallet tracké: ${formatPercent(trackedProfitPercent)}
💼 Ton wallet: ${formatPercent(myProfitPercent)}
${diffText}

💵 **RÉSUMÉ:**
Capital investi: $${formatNumber(position.myCost, 2)}
Retour: $${formatNumber(myExitValue, 2)}
Profit net: $${formatNumber(myProfit, 2)}
ROI: ${formatPercent(myProfitPercent)}`;

  saveAlert(telegramMsg);
}

// ============================================
// MONITORING PRINCIPAL
// ============================================

async function monitorWallet(walletAddress) {
  const recentTxs = await getRecentTransactions(walletAddress, 5);
  const seenSigs = lastSeenSignatures.get(walletAddress);

  for (const txSignature of recentTxs) {
    const sig = txSignature.signature;

    // Ignorer si déjà vu
    if (seenSigs.has(sig)) continue;

    seenSigs.add(sig);

    // Garder seulement les 50 dernières signatures en mémoire
    if (seenSigs.size > 50) {
      const firstSig = seenSigs.values().next().value;
      seenSigs.delete(firstSig);
    }

    // Analyser la transaction
    const txDetail = await getTransactionDetails(sig);
    if (!txDetail) continue;

    const swapInfo = parseSwapTransaction(txDetail, walletAddress);
    if (!swapInfo) continue;

    console.log(`\n🔍 Nouvelle transaction détectée: ${sig.slice(0, 8)}...`);
    console.log(`   Type: ${swapInfo.type}`);

    if (swapInfo.type === 'buy') {
      // Achat détecté
      const tokenInfo = await getTokenInfo(swapInfo.token);
      if (!tokenInfo) {
        console.log(`   ⚠️  Impossible de récupérer les infos du token ${swapInfo.token}`);
        continue;
      }

      await handleBuyAlert(walletAddress, swapInfo, tokenInfo);

    } else if (swapInfo.type === 'sell') {
      // Vente détectée
      const position = positions.get(swapInfo.token);
      
      if (position) {
        // On a une position ouverte pour ce token
        const tokenInfo = await getTokenInfo(swapInfo.token);
        if (!tokenInfo) {
          console.log(`   ⚠️  Impossible de récupérer les infos du token ${swapInfo.token}`);
          continue;
        }

        await handleSellAlert(walletAddress, swapInfo, tokenInfo, position);
      } else {
        console.log(`   ℹ️  Vente détectée mais pas de position trackée pour ce token.`);
      }
    }

    // Petit délai entre transactions
    await sleep(500);
  }
}

async function monitorLoop() {
  console.log('🚀 Démarrage du tracker de wallets en temps réel\n');
  console.log(`📊 Wallets trackés: ${TRACKED_WALLETS.length}`);
  TRACKED_WALLETS.forEach((w, i) => {
    console.log(`   ${i + 1}. ${w}`);
  });
  console.log(`💼 Mon wallet: ${MY_WALLET}`);
  console.log(`⏱️  Intervalle de polling: ${POLL_INTERVAL / 1000}s`);
  console.log(`📉 Slippage: ${SLIPPAGE_BPS / 100}%\n`);
  console.log('═══════════════════════════════════════════════════\n');
  console.log('👀 En attente de transactions...\n');

  let loopCount = 0;

  while (true) {
    try {
      loopCount++;
      
      // Monitor tous les wallets
      for (const wallet of TRACKED_WALLETS) {
        await monitorWallet(wallet);
      }

      // Afficher un heartbeat toutes les 10 boucles
      if (loopCount % 10 === 0) {
        console.log(`💓 Heartbeat - ${new Date().toLocaleTimeString()} - ${positions.size} position(s) ouverte(s)`);
      }

      await sleep(POLL_INTERVAL);

    } catch (error) {
      console.error(`❌ Erreur dans la boucle de monitoring:`, error.message);
      await sleep(POLL_INTERVAL);
    }
  }
}

// ============================================
// DÉMARRAGE
// ============================================

if (require.main === module) {
  monitorLoop().catch(err => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
  });
}

module.exports = {
  monitorWallet,
  handleBuyAlert,
  handleSellAlert
};
