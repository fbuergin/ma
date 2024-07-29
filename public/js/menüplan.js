// menus-Array für Montag bis Sonntag
let menus = [{
  id: 1,
  tag: 'Montag',
  name: 'Pasta',
  zutaten: {
    produktName: '',
    menge: 0,
  }
}, {
  id: 2,
  tag: 'Dienstag',
  name: '',
  zutaten: {
    produktName: '',
    menge: 0,
  }
}, {
  id: 3,
  tag: 'Mittwoch',
  name: 'Pizza',
  zutaten: {
    produktName: '',
    menge: 0,
  }
}, {
  id: 4,
  tag: 'Donnerstag',
  name: '',
  zutaten: {
    produktName: '',
    menge: 0,
  }
}, {
  id: 5,
  tag: 'Freitag',
  name: '',
  zutaten: {
    produktName: '',
    menge: 0,
  }
}, {
  id: 6,
  tag: 'Samstag',
  name: '',
  zutaten: {
    produktName: '',
    menge: 0,
  }
}, {
  id: 7,
  tag: 'Sonntag',
  name: '',
  zutaten: {
    produktName: '',
    menge: 0,
  }
}];

// Funktion zum Speichern des Menü-Arrays im Local Storage
function saveToLocalStorage() {
  localStorage.setItem('menus', JSON.stringify(menus));
}

// Funktion zum Laden des Menü-Arrays aus dem Local Storage
function getFromLocalStorage() {
  const savedMenus = localStorage.getItem('menus');
  if (savedMenus) {
    menus = JSON.parse(savedMenus);
  }
}

// Füge diese Funktionen überall dort hinzu, wo der Menü-Array geändert oder initialisiert wird

window.onload = function() {
  getFromLocalStorage(); // Lade Menüs aus dem Local Storage
  renderMenusFromStock();
};


function addMenuToMenus(event) {
  if (event.keyCode === 13) {
    let menuName = event.target.value;
    let menuNameId = event.target.dataset.menunameid;


    event.target.style.display = 'none';

    document.querySelectorAll('.menuName-reihe').forEach((reihe) => {
      if(reihe.dataset.reiheid === menuNameId) {
        reihe.innerHTML = menuName;
      }
    })

    
    let index = menus.findIndex(menu => menu.id === Number(menuNameId));
    console.log(index)
    menus[index].name = menuName;
    console.log(menus)
    
    saveToLocalStorage();
  }
}


function addZutatenToMenus(event) {
  if (event.keyCode === 13) {
    let zutatName = event.target.value;
    let zutatNameId = event.target.dataset.zutatenid;

    event.target.style.display = 'none';

    document.querySelectorAll('.zutaten-reihe').forEach((reihe) => {
      if(reihe.dataset.reiheid === zutatNameId) {
        reihe.innerHTML = zutatName;
      }
    })

    
    let index = menus.findIndex(menu => menu.id === Number(zutatNameId));
    menus[index].zutaten.produktName = zutatName;
    
    saveToLocalStorage();
  }
}





document.addEventListener('DOMContentLoaded', function() {
  const menuInputs = document.querySelectorAll('.menuName-input');
  const zutatenInputs = document.querySelectorAll('.zutaten-input');

  menuInputs.forEach(input => {
    input.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        addMenuToMenus(event);
      }
    });
  });

  zutatenInputs.forEach(input => {
    input.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        addZutatenToMenus(event);
      }
    });
  });
});


function renderMenusFromStock() {
  menus.forEach(menu => {
    const menuReihe = document.querySelector(`.menuName-reihe[data-reiheId="${menu.id}"]`);
    const menuInput = menuReihe.querySelector('.menuName-input');

    
    const zutatenReihe = document.querySelector(`.zutaten-reihe[data-reiheId="${menu.id}"]`);
    const zutatenInput= zutatenReihe.querySelector('.zutaten-input');
    
    console.log(zutatenReihe)
    if (menu.name) {
      menuInput.style.display = 'none';
      menuReihe.innerHTML = menu.name;
    } else {
      menuInput.style.display = 'block';
    }

    
    if (menu.zutaten.produktName) {
      zutatenInput.style.display = 'none';
      zutatenReihe.innerHTML = menu.zutaten.produktName;
    } else {
      zutatenInput.style.display = 'block';
    }
    
  });

}













document.querySelector('.test-btn').addEventListener('click', () => {
  console.log(menus)
})

