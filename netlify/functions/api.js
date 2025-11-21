const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.handler = async (event) => {
  const method = event.httpMethod;
  const type = event.queryStringParameters?.type;

  // Slow path simulates specific steps with Server-Timing
  if (method === "GET" && type === "slow") {
    const jitter = (base) => Math.max(20, Math.round(base + (Math.random() * 2 - 1) * base * 0.2)); // ±20%
    const steps = [
      { name: "db", desc: "Database Query", dur: jitter(300) },
      { name: "ext", desc: "External API", dur: jitter(800) },
      { name: "proc", desc: "Processing", dur: jitter(50) },
    ];

    for (const step of steps) {
      await delay(step.dur);
    }

    const serverTiming = steps
      .map((s) => `${s.name};desc="${s.desc}";dur=${s.dur}`)
      .join(", ");

    const total = steps.reduce((sum, s) => sum + s.dur, 0);

    return {
      statusCode: 200,
      headers: {
        "Server-Timing": serverTiming,
      },
      body: JSON.stringify({ message: "Heavy process finished", total_time: `${total}ms (simulated)` }),
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
          { name: "Kai Infra", email: "kai@example.com", company: "SRE Works" },
          { name: "Mika API", email: "mika@example.com", company: "JSON First LLC" },
          { name: "Taku Logs", email: "taku@example.com", company: "Observa Corp" },
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
