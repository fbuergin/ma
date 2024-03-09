import { success } from "../barcode/barcode.js";

let bestand = [{
    name: 'tomate'
  }, {
    name: 'banane'
  }, {
    name: 'apfel'
  }
];


function renderBestand() {
  let bestandHTML = `
    <
  `

  document.querySelector('.bestandliste').innerHTML = bestandHTML;
}