

export async function fetchSynonyms(suchbegriff) {
  try {
    const response = await fetch('/synonyms.json');
    const data = await response.text();
    const synonyms = JSON.parse(data);
    const gefundeneSynonyme = synonyms[suchbegriff.toLowerCase()];
    console.log(synonyms[suchbegriff])

    if (gefundeneSynonyme) {
      return gefundeneSynonyme;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Fehler beim Abrufen von Synonymen:', error);
    return [];
  }
}




