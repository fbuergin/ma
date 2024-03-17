export async function fetchProductData(upc) {
  try {
    const response = await fetch(`http://localhost:3000/product/${upc}`);
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Daten');
    }
    const data = await response.json();
    console.log('Empfangene Daten:', data);
    // Weitere Verarbeitung der empfangenen Daten hier, falls erforderlich
    return data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
    throw error;
  }
}



/*
//übungs funktion
export function fetchProductData(upc) {
  try {
    let data = {
      description: 'Taschentücher'
    };
    return data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
    throw error;
  }


}
*/

export function error(err) {
  console.error(err);
}




