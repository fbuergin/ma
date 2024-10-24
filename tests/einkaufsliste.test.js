import { Einkaufsliste } from "../public/js/einkaufsliste.js";
import { fetchTranslation, detectLanguage } from "../api/googleTranslation.js";

test('lädt und speichert Bestand korrekt im LocalStorage', () => {
    const mockBestand = [{ description: 'apfel', menge: 5, barcode: '123' }];
    localStorage.setItem('bestand', JSON.stringify(mockBestand));
    const einkaufsliste = new Einkaufsliste();
    const bestand = einkaufsliste.loadBestandFromLocalStorage();
    expect(bestand).toEqual(mockBestand);
    
    // Überprüft der Bestand korrekt gespeichert wird
    einkaufsliste.saveBestandToLocalStorage(mockBestand);
    const savedData = JSON.parse(localStorage.getItem('bestand'));
    expect(savedData).toEqual(mockBestand);
});


test('bereinigt die provisorische Einkaufsliste korrekt', () => {
    const einkaufsliste = new Einkaufsliste();
    const mockProvEinkaufsliste = {
        gleicheProdukte: [
            { einkaufslisteName: 'apfel', menuMenge: 5 },
            { einkaufslisteName: 'apfel', menuMenge: 3 },
        ]
    };
    localStorage.setItem('provEinkaufsliste', JSON.stringify(mockProvEinkaufsliste));
    const bereinigt = einkaufsliste.bereinigeProvEinkaufsliste();
    //Da beides die gleichen Produkte sind, sollen die Mengen zusammengezählt werden
    expect(bereinigt).toEqual([{ apfel: [{ einkaufslisteName: 'apfel', menuMenge: 5 }, { einkaufslisteName: 'apfel', menuMenge: 3 }], menuMengeTot: 8 }]);
});



// mocke API-Aufrufe
jest.mock("../api/googleTranslation.js");

test('aktualisiert den Bestand nach dem Scannen eines Produkts', async () => {
  const einkaufsliste = new Einkaufsliste();

  //mock einkaufsliste
  einkaufsliste.einkaufsliste = [
    { id: '1', produktName: 'apfel', einkaufsMenge: 5 }
  ];

  const mockProdukt = { produktName: 'apfel', menge: 5, barcode: '123' };

  //mock den Bestand im Localstorage
  const mockBestand = [{ description: 'apfel', menge: 10, barcode: '123' }];
  localStorage.setItem('bestand', JSON.stringify(mockBestand));

  detectLanguage.mockResolvedValue('de'); 
  fetchTranslation.mockResolvedValue({
    translations: ['apfel']  
  });

  // mocke renderEinkaufslisteHTML um den DOM-Zugriff zu verhindern
  jest.spyOn(einkaufsliste, 'renderEinkaufslisteHTML').mockImplementation(() => {});

  await einkaufsliste.updateBestand(false, mockProdukt, 5);


  const bestand = JSON.parse(localStorage.getItem('bestand'));
  expect(bestand[0].menge).toBe(15); 

  // Produkt soll von Einkaufsliste entfernt worden sein und die Einkaufsliste ist somit leer
  expect(einkaufsliste.einkaufsliste.length).toBe(0);  
});
