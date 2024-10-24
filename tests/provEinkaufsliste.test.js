import { ProvEinkaufsliste } from "../public/js/einkaufsliste-provisorisch.js";
import { fetchSynonyms } from "../api/fetchSynonyms.js";
import { fetchTranslation, detectLanguage } from "../api/googleTranslation.js";

// mock API Abfragen 
jest.mock("../api/fetchSynonyms.js");
jest.mock("../api/googleTranslation.js");

global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
  fetchSynonyms.mockClear();
  fetchTranslation.mockClear();
  detectLanguage.mockClear();
});

test('produkteUndZutatenAbgleichen gibt das erwartete abgeglicheneProdukte Objekt zurück', async () => {
  const mockMenüpläne = [
    [
      {
        id: 1, tag: 'Montag', name: '', zutaten: [
          { produktName: 'apfel', menge: 5 },
          { produktName: 'roter apfel', menge: 5 },
          { produktName: 'flohsamenschalen', menge: 5 },
          { produktName: 'ananas', menge: 5 },
          { produktName: 'almond', menge: 5 }
        ] 
      }
    ]
  ];

  const mockBestand = [
    { description: 'apfel', menge: 1, barcode: '002' },
    { description: 'Banane', menge: 1, barcode: '007' },
    { description: 'Ananas', menge: 1, barcode: '008' },
    { description: 'flohsamenschalen', menge: 11, barcode: '7613312115152', title: 'flohsamenschalen' },
    { description: 'mandeln ungeschält', menge: 3, barcode: '7613413835751', title: 'mandeln ungeschält' }
  ];

  const expectedAbgeglicheneProdukte = {
    gefundeneProdukte: [
      {
        description: 'apfel',
        menge: 1,
        barcode: '002',
        id: expect.any(String),
        menuZutatName: 'apfel',
        menuMenge: 5,
        zutatStatus: 'gleich'
      },
      {
        description: 'apfel',
        menge: 1,
        barcode: '002',
        id: expect.any(String),
        menuZutatName: 'roter apfel',
        menuMenge: 5,
        zutatStatus: 'ähnlich'  
      },
      {
        title: 'flohsamenschalen',
        description: 'flohsamenschalen',
        menge: 11,
        barcode: '7613312115152',
        id: expect.any(String),
        menuZutatName: 'flohsamenschalen',
        menuMenge: 5,
        zutatStatus: 'gleich' 
      },
      {
        description: 'Ananas',
        menge: 1,
        barcode: '008',
        id: expect.any(String),
        menuZutatName: 'ananas',
        menuMenge: 5,
        zutatStatus: 'gleich'
      },
      {
        description: 'mandeln ungeschält',
        title: 'mandeln ungeschält',  
        menge: 3,
        barcode: '7613413835751',
        id: expect.any(String),
        menuZutatName: 'almond',
        menuMenge: 5,
        zutatStatus: 'ähnlich'
      }
    ],
    nichtGefundeneProdukte: [] 
  };
  // Mock fetchTranslation, detectLanguage, and fetchSynonyms
  detectLanguage.mockResolvedValue('en');
  fetchTranslation.mockResolvedValue({
    translations: ['Mandel']
  });
  fetchSynonyms.mockResolvedValue([]);

  const provEinkaufsliste = new ProvEinkaufsliste();
  const abgeglicheneProdukte = await provEinkaufsliste.produkteUndZutatenAbgleichen(mockMenüpläne, mockBestand);

  expect(abgeglicheneProdukte).toEqual(expectedAbgeglicheneProdukte);
});


test('speichert die provisorische Einkaufsliste im LocalStorage', () => {
  const mockEinkaufsliste = { gleicheProdukte: [] };
  const einkaufsliste = new ProvEinkaufsliste();
  einkaufsliste.saveProvEinkaufslisteToLocalStorage(mockEinkaufsliste);
  const gespeicherteListe = JSON.parse(localStorage.getItem('provEinkaufsliste'));
  expect(gespeicherteListe).toEqual(mockEinkaufsliste);
});


test('lädt Bestand aus LocalStorage oder erstellt neuen', () => {
  const mockBestand = [{ description: 'apfel', menge: 1, barcode: '002' }];
  localStorage.setItem('bestand', JSON.stringify(mockBestand));
  const einkaufsliste = new ProvEinkaufsliste();
  const bestand = einkaufsliste.loadBestandFromLocalStorage();
  expect(bestand).toEqual(mockBestand);
});

