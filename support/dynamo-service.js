const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

const documentClient = new AWS.DynamoDB.DocumentClient();

const saveNews = async (news) => {
  if (!Array.isArray(news) || !news.length) {
    return
  }

  const batch = news.slice(0, 25).map(({ url, created, source, status }) => ({
    PutRequest: {
      Item: {
        url,
        created,
        status,
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

  return saveNews(news.slice(25))
};

module.exports.saveNews = saveNews
