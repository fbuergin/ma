/*export async function fetchSynonyms(suchbegriff) {
  fetch('http://localhost:10000/getdata')
    .then(response => response.text())
    .then(data => {
      // Hier können Sie die Daten verarbeiten
      const lines = data.split('\n'); 
      const synonyms = {}; 

   
      for (const line of lines) {
        // Überspringt Kommentare und leere Zeilen
        if (line.startsWith('#') || line.trim() === '') continue;

        // Entfernt Inhalte in Klammern und teilt die Zeile in Wörter
        const words = line.replace(/\(.*?\)/g, '').toLowerCase().split(';');

        // Fügt jedes Wort und seine Synonyme zum Synonym-Objekt hinzu
        for (const word of words) {
          synonyms[word] = words.filter(w => w !== word);
        }
      }

      // Jetzt können Sie nach einem Wort suchen und seine Synonyme erhalten
      const gefundeneSynonyme = synonyms[suchbegriff];

      if (gefundeneSynonyme) {
        console.log(gefundeneSynonyme);
        return gefundeneSynonyme
      } else {
        console.log(`gefundene Synonyme ist leer: ${gefundeneSynonyme}`);
        return ['test']
      }
    })
    .catch(error => console.error('Error:', error));
}
*/
/*
export async function fetchSynonyms(suchbegriff) {
  try {
    const response = await fetch('http://localhost:10000/getdata');
    const data = await response.text();

    const lines = data.split('\n');
    const synonyms = {};

    for (const line of lines) {
      if (line.startsWith('#') || line.trim() === '') continue;

      const words = line.replace(/\(.*?\)/g, '').toLowerCase().split(';');

      for (const word of words) {
        synonyms[word] = words.filter(w => w !== word);
      }
    }

    const gefundeneSynonyme = synonyms[suchbegriff];

    if (gefundeneSynonyme) {
      console.log(gefundeneSynonyme);
      return gefundeneSynonyme;
    } else {
      console.log(`Keine Synonyme gefunden für: ${suchbegriff}`);
      return [];
    }
  } catch (error) {
    console.error('Fehler beim Abrufen von Synonymen:', error);
    return [];
  }
}
*/
export async function fetchSynonyms(suchbegriff) {
  try {
    const response = await fetch('http://localhost:10000/getdata');
    const data = await response.text();

    const lines = data.split('\n');
    const synonyms = {};

    for (const line of lines) {
      if (line.startsWith('#') || line.trim() === '') continue;

      const words = line.split(';');

      for (const word of words) {
        // Remove words in parentheses
        const cleanedWord = word.replace(/\(.*?\)/g, '').trim().toLowerCase();
        if (cleanedWord === '') continue; // Skip if the word is empty after cleaning

        if (!synonyms[cleanedWord]) synonyms[cleanedWord] = [];
        synonyms[cleanedWord] = [
          ...synonyms[cleanedWord],
          ...words
            .filter(w => w.trim().toLowerCase() !== cleanedWord) // Remove the cleaned word itself
            .map(w => w.trim().toLowerCase().replace(/\(.*?\)/g, '')) // Remove words in parentheses from synonyms
        ];
      }
    }

    const gefundeneSynonyme = synonyms[suchbegriff.toLowerCase()];

    if (gefundeneSynonyme) {
      //console.log(gefundeneSynonyme);
      return gefundeneSynonyme;
    } else {
      //console.log(`Keine Synonyme gefunden für: ${suchbegriff}`);
      return [];
    }
  } catch (error) {
    console.error('Fehler beim Abrufen von Synonymen:', error);
    return [];
  }
}


