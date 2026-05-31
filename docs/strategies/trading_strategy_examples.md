# EXEMPLES CONCRETS - STRATÉGIE TRADING GOLD

**Date:** 2026-02-10
**Based on:** Live TradingView Analysis (XAUUSD)
**Platform:** TradingView Chrome Extension

---

## 📸 EXAMPLE 1: BREAKOUT DIRECT (BUY SETUP)

### Paramètres du Trade
- **Timeframe:** 1H (Tendance), 15m (Liquidity), 5m (Entry)
- **Indicateurs:** RSI(14), SuperTrend(4,11,2), Ichimoku
- **Killzones:** Asia, London, NY sessions

### Setup du Graphique (15m)
```
DATE: ~9 Février 2026
TAKE ACTION: BREAKOUT DIRECT BUY

═══════════════════════════════════════
1. TENDANCE CONFIRMATION
├─ 4H SuperTrend = VERT ✅
├─ 1H SuperTrend = VERT ✅
└─ Tendance haussière confirmée

2. ZONE DE LIQUIDITY (15m)
├─ Zone de liquidity identifiée sur 15m
├─ SuperTrend = VERT (confirme tendance)
└─ Prise de liquité détectée

3. BREAKOUT (5m)
├─ Chandelier 1 (Candle 1):
│  ├─ Breakout du SuperTrend
│  ├─ Wick au-dessus du niveau
│  └─ Corps qui dépasse le niveau
└─ Signal: BUY signal ✓

4. RETEST (Optionnel sur 5m)
├─ Prix retour vers le niveau SuperTrend
├─ Wick sur le niveau (confirme résistance)
└─ Nouveau chandelier qui dépasse le niveau

5. ENTRY BUY
├─ Level: 5 045,83 (Buy) sur 5m
├─ SL: 5 040,00 (sous le niveau cassé)
├─ TP: 5 060,00 (R/R 1:3)
└─ Risk Management: ✓
═══════════════════════════════════════
```

### Analyse Technique

**SuperTrend Breakout Pattern:**
```
          H
       /   │
      /    │  ← Wick de breakout
     /     │
    /      │
───┴───────┴───  SuperTrend Level
  /│       ││
 / │       ││  ← Corps du chandelier
/  │       ││     qui casse le niveau
```

**Conditions:**
- Wick entre 5 044,93 et 5 045,83 (au-dessus du niveau)
- Corps au-dessus du haut du chandelier précédent
- Wick modéré (pas trop grand, pas trop petit)
- Direction claire vers le haut

**Rationale:**
- Wick indique que le prix a essayé de tester le niveau
- Corps dépasse le niveau → signal fort
- Wick modéré → pas de trop gros écart → trade viable

---

## 📸 EXAMPLE 2: RETEST 1 (BUY SETUP - RECOMMANDÉ)

### Paramètres du Trade
- **Same as Example 1**
- **Entry Method:** RETEST 1 (Primary Strategy)

### Setup du Graphique (15m → 5m)

```
DATE: ~9 Février 2026
TAKE ACTION: RETEST 1 BUY (RECOMMANDÉ)

═══════════════════════════════════════
1. TENDANCE CONFIRMATION (4H + 1H)
├─ SuperTrend = VERT ✅ ✅
└─ Tendance haussière confirmée

2. BREAKOUT INITIAL (15m)
├─ Chandelier 1 cassé le SuperTrend
├─ Wick au-dessus du niveau
└─ Signal initial de breakout

3. RETEST (Optionnel 15m)
├─ Prix retour vers le niveau SuperTrend
├─ Wick sur le niveau (confirme résistance)
└─ Marché essaie de tester le niveau

4. BREAKOUT SUR 5m (PRIMARY ENTRY)
├─ Chandelier 2:
│  ├─ Wick sur le niveau (5 045,83)
│  ├─ Corps qui dépasse le niveau
│  ├─ Haut du chandelier au-dessus du niveau
│  └─ Direction claire vers le haut
└─ Entry Buy: 5 045,83

5. ENTRY BUY
├─ Level: 5 045,83 (Buy) sur 5m
├─ SL: 5 043,00 (sous le niveau de retest)
├─ TP: 5 060,00 (R/R 1:3)
└─ Confirme la résistance sur le niveau
═══════════════════════════════════════
```

### Analyse Technique

**Restest Pattern:**
```
          H
       /   │  ← Wick sur le niveau
      /    │
     /     │  ← Retest réussi
    /      │
───┴───────┴───  SuperTrend Level
  /│       ││  ← Wick sur le niveau
 / │       ││  ← Corps qui dépasse
/  │       ││  ← Confirme la résistance
```

