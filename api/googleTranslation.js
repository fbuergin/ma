export async function fetchTranslation(text, targetLang) {
  const URL = 'https://einkaufsmeister.onrender.com' //'http://localhost:3000'

  try {
    const response = await fetch(`${URL}/google-translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLang }),
    });
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Übersetzung');
    }
    const data = await response.json();

    console.log(data)
    return data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Übersetzung:', error);
    throw error;
  } 
}


export async function detectLanguage(text) {
  const URL = 'https://einkaufsmeister.onrender.com' //'http://localhost:3000'
  try {
    const response = await fetch(`${URL}/detect-language`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Fehler beim Erkennen der Sprache');
    }

    const data = await response.json();
    console.log(data)

    return data;
    
  } catch (error) {
    console.error('Fehler beim Abrufen der Detection:', error);
    throw error;
  } 
}