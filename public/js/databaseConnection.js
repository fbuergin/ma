export async function fetchProductData(upc) {
  try {
    const URL = process.env.URL_Check === 'local' ? 'http://localhost:10000' : 'https://einkaufsmeister.onrender.com';
    const response = await fetch(`http://${URL}/product/${upc}`);
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Daten');
    }
    const data = await response.json();
    console.log('Empfangene Daten:', data);

    if (data.success === false) {
      alert('Produkt mit diesem Barcode konnte nicht in der Datenbank gefunden werden. Daher ist kein Eintrag in die Bestandsliste möglich');
    }
    data.title = data.title.toLowerCase();
    data.description = data.description.toLowerCase();
    // Weitere Verarbeitung der empfangenen Daten hier, falls erforderlich
    return data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
    throw error;
  }
}

export function error(err) {
  console.error(err);
}




