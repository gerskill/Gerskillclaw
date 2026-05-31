# Pine Script v6 — Journal des Erreurs Connues

> **RÈGLE** : Avant toute livraison de script Pine Script, l'agent de vérification DOIT
> scanner le code contre cette liste. Si une erreur est trouvée, corriger ET mettre à jour ce fichier.

---

## ❌ ERREUR #1 — Multi-ligne ternaire avec déclaration typée (CE10156)

**Symptôme :** `Syntax error at input "end of line without line continuation" (CE10156)`

**Pattern interdit :** une variable déclarée avec son type (`float`, `int`, `bool`, `string`, `color`)
dont la valeur ternaire se coupe sur plusieurs lignes avec `:` en fin de ligne.

```pine
// ❌ INTERDIT
float pnl_pct = condition1 ? valeur1 :
                condition2 ? valeur2 : na

// ❌ INTERDIT
string sig_txt = cond_a ? "A" :
                 cond_b ? "B" : "C"

// ❌ INTERDIT  
color sig_col = cond ? color.lime :
                color.red
```

**Règle :** Toute déclaration typée avec ternaire → **une seule ligne**, aussi longue soit-elle.

```pine
// ✅ CORRECT
float pnl_pct = condition1 ? valeur1 : condition2 ? valeur2 : na

// ✅ CORRECT
string sig_txt = cond_a ? "A" : cond_b ? "B" : "C"

// ✅ CORRECT
color sig_col = cond ? color.lime : color.red
```

**Exception :** les variables **sans annotation de type** peuvent casser sur plusieurs lignes
si chaque ligne se termine par `:` — Pine infère le type et accepte la continuation.

```pine
// ✅ ACCEPTÉ (pas de type explicite)
fill_col = range_hard ? color.red :
           is_range   ? color.purple :
           color.gray
```

**Fichiers corrigés :** killingbot_v1.1.pine (pnl_pct, sig_txt, sig_col) — 2026-05-10

---

## ❌ ERREUR #2 — À documenter si nouvelle erreur trouvée

_(Ajouter ici les prochaines erreurs découvertes)_

---

## ✅ Patterns SÛRS — Pine Script v6

| Pattern | OK ? | Notes |
|---------|------|-------|
| `bool x = cond and\n  cond2` | ✅ | `and` en fin de ligne = continuation valide |
| `bool x = cond or\n  cond2` | ✅ | `or` en fin de ligne = continuation valide |
| `x = ternaire\n  : suite` | ✅ si non typé | Variable sans annotation de type |
| `float x = ternaire\n  : suite` | ❌ | Doit tenir sur une ligne |
| `ta.atr()`, `ta.ema()`, etc. | ✅ | Appels standard |
| `request.security()` avec tuple | ✅ | `[a, b] = request.security(...)` |
| Multi-ligne dans `if/else` | ✅ | Pas de restriction sur les blocs |

---

## 📋 Checklist Agent Vérification (avant chaque livraison)

```
[ ] Aucune déclaration typée (float/int/bool/string/color) ne se termine par ":" en fin de ligne
[ ] Aucun ternaire avec type explicite ne s'étend sur plusieurs lignes
[ ] Toutes les fonctions sont appelées avec les bons types d'arguments
[ ] Les strategy.exit() référencent des strategy.entry() existants
[ ] Pas de variable réutilisée avec "=" au lieu de ":=" après déclaration
[ ] Les plots non-affichés utilisent color=na (pas de couleur visible)
```
