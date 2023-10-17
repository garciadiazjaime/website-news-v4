const { getNews } = require("../../../support/dynamo-service");

exports.handler = async function (_event, _context) {
  let response, error;
  try {
    response = await getNews();
  } catch (e) {
    error = e;
  }

  if (response) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 200,
      body: JSON.stringify(response),
    };
  }

  return {
    headers: {
      "Content-Type": "application/json",
    },
    statusCode: 400,
    body: JSON.stringify(error),
  };
};
