import { promises as fs } from 'fs';

async function parseText() {
  try {
    const data = await fs.readFile('openthesaurus.txt', 'utf-8');
    //teile Daten in Linien auf
    const lines = data.split('\n');
    const synonyms = {};

    for (const line of lines) {
      //überspringe leere Linien
      if (line.startsWith('#') || line.trim() === '') {
        continue;
      }
      //teile Linien in Wörter auf
      const words = line.split(';');

      for (const word of words) {
        //entferne alle Wörter in den Klammern
        const cleanedWord = word.replace(/\(.*?\)/g, '').trim().toLowerCase();
        if (cleanedWord === '') continue; 

        // Strukturiere die Daten in einem JavaScript-Objekt
        if (!synonyms[cleanedWord]) {
          synonyms[cleanedWord] = [];
        }      
        synonyms[cleanedWord] = [
          ...synonyms[cleanedWord],
          ...words
            .filter(w => w.trim().toLowerCase() !== cleanedWord) 
            .map(w => w.trim().toLowerCase().replace(/\(.*?\)/g, '').trim())
        ];
      }
    }
    //erstelle die JSON Datei
    await fs.writeFile('synonyms.json', JSON.stringify(synonyms, 2));
    console.log('Synonyms successfully processed and saved to synonyms.json');
  } catch (error) {
    console.error('Error processing synonyms file:', error);
  }
}
parseText();