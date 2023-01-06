const https = require("https");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const {
  saveNews,
  getPendingNews,
  saveArticle,
} = require("../../../support/dynamo-service");
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
          nstatus: "pending",
          url: `${domain}${url}`,
        });
      }
    });

  return response;
}

const load = (news) => {
  return saveNews(news);
};

const ListETL = async () => {
  const url = "https://aristeguinoticias.com";

  const html = await extract(url);

  const news = transform(html, url);

  await load(news);

  return news;
};

function transformArticle(html, domain, url, created) {
  const $ = cheerio.load(html);
  const updated = new Date().toJSON().split("T")[0];

  const title = $(".titulo-principal").text();
  const description = $("#section-main article p")
    .toArray()
    .map((desc) => $(desc).text().replace("\n", "").trim())
    .filter(
      (desc) =>
        desc.length &&
        !desc.includes("Te puede interesar") &&
        !desc.includes("Te podría interesar") &&
        !desc.includes("Con información de") &&
        !desc.includes("Your browser doesn")
    );
  const image = $("#section-main figure img.full").attr("src");

  const article = {
    url,
    description,
    image: `${domain}${image}`,
    title,
    nstatus: "processed",
    created,
    updated,
  };

  return article;
}

const loadArticle = (article) => {
  return saveArticle(article);
};

const ArticleETL = async () => {
  const domain = "https://aristeguinoticias.com";

  const pendingNews = await getPendingNews();

  if (!Array.isArray(pendingNews.Items) || !pendingNews.Items.length) {
    return false;
  }

  const { url, created } = pendingNews.Items[0];

  const html = await extract(url);

  const article = transformArticle(html, domain, url, created);

  await loadArticle(article);

  return article;
};

module.exports = {
  ListETL,
  ArticleETL,
};
