const https = require("https");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const dynamoService = require("../../../support/dynamo-service");
const cert = "";

const extract = async (url) => {
  const options = {
    cert,
    key: cert,
  };
  const sslConfiguredAgent = new https.Agent(options);

  const headers = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    headers,
    agent: sslConfiguredAgent,
    method: "get",
  });

  return response.text();
};

function transform(html, domain) {
  const $ = cheerio.load(html);
  const response = [];
  const urlsMap = {};
  const created = new Date().toJSON().split("T")[0];

  $('#home a[itemprop="url"]')
    .toArray()
    .forEach((item) => {
      const url = $(item).attr("href");

      if (!urlsMap[url]) {
        urlsMap[url] = true;

        response.push({
          created,
          status: "pending",
          url: `${domain}${url}`,
        });
      }
    });

  return response;
}

const load = (news) => {
  return dynamoService.saveNews(news);
};

const ListETL = async () => {
  const url = "https://aristeguinoticias.com";

  const html = await extract(url);

  const news = transform(html, url);

  await load(news);

  return news
};

module.exports = {
  ListETL,
};
