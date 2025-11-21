const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.handler = async (event) => {
  const method = event.httpMethod;
  const type = event.queryStringParameters?.type;

  // Slow path simulates specific steps with Server-Timing
  if (method === "GET" && type === "slow") {
    const steps = [
      { name: "db", desc: "Database Query", dur: 300 },
      { name: "ext", desc: "External API", dur: 800 },
      { name: "proc", desc: "Processing", dur: 50 },
    ];

    for (const step of steps) {
      await delay(step.dur);
    }

    const serverTiming = steps
      .map((s) => `${s.name};desc="${s.desc}";dur=${s.dur}`)
      .join(", ");

    return {
      statusCode: 200,
      headers: {
        "Server-Timing": serverTiming,
      },
      body: JSON.stringify({ message: "Heavy process finished", total_time: "approx 1150ms" }),
    };
  }

  // Common artificial latency for other endpoints (500-1000ms)
  const randomDelay = 500 + Math.floor(Math.random() * 501);
  await delay(randomDelay);

  if (method === "GET") {
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

  if (method === "POST") {
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
