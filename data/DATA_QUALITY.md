# Qualité des données sources (`basedesdonnes/`)

Constats faits en préparant le pipeline (`scripts/build-data.mjs`), à connaître avant toute réutilisation de ces CSV ailleurs.

## Conversions nécessaires

- **Précipitations historiques** (`C_CB_<code>.csv`, 1935-2014) : valeurs en flux `kg/m²/s` (ex. `0.000127`), **pas** en mm. Conversion : `mm/mois = pr * 86400 * jours_du_mois`. Vérifié cohérent avec les fichiers de projection (déjà en mm) à la jonction 2014/2015.
- **Projections de précipitations** (`C_CB_<code>_1.csv`, 2015-2099) : déjà en mm/mois, aucune conversion nécessaire.
- **Température** (`C_CB_<code>_3.csv`) : `°C`, décimales avec virgule (`25,5366`) → à remplacer par un point.

## Anomalies ponctuelles détectées et corrigées par le pipeline

| Station (code) | Problème | Traitement |
|---|---|---|
| 612 (ITB-16, Wamba Nord) | Température en **Kelvin** (~295-298) alors que toutes les autres stations sont en Celsius (~22-29) | Pipeline convertit automatiquement toute valeur `tas > 100` en Celsius (`- 273.15`) |
| 613 (ITB-17, Wamba Sud) | Pas de fichier `_3.csv` ; le fichier `_1.csv` censé contenir la projection de pluie contient en réalité des données de température (`year;month;tas`, 961 lignes se terminant en 2014, valeurs ~22-25) | Précipitation projetée traitée comme **absente** pour cette station (repli sur la dernière donnée historique disponible, déc. 2014) ; le fichier `_1.csv` est réutilisé comme source de température historique |
| 1189 (ITB-29, Bondo) | `_1.csv` (projection pluie) corrompu : valeurs en rampe artificielle (`2 592 000 × mois`, identique chaque année 2015-2099), sans rapport avec un signal climatique réel | Rejeté par une validation de plausibilité (variance quasi nulle / valeurs absurdes) ; repli sur l'historique (déc. 2014) |
| 1448 (ITB-32, Opala) | `_1.csv` (projection pluie) constant : `259` sur les 1020 lignes, sans variation | Idem : rejeté, repli sur l'historique (déc. 2014) |
| 314, 612 | En-tête CSV malformé (`year;;tas`, `year;month;tas;`) | Sans impact : le parseur lit désormais les colonnes par position, pas par nom |

Conséquence visible dans l'app : pour ITB-16, ITB-17, ITB-29 et ITB-32, le statut « actuel » n'est **pas** basé sur septembre 2026 mais sur la dernière donnée réellement fiable (décembre 2014) — la date affichée le précise, ce n'est pas une approximation silencieuse.

## Résolution du maillage climatique

Les 32 fichiers `C_CB_<code>` ne sont pas 32 séries indépendantes : plusieurs partagent un contenu **strictement identique** (probable résolution de grille climatique plus grossière que le nombre de points d'extraction). Groupes identiques observés sur l'historique de pluie :

- 309, 310, 312, 316, 318, 319, 612, 1190, 1448
- 315, 317, 320, 611, 613, 614, 615, 618, 619
- 311, 313, 314
- 1161, 1162, 616, 617
- 965, 966, 967
- 514, 515
- 1279 et 1189 sont chacune uniques

→ Plusieurs des « 32 sous-bassins » de l'interface afficheront donc des valeurs de pluie identiques. C'est une caractéristique réelle de la donnée source, pas un bug d'affichage — à mentionner si ce prototype évolue vers un usage opérationnel (il faudrait alors une grille climatique plus fine ou un vrai réseau de stations).
