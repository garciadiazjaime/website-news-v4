const https = require("https");
const fetch = require("node-fetch");
const cheerio = require('cheerio');

const dynamoService = require("../../../support/dynamo-service");

const cert = ""

function transform(html, domain, source) {
  const $ = cheerio.load(html);
  const response = [];
  const urlsMap = {};
  const created = new Date().toJSON().split('T')[0]

  $('#home a[itemprop="url"]').toArray().forEach((item) => {
    const url = $(item).attr('href');

    if (!urlsMap[url]) {
      urlsMap[url] = true;

      response.push({
        source,
        created,
        status: "pending",
        url: `${domain}${url}`,
      });
    }
  });

  return response;
}

exports.handler = async function (_event, _context) {
  const options = {
    cert,
    key: cert,
  };

  const sslConfiguredAgent = new https.Agent(options);

  const headers = {
    "Content-Type": "application/json",
  };
  const source = 'aristeguinoticias';
  const endpointURL =
      "https://aristeguinoticias.com";
  try {
    const response = await fetch(endpointURL, {
      headers,
      agent: sslConfiguredAgent,
      method: "get",
    });

    const html = await response.text();

    const news = transform(html, endpointURL, source);

    await dynamoService.saveNews(news);

    return {
      headers: {
        'Content-Type': 'application/json',
      },
      statusCode: 200,
      body: JSON.stringify(news),
    };
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};
