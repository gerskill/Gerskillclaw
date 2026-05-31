#!/usr/bin/env python3
"""
Killingbot Scanner v1
Multi-pair, multi-timeframe confluence scanner
Reproduit la logique Killingbot v1 (SuperTrend + RSI + MACD + Volume + MTF)
Output: JSON → results.json dans le même dossier
"""
import json
import sys
import os
from datetime import datetime
import warnings
warnings.filterwarnings("ignore")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_FILE = os.path.join(SCRIPT_DIR, "results.json")

# ─── WATCHLISTS ────────────────────────────────────────────────────────────────
# Modifier ces listes pour correspondre à ta watchlist TradingView
WATCHLISTS = {
    "EU GU": [
        "EURUSD=X", "GBPUSD=X",
    ],
    "forex": [
        "EURUSD=X", "GBPUSD=X", "USDJPY=X", "USDCHF=X",
        "AUDUSD=X", "NZDUSD=X", "USDCAD=X",
        "EURJPY=X", "GBPJPY=X", "EURGBP=X",
        "EURCAD=X", "GBPAUD=X",
    ],
    "crypto": [
        "BTC-USD", "ETH-USD", "BNB-USD", "SOL-USD",
        "XRP-USD", "ADA-USD", "DOGE-USD", "AVAX-USD",
        "DOT-USD", "LINK-USD",
    ],
    "Nasdaq": [
        "QQQ", "AAPL", "MSFT", "NVDA", "TSLA",
        "META", "GOOGL", "AMZN", "AMD", "NFLX",
    ],
    "Action": [
        "SPY", "IWM", "GLD", "SLV", "TLT",
        "XLE", "XLF", "XLK",
    ],
}

# ─── TIMEFRAMES ─────────────────────────────────────────────────────────────────
TIMEFRAMES = {
    "5m":  ("5m",  "5d"),
    "15m": ("15m", "5d"),
    "1h":  ("1h",  "20d"),
    "4h":  ("1h",  "60d"),   # resamplé depuis 1h
}

# ─── PARAMÈTRES KILLINGBOT ───────────────────────────────────────────────────────
FAST_ST_PERIOD  = 7
FAST_ST_MULT    = 3.0
SLOW_ST_PERIOD  = 14
SLOW_ST_MULT    = 5.0
RSI_PERIOD      = 14
RSI_OB          = 70
RSI_OS          = 30
MACD_FAST       = 12
MACD_SLOW       = 26
MACD_SIG        = 9
VOL_MULT        = 1.2
VOL_PERIOD      = 20
RR_TP1          = 2.5
RR_TP2          = 4.0
MIN_ROWS        = 50

# ─── INDICATEURS ────────────────────────────────────────────────────────────────
def rsi(close, period=14):
    delta = close.diff()
    gain  = delta.clip(lower=0).ewm(com=period-1, adjust=False).mean()
    loss  = (-delta.clip(upper=0)).ewm(com=period-1, adjust=False).mean()
    rs    = gain / loss.replace(0, 1e-10)
    return 100 - (100 / (1 + rs))

def supertrend(df, period=10, mult=3.0):
    import pandas as pd
    import numpy as np
    hi, lo, cl = df["High"], df["Low"], df["Close"]
    prev_cl = cl.shift(1)
    tr = pd.concat([hi - lo, (hi - prev_cl).abs(), (lo - prev_cl).abs()], axis=1).max(axis=1)
    atr = tr.ewm(alpha=1/period, adjust=False).mean()
    mid = (hi + lo) / 2
    up  = mid + mult * atr
    dn  = mid - mult * atr

    direction = pd.Series(1, index=df.index)
    st_line   = pd.Series(dtype=float, index=df.index)

    for i in range(1, len(df)):
        prev_dir = direction.iloc[i-1]
        if cl.iloc[i] > up.iloc[i-1]:
            direction.iloc[i] = 1
        elif cl.iloc[i] < dn.iloc[i-1]:
            direction.iloc[i] = -1
        else:
            direction.iloc[i] = prev_dir
        st_line.iloc[i] = dn.iloc[i] if direction.iloc[i] == 1 else up.iloc[i]

    return direction, st_line

def macd(close, fast=12, slow=26, sig=9):
    ema_f = close.ewm(span=fast, adjust=False).mean()
    ema_s = close.ewm(span=slow, adjust=False).mean()
    line  = ema_f - ema_s
    sigln = line.ewm(span=sig, adjust=False).mean()
    return line, sigln

