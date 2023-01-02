const { ListETL } = require("./support");

exports.handler = async function (_event, _context) {
  if (!_event.multiValueQueryStringParameters.type?.includes("list")) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 400,
      body: "EMPTY",
    };
  }

  try {
    const news = await ListETL();

    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 200,
      body: JSON.stringify(news),
    };
  } catch (error) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 400,
      body: JSON.stringify(error),
    };
  }
};
