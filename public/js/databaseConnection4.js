export async function fetchSynonyms(suchbegriff) {
  try {
    const URL = 'https://einkaufsmeister.onrender.com' //'http://localhost:10000'
    const response = await fetch(`http://${URL}/getdata`);
    const data = await response.text();

    const lines = data.split('\n');
    const synonyms = {};

    for (const line of lines) {
      if (line.startsWith('#') || line.trim() === '') continue;

      const words = line.split(';');

      for (const word of words) {
        // Remove words in parentheses
        const cleanedWord = word.replace(/\(.*?\)/g, '').trim().toLowerCase();
        if (cleanedWord === '') continue; 
        if (!synonyms[cleanedWord]) synonyms[cleanedWord] = [];
        synonyms[cleanedWord] = [
          ...synonyms[cleanedWord],
          ...words
            .filter(w => w.trim().toLowerCase() !== cleanedWord) 
            .map(w => w.trim().toLowerCase().replace(/\(.*?\)/g, ''))
        ];
      }
    }

    const gefundeneSynonyme = synonyms[suchbegriff.toLowerCase()];

    if (gefundeneSynonyme) {
      return gefundeneSynonyme;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Fehler beim Abrufen von Synonymen:', error);
    return [];
  }
}


