import { fetchSynonyms } from "./databaseConnection4.js";


const synonyme = await fetchSynonyms('apfelfrucht');

console.log(synonyme)

const test = 'Kristallzucker';

console.log(test.includes('zucker'))
console.log('test')