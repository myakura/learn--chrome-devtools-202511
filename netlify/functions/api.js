const USERS = require("./users.json");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.handler = async (event) => {
  const method = event.httpMethod;
  const type = event.queryStringParameters?.type;
  const parsePositiveInt = (val) => {
    const num = parseInt(val, 10);
    return Number.isInteger(num) && num > 0 ? num : null;
  };

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
      const params = event.queryStringParameters || {};
      const perPageRaw = parsePositiveInt(params.per_page) || 5;
      const pageSize = Math.min(perPageRaw, USERS.length); // if too large, return all

      if (pageSize === USERS.length) {
        return { statusCode: 200, body: JSON.stringify(USERS) };
      }

      const pageRaw = parsePositiveInt(params.page) || 1;
      const maxPage = Math.max(1, Math.ceil(USERS.length / pageSize));
      const safePage = Math.min(pageRaw, maxPage);
      const start = (safePage - 1) * pageSize;
      const end = start + pageSize;
      const picked = USERS.slice(start, end);
      return {
        statusCode: 200,
        body: JSON.stringify(picked),
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
