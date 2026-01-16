# 3.3.0
## Player
### Änderungen
- Vertikale Abstände verschiedener Elemente verringert, sodass 3-4 Antwortknöpfe in vertikaler Ansicht angezeigrt werden können, ohne Beschnitten zu werden.

# 3.2.0
### Neue Funktionen
- Neue globale Einstellung: Knopfbreite
  Hierrüber kann eine feste Breite für Antwortknöpfe eingestellt werden. Das alte Verhalten kann wiederhergestellt werden, wenn das Feld geleert wird.
## Player
### Neue Funktionen
- Antworttyp: Zahlen
  - Überarbeitung des Löschmechanismus:
    - Es gibt keine Cursortasten zur Navigation der Ergebnisfelder mehr, sondern nur noch eine Löschtaste. Diese entfernt den Wert aus dem ausgewählten Feld. Insofern das Feld bereits leer ist, springt die Auswahl zum vorherigen Feld und löscht dort den Wert. Dieses Verhalten soll dem von normalen Eingabefeldern ähneln.
  - Zifferneingabe kann via Hardware-Tastatur vorgenommen werden. Ebenso die Navigation zwischen den Felder via Cursortasten.
  - Ergebnisfelder können direkt ausgewählt werden (ohne separate Cursortasten; diese gäbe es ohnehin nicht mehr)
### Änderungen
- Knöpfe bei Text- und Zahlenantworten vergrößert
- Schrift vergrößert
- Audio-Icon und Weiter-Icon ausgetauscht

# 3.1.1
### Fehlerbehebungen
- Einbindung neuen Fonts korrigiert

# 3.1.0
### Änderungen
- Neuer Font: "IQBprimar"
## editor
### Neue Funktionen
- Aufgaben können nach vorne/hinten verschoben werden
### Änderungen
- Kleine Verbesserung der Oberfläche
- Überprüft unterstützte Version der geladenen Unit und verweigert sich ggf.
- Repariert Windows-spezifische Zeilenendungen, sodass Probleme beim CSV-Import vermieden werden
- Erkennt Probleme bei der Zeichensatzkodierung und zeigt Warnung, wenn nicht UTF-8 verwendet wird
### Fehlerbehebungen
- CSV-Import funktioniert auch, wenn nicht alle Spalten (Lösungen etc.) angegeben werden

# 3.0.6
### Fehlerbehebungen
- Session ID von der Hostanwendung wird korrekt gelesen

# 3.0.0
### Neue Funktionen
- Neue Formate:
  - Bilder als Antwortoptionen
  - Audio als Frage
  - Zahleneingabe
- Instruktionstext (als globale Einstellung für alle Fragen)

# 2.1.1
### Änderungen
- Umstellung auf Schriftart ABeeZee
### Fehlerbehebungen
- Einlesen von Unit-Zustandsdaten korrigiert
- Antworten werden nicht mehr als falsch gewertet, wenn die richtige Antwort nicht hinterlegt ist

# 2.0.2
### Fehlerbehebungen
- Antwortdaten verwenden subform (hoffentlich) korrekt

# 2.0.1
## editor
### Neue Funktionen
- Sendet Variablen-Informationen (nicht für "time")
### Fehlerbehebungen
- Sendet Änderungen der richtigen Antwort an das Hostsystem
## player
### Fehlerbehebungen
- Auswertung von richtigen Antworten. Diese sind jetzt tatsächlich in den Antwortdaten enthalten.
- Ungehöriges Attribut "subform" aus Antwortdaten der Summen entfernt

# 2.0.0
## editor
### Neue Funktionen
- Zu jeder Frage kann die richtige Antwort gesetzt werden
## player
### Neue Funktionen
- Antworten enthalten zusätzlich die Summen der richtigen und falschen Antworten
- Antwortdaten einzelner Fragen enthalten zusätzlich den Code und Score (1 für richtig)
### Änderungen
- Veränderte Formatierung der Ergebnisdaten. Alle Daten werden als Array übermittelt.
- API-Kommunikation, die Angaben zu Seiten macht wurde entfernt. Der Host erfährt nichts mehr über vermeintliche Seiten. (z.B wird kein PlayerState mit validPages mehr gesendet und es wird nicht mehr auf vopPageNavigationCommand reagiert)

# 1.0.0
## editor
- Fehlermeldung bei neu angelegter Aufgabe im Studio behoben
## player
- Zuletzt gesehene Seite wird beim Neuladen wiederhergestellt
- Layout überarbeitet (in der Hoffnung, dass damit große Bilder keine Probleme mehr machen)
- Outro-Seite wird angezeigt nachdem man die letzte Seite gesehen und bearbeitet hat
- Fehlermeldung bei neu angelegter Aufgabe im Studio behoben

# 0.6.0-beta
## editor
- Knöpfe zum Übernehmen von Fragen und Antworten hinzugefügt
- individuelle Ausrichtung einzelner Fragen entfernt
- Neuer Font: Nunito Sans
## player
- Neuer Font: Nunito Sans
- Ausufernde Bilder werden besser begrenzt
