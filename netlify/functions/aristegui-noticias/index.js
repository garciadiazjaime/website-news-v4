const { ListETL, ArticleETL } = require("./support");

exports.handler = async function (_event, _context) {
  let response, error

  if (_event.multiValueQueryStringParameters.type?.includes("list")) {
    try {
      response = await ListETL();
    } catch (e) {
      error = e
    }
  }

  if (_event.multiValueQueryStringParameters.type?.includes("article")) {
    try {
      response = await ArticleETL();
    } catch (e) {
      error = e
    }
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

  if (error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 400,
      body: JSON.stringify(error),
    };
  }

  return {
    headers: {
      "Content-Type": "application/json",
    },
    statusCode: 400,
    body: "EMPTY",
  };
};
