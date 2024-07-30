export async function fetchSynonyms(word) {
  try {
    const response = await fetch(`http://localhost:10000/synonyms/${word}`);
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Synonyme');
    }
    const data = await response.json();
    //console.log('Empfangene Synonyme:', data);

    // Weitere Verarbeitung der empfangenen Synonyme hier, falls erforderlich
    return data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Synonyme:', error);
    throw error;
  }
}