# ─── SCORING D'UN TF ────────────────────────────────────────────────────────────
def score_tf(df):
    """Retourne (score 0-5, direction int, sl_price float)"""
    import pandas as pd
    if df is None or len(df) < MIN_ROWS:
        return None, None, None
    try:
        cl  = df["Close"].squeeze()
        vol = df["Volume"].squeeze()

        rsi_val = rsi(cl, RSI_PERIOD).iloc[-1]
        fast_dir, _        = supertrend(df, FAST_ST_PERIOD, FAST_ST_MULT)
        slow_dir, slow_st  = supertrend(df, SLOW_ST_PERIOD, SLOW_ST_MULT)
        macd_line, sig_line = macd(cl, MACD_FAST, MACD_SLOW, MACD_SIG)
        vol_avg = vol.rolling(VOL_PERIOD).mean()

        fd  = int(fast_dir.iloc[-1])
        sd  = int(slow_dir.iloc[-1])
        sl  = float(slow_st.iloc[-1])
        rl  = float(rsi_val)
        ml  = float(macd_line.iloc[-1])
        sl2 = float(sig_line.iloc[-1])
        vl  = float(vol.iloc[-1])
        va  = float(vol_avg.iloc[-1]) if not pd.isna(vol_avg.iloc[-1]) else 0

        if any(map(lambda x: x != x, [rl, ml, sl2])):   # NaN check
            return None, None, None

        score = 0
        if sd == 1:   # LONG setup
            if fd == 1:                          score += 1
            if sd == 1:                          score += 1
            if RSI_OS < rl < RSI_OB:            score += 1
            if ml > sl2:                         score += 1
            if va > 0 and vl > VOL_MULT * va:   score += 1
        else:         # SHORT setup
            if fd == -1:                         score += 1
            if sd == -1:                         score += 1
            if RSI_OS < rl < RSI_OB:            score += 1
            if ml < sl2:                         score += 1
            if va > 0 and vl > VOL_MULT * va:   score += 1

        return score, sd, sl
    except Exception:
        return None, None, None

# ─── ANALYSE D'UNE PAIRE ────────────────────────────────────────────────────────
def analyze(symbol, category):
    try:
        import yfinance as yf
        import pandas as pd
    except ImportError:
        return None

    tf_results = {}
    tf_scores  = []
    tf_dirs    = []
    sl_1h      = None

    for tf_name, (interval, period) in TIMEFRAMES.items():
        try:
            raw = yf.download(
                symbol, period=period, interval=interval,
                progress=False, auto_adjust=True, actions=False,
            )
            if raw.empty:
                continue

            # Resample 1h → 4h
            if tf_name == "4h":
                raw = raw.resample("4h", label="right", closed="right").agg(
                    {"Open": "first", "High": "max", "Low": "min",
                     "Close": "last", "Volume": "sum"}
                ).dropna()

            sc, dr, sl = score_tf(raw)
            if sc is None:
                continue

            tf_results[tf_name] = {
                "score": sc,
                "direction": "LONG" if dr == 1 else "SHORT",
                "sl": round(sl, 6),
            }
            tf_scores.append(sc)
            tf_dirs.append(dr)
            if tf_name == "1h":
                sl_1h = sl

        except Exception:
            continue

    if not tf_scores:
        return None

    # Score global (0–100)
    max_score    = len(TIMEFRAMES) * 5
    raw_score    = sum(tf_scores)
    align_bonus  = 20 if len(set(tf_dirs)) == 1 and len(tf_dirs) >= 3 else 0
    final_score  = min(100, round(raw_score / max_score * 80 + align_bonus))

    # Direction majoritaire
    vote = sum(tf_dirs) / len(tf_dirs)
    direction = "LONG" if vote > 0 else "SHORT"

    # Prix courant
    try:
        last_price = float(yf.Ticker(symbol).fast_info.last_price)
    except Exception:
        last_price = None

    # SL/TP/RR
    sl_ref = sl_1h
    tp1 = tp2 = rr = None
    if last_price and sl_ref:
        dist = abs(last_price - sl_ref)
        if direction == "LONG":
            tp1 = round(last_price + dist * RR_TP1, 6)
            tp2 = round(last_price + dist * RR_TP2, 6)
        else:
            tp1 = round(last_price - dist * RR_TP1, 6)
            tp2 = round(last_price - dist * RR_TP2, 6)
        rr = RR_TP1

    # Alignement TF (5m→15m→1h→4h tous dans le même sens)
    tf_align = {
        "5m":  tf_results.get("5m",  {}).get("direction", "—"),
        "15m": tf_results.get("15m", {}).get("direction", "—"),
        "1h":  tf_results.get("1h",  {}).get("direction", "—"),
        "4h":  tf_results.get("4h",  {}).get("direction", "—"),
    }
    aligned = len(set(tf_dirs)) == 1 and len(tf_dirs) >= 3

    return {
        "symbol":     symbol,
        "category":   category,
        "score":      final_score,
        "direction":  direction,
        "aligned":    aligned,
        "tf_align":   tf_align,
        "price":      round(last_price, 6) if last_price else None,
        "sl":         round(sl_ref, 6) if sl_ref else None,
        "tp1":        tp1,
        "tp2":        tp2,
        "rr":         rr,
        "tf_count":   len(tf_scores),
    }

# ─── RUNNER PRINCIPAL ───────────────────────────────────────────────────────────
def run():
    seen    = set()
    results = []
    errors  = []

    all_pairs = []
    for cat, syms in WATCHLISTS.items():
        for s in syms:
            if s not in seen:
                seen.add(s)
                all_pairs.append((s, cat))

    total = len(all_pairs)
    for i, (symbol, cat) in enumerate(all_pairs, 1):
        print(f"  [{i}/{total}] {symbol} ({cat})", file=sys.stderr)
        r = analyze(symbol, cat)
        if r:
            results.append(r)
        else:
            errors.append(symbol)

    results.sort(key=lambda x: x["score"], reverse=True)

    output = {
        "timestamp":    datetime.now().isoformat(),
        "scan_date":    datetime.now().strftime("%d/%m/%Y %H:%M"),
        "total_scanned": len(results),
        "errors":       errors,
        "top5":         results[:5],
        "all":          results,
    }

    # Écriture JSON
    with open(RESULTS_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(json.dumps(output, indent=2))
    return output

if __name__ == "__main__":
    run()
