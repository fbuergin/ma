//const  fetchProductData  = require('../public/js/databaseConnection');
import { fetchProductData } from "../api/fetchProductData.js";


global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

test('fetchProductData returned Daten wenn fetch erfolgreich ist', async () => {
  const mockData = {
    success: true,
    title: 'Test Product',
    description: 'Test Description'
  };

  fetch.mockResolvedValueOnce({
    ok: true,
    text: async () => JSON.stringify(mockData)
  });

  const data = await fetchProductData('123456');
  expect(data.title).toBe('test product');
  expect(data.description).toBe('test description');
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith('http://localhost:3000/product/123456');
});



test('fetchProductData wirft fehler wenn fetch failes', async () => {
    fetch.mockResolvedValueOnce({
      ok: false
    });
  
    await expect(fetchProductData('123456')).rejects.toThrow('Fehler beim Abrufen der Daten');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/product/123456');
});
  