**Conditions:**
- Wick bien positionné sur le niveau (5 045,83)
- Wick ne dépasse pas trop le niveau (confirme résistance)
- Corps dépasse le haut du chandelier précédent
- Wick modéré → plus sécurisé

**Rationale:**
- Wick sur le niveau confirme que le niveau résiste
- Corps dépasse → signal fort après confirmation
- Wick modéré → évite le trap de la zone de liquidity
- Plus sûr que le breakout direct

---

## 📸 EXAMPLE 3: CASCADE BREAKOUT (BUY SETUP)

### Paramètres du Trade
- **Same as Example 1**
- **Entry Method:** CASCADE BREAKOUT (Plus tardif mais plus sécurisé)

### Setup du Graphique (15m → 5m)

```
DATE: ~9 Février 2026
TAKE ACTION: CASCADE BREAKOUT BUY

═══════════════════════════════════════
1. TENDANCE CONFIRMATION (4H + 1H)
├─ SuperTrend = VERT ✅ ✅
└─ Tendance haussière confirmée

2. RETEST 1 (15m)
├─ Chandelier 1 retourne vers le niveau
├─ Wick sur le niveau (5 045,83)
└─ Confirme la résistance

3. RETEST 2 (15m)
├─ Chandelier 2 retourne vers le niveau
├─ Wick sur le niveau (5 045,83)
├─ Échoue à casser le niveau
└─ Encore plus confirmé

4. BREAKOUT (5m)
├─ Chandelier 3:
│  ├─ Wick sur le niveau (5 045,83)
│  ├─ Corps qui dépasse le niveau
│  ├─ Haut du chandelier au-dessus du niveau
│  ├─ Wick modéré (ne dépasse pas trop)
│  └─ Direction claire vers le haut
└─ Entry Buy: 5 045,83

5. ENTRY BUY
├─ Level: 5 045,83 (Buy) sur 5m
├─ SL: 5 044,00 (sous le niveau de retest)
├─ TP: 5 060,00 (R/R 1:3)
└─ Confirme la résistance après 2 échecs
═══════════════════════════════════════
```

### Analyse Technique

**Cascade Breakout Pattern:**
```
          H
       /   │  ← Wick 1 sur le niveau
      /    │
     /     │
    /      │  ← Retest 1
───┴───────┴───  SuperTrend Level
  /│       ││
 / │       ││  ← Wick 2 sur le niveau
/  │       ││     Confirme résistance
/   │       ││  ← Retest 2
───┴───────┴───
  /│       ││  ← Wick 3 sur le niveau
 / │       ││  ← Corps qui dépasse
/  │       ││  ← Breakout final ✓
```

**Conditions:**
- Wick sur le niveau 3 fois
- Chaque tentative échoue
- Wick modéré à chaque tentative
- Breakout final après 3 échecs

**Rationale:**
- Wick sur le niveau confirme la résistance
- Échecs répétés = résistance réelle
- Breakout final = signal très solide
- Évite la zone de liquidity déjà prise

---

## 📊 COMPARISON DES 3 MÉTHODES

| Méthode | Time de Trade | Sécurité | R/R Potentiel | Recommandation |
|---------|---------------|----------|---------------|----------------|
| **Breakout Direct** | Immédiat | ⚠️ Moyen | 1:3 | Secondary option |
| **Restest 1** | +5-15 min | ✅ Élevé | 1:3 | ⭐ RECOMMANDÉ |
| **Restest 2 / Cascade** | +20-30 min | ✅✅ Très élevé | 1:2 | Pour traders prudents |

### Priority Order (Pour un ACHAT)

1️⃣ **Restest 1** - Idéal pour la plupart des traders
2️⃣ **Restest 2 / Cascade** - Pour traders prudents
3️⃣ **Breakout Direct** - Option secondaire, moins sécurisé

---

## 🎯 POINTS CLÉS À RETENIR

### Pour Identifier le Point d'Entrée

1. **Wick Position:**
   - Wick doit toucher le niveau SuperTrend
   - Wick ne doit pas dépasser trop le niveau (2-3 pips max)
   - Wick modéré (pas trop petit, pas trop grand)

2. **Corps Position:**
   - Corps doit dépasser le haut du chandelier précédent
   - Corps doit être suffisamment solide (pas trop mince)
   - Direction claire vers le haut (haut > bas)

3. **Breakout Confirmation:**
   - Haut du chandelier > niveau SuperTrend
   - Wick doit être clairement visible
   - Pas de penetration trop profonde du niveau

