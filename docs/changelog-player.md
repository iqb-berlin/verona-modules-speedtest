Player
======
## 2.0.0
# Neue Funktionen
- Antworten enthalten zusätzlich die Summen der richtigen und falschen Antworten
- Antwortdaten einzelner Fragen enthalten zusätzlich den Code und Score (1 für richtig)

## Änderungen
- Veränderte Formatierung der Ergebnisdaten. Alle Daten werden als Array übermittelt.
- API-Kommunikation, die Angaben zu Seiten macht wurde entfernt. Der Host erfährt nichts mehr über vermeintliche Seiten. (z.B wird kein PlayerState mit validPages mehr gesendet und es wird nicht mehr auf vopPageNavigationCommand reagiert)

## 1.0.0
- Zuletzt gesehene Seite wird beim Neuladen wiederhergestellt
- Layout überarbeitet (in der Hoffnung, dass damit große Bilder keine Probleme mehr machen)
- Outro-Seite wird angezeigt nachdem man die letzte Seite gesehen und bearbeitet hat
- Fehlermeldung bei neu angelegter Aufgabe im Studio behoben

## 0.6.0-beta
- Neuer Font: Nunito Sans
- Ausufernde Bilder werden besser begrenzt
