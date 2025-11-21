exports.handler = async (event) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const randomDelay = 500 + Math.floor(Math.random() * 501); // 500-1000ms

  await delay(randomDelay);

  if (event.httpMethod === "GET") {
    const type = event.queryStringParameters?.type;
    if (type === "users") {
      return {
        statusCode: 200,
        body: JSON.stringify([
          { name: "Jane Backend", email: "jane@example.com", company: "DB Layers Inc." },
          { name: "Kai Infra", email: "kai@ops.dev", company: "SRE Works" },
          { name: "Mika API", email: "mika@api.run", company: "JSON First LLC" },
          { name: "Taku Logs", email: "taku@logs.dev", company: "Observa Corp" },
        ]),
      };
    }

    if (type === "error") {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Critical DB Failure",
          message: "Connection refused",
        }),
      };
    }
  }

  if (event.httpMethod === "POST") {
    const body = event.body ? JSON.parse(event.body) : {};
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Created successfully",
        receivedData: body,
      }),
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: "Not Found" }),
  };
};
