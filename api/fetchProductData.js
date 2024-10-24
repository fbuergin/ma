export async function fetchProductData(upc) {
  try {
    
    const URL = 'https://einkaufsmeister.onrender.com' //'http://localhost:10000'
    const response = await fetch(`${URL}/product/${upc}`);
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Daten');
    }   
    const text = await response.text();
    let data = JSON.parse(text);
    console.log('Empfangene Daten:', data);

    if(data.success) {
      data.title = data.title.toLowerCase();
      data.description = data.description.toLowerCase();
    
      return data;
    } else {
      Swal.fire({
        title: "Hinweis",
        text:'Produkt mit diesem Barcode konnte nicht in der Datenbank gefunden werden. Daher ist kein Eintrag in die Bestandsliste möglich',
        icon: "warning",
      });
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
    throw error;
  }
}

export function error(err) {
  console.error(err);
}




