const axios = require('axios');
const cheerio = require('cheerio');

async function fetchStockInfo(artId) {
  const url = `https://www.wildberries.ru/catalog/${artId}/detail.aspx`;
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const stock = {};
    $('.j-avail-block__info .j-avail-table__row').each((_, element) => {
      const size = $(element).find('.j-avail-table__size').text().trim();
      const quantity = parseInt($(element).find('.j-avail-table__value').text().trim());
      stock[size] = quantity;
    });

    return { art: artId, stock };
  } catch (error) {
    console.error('Error fetching stock info for artId:', artId, error);
    return { art: artId, stock: {} };
  }
}

async function fetchMultipleStockInfo(artIds) {
  const results = await Promise.all(artIds.map(artId => fetchStockInfo(artId)));
  return results;
}

async function fetchConnectedArtIds(mainArtId) {
  const url = `https://www.wildberries.ru/catalog/${mainArtId}/detail.aspx`;
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const connectedArtIds = [];
    $('.swiper-wrapper .swiper-slide a').each((_, element) => {
      const href = $(element).attr('href');
      const id = href.match(/\/(\d+)\/detail\.aspx/)[1];
      connectedArtIds.push(parseInt(id));
    });
    return connectedArtIds;
  } catch (error) {
    console.error('Error fetching connected art ids for artId:', mainArtId, error);
    return [];
  }
}

async function fetchStockInfoForConnected(artId) {
  const connectedArtIds = await fetchConnectedArtIds(artId);
  const results = await fetchMultipleStockInfo(connectedArtIds);
  return results;
}

const mainArtId = 146972802;
fetchStockInfoForConnected(mainArtId)
  .then(results => {
    console.log(results);
  })
  .catch(error => {
    console.error('Error:', error);
  });