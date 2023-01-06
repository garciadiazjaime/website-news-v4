const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

const documentClient = new AWS.DynamoDB.DocumentClient();

const getPendingNews = async () => {
  const params = {
    ExpressionAttributeValues: {
      ":nstatus": "pending",
    },
    FilterExpression: "contains (nstatus, :nstatus)",
    TableName: "news",
  };

  return documentClient.scan(params).promise();
};

const saveNews = async (news) => {
  if (!Array.isArray(news) || !news.length) {
    return;
  }

  const batch = news.slice(0, 25).map(({ url, created, source, nstatus }) => ({
    PutRequest: {
      Item: {
        url,
        created,
        nstatus,
        source,
      },
    },
  }));

  const params = {
    RequestItems: {
      news: batch,
    },
  };

  await documentClient.batchWrite(params).promise();

  return saveNews(news.slice(25));
};

const saveArticle = async (article) => {
  if (!article) {
    return;
  }

  const params = {
    TableName: "news",
    Key: {
      url: article.url,
      created: article.created,
    },
    UpdateExpression:
      "set description = :description, image = :image, title = :title, nstatus = :nstatus, updated = :updated",
    ExpressionAttributeValues: {
      ":description": article.description,
      ":image": article.image,
      ":title": article.title,
      ":nstatus": article.nstatus,
      ":updated": article.updated,
    },
  };

  return documentClient.update(params).promise();
};

module.exports = {
  saveNews,
  getPendingNews,
  saveArticle,
};
