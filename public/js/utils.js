
  export function istGültig(value1, value2) {
    let istUngültig = (value) => value === undefined || value === null || value === '';

    if (istUngültig(value1) || istUngültig(value2)) {
        return false;
    }

    return true;
}

  
  export function vergleicheEigenschaften(item1, item2, value) {
    return item1[value] === item2[value] && istGültig(item1[value], item2[value])
  }
  
  export function vergleicheUnterschiedlicheEigenschaften(item1, item2, value1, value2) {
    console.log(item1[value1])
    console.log(item2[value2])
    return item1[value1] === item2[value2] && istGültig(item1[value1], item2[value2]);
  }


function formatiereErstesWort(string) {
    if (typeof string !== 'string') {
      throw new Error('Eingabe muss ein String sein');
    }
    let worte = string.toLowerCase().split(' ');
    let erstesWort = worte[0].charAt(0).toUpperCase() + worte[0].slice(1);
    worte[0] = erstesWort; 
    return worte.join(' ')
  }
  
  
  
  export function formatiereString(string) {
    const ausnahmen = [
      'der', 'die', 'das', 'ein', 'eine', 'einer', 'eines', 'einem', 'einen', 'dessen', 'deren', 'dem',
      'den', 'auf', 'ab', 'mit', 'in', 'an', 'bei', 'nach', 'von', 'zu', 'über', 'unter', 'vor', 'hinter', 
      'neben', 'zwischen', 'durch', 'gegen', 'ohne', 'um', 'bis', 'entlang', 'und', 'oder', 'aber', 'denn', 
      'sondern', 'doch', 'sowie', 'sowohl', 'als', 'wie', 'entweder', 'noch', 'weder', 'ob', 'weil', 'dass', 
      'wenn', 'falls', 'obwohl', 'während', 'sobald', 'bevor', 'nachdem', 'lecker', 'frisch', 'süss', 'sauer', 
      'salzig', 'bitter', 'würzig', 'pikant', 'knusprig', 'zart', 'rot', 'orange', 'gelb', 'grün', 'blau', 'lila', 
      'rosa', 'braun', 'schwarz', 'weiss', 'saftig', 'trocken', 'reif', 'unreif', 'fettig', 'mager', 'cremig', 
      'hart', 'weich', 'geschmackvoll', 'fade', 'aromatisch', 'schmackhaft', 'mild', 'heiss', 'kalt', 'warm', 
      'gebraten', 'gekocht', 'gegrillt', 'gross', 'klein', 'rote', 'blaue', 'grüne', 'gelbe', 'weisse', 'schwarze', 'dunkle'
    ];
    
    
    let worte = formatiereErstesWort(string).split(' ')
    
     
    return worte.map(wort => {
        if (ausnahmen.includes(wort)) {
          return wort;
        }
        return wort.charAt(0).toUpperCase() + wort.slice(1);
    }).join(' ');
  }


  
export function generiereId() {
    const now = new Date();
    const timestamp = now.valueOf();
    return timestamp.toString();
  }
  


export function quaggaInit(verarbeitetBarcode) {
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('.container') 
    },
    decoder: {
      readers: ["ean_reader"]
    }
  }, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Initialization finished. Ready to start");
    Quagga.start(); // Startet den Scanner
    verarbeitetBarcode = false; 
  });
}

export function detectCode(verarbeitetBarcode) {
  return new Promise((resolve, reject) => {
    const handlerDetectedWrapper = (data) => {
      if (verarbeitetBarcode) {
        // Wenn bereits ein Barcode verarbeitet wird, ignoriere weitere Erkennungen
        return;
      }

      verarbeitetBarcode = true; 
      const code = data.codeResult.code; 
      console.log("Barcode erkannt: ", code);

      // Stoppt die Barcode-Erkennung und den Video-Stream
      Quagga.offDetected(handlerDetectedWrapper); 
      Quagga.stop().then(() => {
        
        console.log("Quagga stopped");

        resolve(code); 
        verarbeitetBarcode = false; 
      }).catch((err) => {
        console.error("Fehler beim Stoppen von Quagga: ", err);
        reject(err); 
      });
    };

    Quagga.onDetected(handlerDetectedWrapper); 
  });
}