### SL Positionnement

**Standard (Recommended):**
```
SL: Sous le niveau de la zone cassée
  ├─ Pour Restest 1: Sous le niveau 5 045,83
  ├─ Pour Breakout direct: Sous le haut du chandelier
  └─ Pour Cascade: Sous le niveau de retest
```

**Plus serré (Pour R/R meilleur):**
```
SL: Sous le corps du chandelier de breakout
  ├─ Avantage: SL plus petit, R/R plus élevé
  ├─ RISQUE: Peut être atteint rapidement
  └─ À utiliser seulement si le chandelier est fort
```

### TP Positionnement

**Option 1: SuperTrend Follower (Plus sûr):**
```
TP1: Premier niveau SuperTrend
TP2: Deuxième niveau SuperTrend
TP3: R% du SL (2x SL = TP)
```

**Option 2: Multiple TP Levels (Plus de profit):**
```
TP1: 50% de la position (SL + 50%)
TP2: 30% de la position (SL + 80%)
TP3: Reste (SL + 100%+ avec trailing stop)
```

**Option 3: R/R Based (Objectif précis):**
```
TP: SL × 2 (R/R minimum 1:2)
TP: SL × 3 (R/R minimum 1:3)
Suivre avec trailing stop jusqu'au TP final
```

---

## 📈 CHECKLIST AVANT CHAQUE TRADE

### Pour un ACHAT (BUY SETUP)

```
☐ 4H SuperTrend = VERT ✅
☐ 1H SuperTrend = VERT ✅
☐ 15m SuperTrend = VERT ✅
☐ Zone de liquidity identifiée sur 15m
☐ Wick sur le niveau SuperTrend
☐ Wick modéré (pas trop petit, pas trop grand)
☐ Corps du chandelier qui dépasse le niveau
☐ Haut du chandelier > niveau SuperTrend
☐ Wick au-dessus du niveau (pas de penetration profonde)
☐ SL positionné (sous le niveau de la zone cassée)
☐ TP calculé (R/R minimum 1:2)
☐ Aucun news majeur à venir
☐ Capital disponible pour le trade
☐ ✓ ENTRY BUY DÉCLENCHÉE
```

---

## ⚠️ ERREURS À ÉVITER

### 1. Wick trop grand
```
❌ Wick qui dépasse de plus de 5-10 pips le niveau
✅ Wick modéré (2-3 pips)
```

### 2. Corps trop mince
```
❌ Chandelier avec corps très mince (confirmation douteuse)
✅ Chandelier avec corps solide (minimum 50% de l'étendue du chandelier)
```

### 3. Pas de retracement après la cassure
```
❌ Breakout direct sans retracement préalable
✅ Retest du niveau (première ou deuxième tentative)
```

### 4. Wick invisible
```
❌ Wick infime qui frôle le niveau (peut être une erreur)
✅ Wick clair et visible sur le niveau
```

### 5. SL mal positionné
```
❌ SL trop près du niveau (risque d'être touché rapidement)
✅ SL sous le niveau de la zone cassée (marge suffisante)
```

---

## 🔄 EXAMPLES VISUELS

### Breakout Direct
```
        H
     /   │
    /    │  ← Wick de breakout
   /     │
  /      │
───┴──────┴───  SuperTrend
 /│       │
/ │       │  ← Corps qui dépasse
```

### Restest 1
```
        H
     /   │  ← Wick sur le niveau
    /    │
   /     │  ← Retest
  /      │
───┴──────┴───  SuperTrend
 /│       ││  ← Wick sur le niveau
/ │       ││  ← Corps qui dépasse
```

### Cascade
```
        H
     /   │  ← Wick 1
    /    │
   /     │  ← Retest 1
───┴──────┴───
 /│       ││  ← Wick 2
/ │       ││  ← Retest 2
───┴──────┴───
 /│       ││  ← Wick 3
/ │       ││  ← Corps qui dépasse
```

---

## 📝 CONCLUSION

### Meilleure Méthode
**Restest 1** - Équilibre parfait entre sécurité et opportunité

### Quand utiliser chaque méthode
- **Start:** Breakout direct (option rapide)
- **Primary:** Restest 1 (meilleur équilibre)
- **Fallback:** Restest 2 / Cascade (plus sécurisé)

### Point clé
Le **wicks** sur le niveau SuperTrend confirment la résistance, et le **corps** qui dépasse le niveau confirme le signal d'entrée.

---

**Dernière mise à jour:** 2026-02-10
**Statut:** Examples basés sur live data, à confirmer avec trading réel