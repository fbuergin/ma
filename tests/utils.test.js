import { vergleicheEigenschaften, vergleicheUnterschiedlicheEigenschaften, formatiereString, istGültig } from "../public/js/utils.js";
//quagga ebenfalls per npm installier da im test nur so darauf zugegriffen werden kann. Verwendung per CDN-link geht nicht
//import Quagga from '@ericblade/quagga2'; 


test('istGültig gibt true zurück, wenn beide Werte gültig sind', () => {
  expect(istGültig('value1', 'value2')).toBe(true);  
  expect(istGültig(0, 'value')).toBe(true);          
});

test('istGültig gibt false zurück, wenn ein Wert ungültig ist', () => {
  expect(istGültig(undefined, 'value')).toBe(false); 
  expect(istGültig(null, 'value')).toBe(false);      
  expect(istGültig('', 'value')).toBe(false);        
  expect(istGültig('value', undefined)).toBe(false); 
  expect(istGültig('value', null)).toBe(false);      
  expect(istGültig('value', '')).toBe(false);        
});
test('vergleicheEigenschaften gibt true zurück, wenn die Eigenschaften gleich und gültig sind', () => {
  const item1 = { name: 'Apfel' };
  const item2 = { name: 'Apfel' };
  expect(vergleicheEigenschaften(item1, item2, 'name')).toBe(true);
});

test('vergleicheEigenschaften gibt false zurück, wenn die Eigenschaften unterschiedlich sind', () => {
  const item1 = { name: 'Apfel' };
  const item2 = { name: 'Banane' };
  expect(vergleicheEigenschaften(item1, item2, 'name')).toBe(false);
});

test('vergleicheUnterschiedlicheEigenschaften gibt true zurück, wenn verschiedene Eigenschaften gleich und gültig sind', () => {
  const item1 = { description: 'Apfel' };
  const item2 = { title: 'Apfel' };
  expect(vergleicheUnterschiedlicheEigenschaften(item1, item2, 'description', 'title')).toBe(true);
});

test('vergleicheUnterschiedlicheEigenschaften gibt false zurück, wenn verschiedene Eigenschaften unterschiedlich sind', () => {
  const item1 = { description: 'Apfel' };
  const item2 = { title: 'Banane' };
  expect(vergleicheUnterschiedlicheEigenschaften(item1, item2, 'description', 'title')).toBe(false);
});


test('formatiereString formatiert Ausnahmen nicht', () => {
  const input = 'eine rote tomate';
  const expected = 'Eine rote Tomate';
  expect(formatiereString(input)).toBe(expected);
});


/*
// Quagga korrekt mocken
jest.mock('@ericblade/quagga2', () => ({
  init: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(() => Promise.resolve()), // stop gibt ein aufgelöstes Promise zurück
  onDetected: jest.fn(),
  offDetected: jest.fn(),
}));

describe('quaggaInit', () => {
  let isProcessingBarcode = true;

  beforeEach(() => {
    jest.clearAllMocks(); // Mocks vor jedem Test zurücksetzen
  });

  test('initiiert Quagga korrekt und startet den Scanner', () => {
    Quagga.init.mockImplementation((config, cb) => cb(null)); // Simuliere die erfolgreiche Initialisierung

    quaggaInit(isProcessingBarcode);

    expect(Quagga.init).toHaveBeenCalledWith(
      expect.objectContaining({
        inputStream: expect.objectContaining({
          name: 'Live',
          type: 'LiveStream',
          target: expect.any(Element),
        }),
        decoder: expect.objectContaining({
          readers: ['ean_reader'],
        }),
      }),
      expect.any(Function)
    );
    expect(Quagga.start).toHaveBeenCalled();
    expect(isProcessingBarcode).toBe(false); // Prüfen, ob das Flag korrekt gesetzt wurde
  });

  test('errorhandling bei Quagga Initialisierung', () => {
    Quagga.init.mockImplementation((config, cb) => cb('Error')); // Simuliere Initialisierungsfehler
    console.log = jest.fn();

    quaggaInit(isProcessingBarcode);

    expect(console.log).toHaveBeenCalledWith('Error');
  });
});

describe('detectCode', () => {
  let isProcessingBarcode = false;

  beforeEach(() => {
    jest.clearAllMocks(); // Mocks vor jedem Test zurücksetzen
  });

  test('soll den Barcode erkennen und korrekt zurückgeben', async () => {
    const mockCodeResult = { codeResult: { code: '1234567890123' } };
    Quagga.onDetected.mockImplementation((handler) => handler(mockCodeResult)); // Simuliere Barcode-Erkennung

    const code = await detectCode(isProcessingBarcode);

    expect(Quagga.onDetected).toHaveBeenCalled();
    expect(Quagga.offDetected).toHaveBeenCalledWith(expect.any(Function));
    expect(Quagga.stop).toHaveBeenCalled();
    expect(code).toBe('1234567890123'); // Barcode sollte korrekt erkannt werden
  });

  test('soll Fehler beim Stoppen von Quagga behandeln', async () => {
    const mockCodeResult = { codeResult: { code: '1234567890123' } };
    Quagga.onDetected.mockImplementation((handler) => handler(mockCodeResult)); // Simuliere die Erkennung
    Quagga.stop.mockImplementation(() => Promise.reject('Stop Error')); // Simuliere Fehler beim Stoppen
    console.error = jest.fn();

    await expect(detectCode(isProcessingBarcode)).rejects.toEqual('Stop Error');
    expect(console.error).toHaveBeenCalledWith('Fehler beim Stoppen von Quagga: ', 'Stop Error');
  });

  test('soll barcode Erkennungen ignorieren, wenn isProcessingBarcode = true', async () => {
    isProcessingBarcode = true;
    const mockCodeResult = { codeResult: { code: '1234567890123' } };
    Quagga.onDetected.mockImplementation((handler) => handler(mockCodeResult));

    const code = await detectCode(isProcessingBarcode);

    expect(code).toBeUndefined(); // Erwartet, dass kein Barcode verarbeitet wird
    expect(Quagga.offDetected).not.toHaveBeenCalled(); // Event-Handler sollte nicht entfernt werden
    expect(Quagga.stop).not.toHaveBeenCalled(); // Scanner sollte nicht gestoppt werden
  });

  test('soll nicht verarbeiten, wenn kein Barcode erkannt wird', async () => {
    Quagga.onDetected.mockImplementation((handler) => handler({})); // Simuliere, dass kein Barcode erkannt wird

    const code = await detectCode(isProcessingBarcode);

    expect(code).toBeUndefined();
    expect(Quagga.offDetected).not.toHaveBeenCalled();
    expect(Quagga.stop).not.toHaveBeenCalled();
  });
});
*/