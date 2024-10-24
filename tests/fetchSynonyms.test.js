import { fetchSynonyms } from "../api/fetchSynonyms.js";

//verhindere API-Aufrufe mit globalem mock
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

test('fetchSynonyms gibt die richtigen Synonyme zurück, wenn das Wort vorhanden ist', async () => {
  const mockData = {
    tomate: [
      "paradiesapfel",
      "solanum esculentum",
      "paradeisapfel",
      "solanum lycopersicum",
      "paradeiser",
      "lycopersicon esculentum",
      "lycopersicon lycopersicum",
      "liebesapfel"
    ],
    apfel: [
      "paradiesfrucht",
      "apfelfrucht"
    ]
  };

  //simuliert erfolgreiche API-Antwort
  fetch.mockResolvedValueOnce({
    ok: true,
    text: async () => JSON.stringify(mockData)
  });

  const synonyme = await fetchSynonyms('Apfel');
  expect(synonyme).toEqual(["paradiesfrucht", "apfelfrucht"]);
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('fetchSynonyms gibt ein leeres Array zurück, wenn keine Synonyme vorhanden sind', async () => {
  const mockData = {
    tomate: [
      "paradiesapfel",
      "solanum esculentum",
      "paradeisapfel",
      "solanum lycopersicum",
      "paradeiser",
      "lycopersicon esculentum",
      "lycopersicon lycopersicum",
      "liebesapfel"
    ],
    apfel: [
      "paradiesfrucht",
      "apfelfrucht"
    ]
  };

  //simuliert erfolgreiche API-Antwort
  fetch.mockResolvedValueOnce({
    ok: true,
    text: async () => JSON.stringify(mockData)
  });


  const synonyme = await fetchSynonyms('Katze');
  //erwartet leeres array da keine Synonyme existieren
  expect(synonyme).toEqual([]);
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('fetchSynonyms gibt ein leeres Array zurück, wenn ein Fehler auftritt', async () => {
  //simuliert Fehler in API-Anfrage
  fetch.mockRejectedValueOnce(new Error('Fehler beim Abrufen von Synonymen'));

  const synonyme = await fetchSynonyms('Apfel');
  expect(synonyme).toEqual([]);
  expect(fetch).toHaveBeenCalledTimes(1);
});
