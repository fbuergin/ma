const puppeteer = require('puppeteer');

test('should click the scan button and detect a barcode', async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false, 
    slowMo: 80,   // Verlangsamt Aktionen für besseres visuelles Debugging
    args: [`--window-size=1920,1080`]  // Größeres Fenster für realistischeres Testen
  });
  
  const page = await browser.newPage();
  
  // Öffne die Seite `Bestand.html`
  await page.goto('http://127.0.0.1:5502/public/Bestand.html');
  
  // Füge das Quagga-Skript hinzu, falls es noch nicht auf der Seite geladen wurde
  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/@ericblade/quagga2/dist/quagga.js' });
  
  // Klicke auf den "Scan" Button
  await page.click('.scanning-btn');
  
  // Simuliere die Barcode-Erkennung (du kannst dies innerhalb des `evaluate`-Kontexts tun)
  const detectedCode = await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      // Barcode-Simulation nach 2 Sekunden
      setTimeout(() => {
        Quagga.onDetected({ codeResult: { code: '123456789012' } });  // Simulierter Barcode
      }, 2000);

      // Warte auf Barcode-Erkennung
      Quagga.onDetected((data) => {
        const code = data.codeResult.code;  // Extrahiere den Barcode
        resolve(code);  // Gebe den Barcode zurück
        Quagga.stop();  // Stoppe den Scanner
      });
    });
  });

  // Überprüfe, ob der Barcode korrekt erkannt wurde
  expect(detectedCode).toBe('123456789012');

  // Schließe den Browser
  await browser.close();
}, 20000);  // Timeout von 20 Sekunden