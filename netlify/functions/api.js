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
      const users = [
        { name: "Jane Backend", email: "jane@example.com", company: "DB Layers Inc." },
        { name: "Kai Infra", email: "kai@example.com", company: "SRE Works" },
        { name: "Mika API", email: "mika@example.com", company: "JSON First LLC" },
        { name: "Taku Logs", email: "taku@example.com", company: "Observa Corp" },
        { name: "Rina Cache", email: "rina@example.com", company: "EdgeFast CDN" },
        { name: "Sota Queue", email: "sota@example.com", company: "Async Jobs Ltd." },
        { name: "Aya Metrics", email: "aya@example.com", company: "Telemetry Labs" },
        { name: "Leo Schema", email: "leo@example.com", company: "Migration Works" },
        { name: "Noa Proxy", email: "noa@example.com", company: "Gateway Hub" },
        { name: "Haru Token", email: "haru@example.com", company: "Authly" },
        { name: "Eri Batch", email: "eri@example.com", company: "Nightly Ops" },
        { name: "Yui Cache", email: "yui@example.com", company: "WarmStart Corp" },
        { name: "Saki Edge", email: "saki@example.com", company: "Edge Functions Ltd." },
        { name: "Rio Trace", email: "rio@example.com", company: "Trace Labs" },
        { name: "Minato SLI", email: "minato@example.com", company: "Reliability Co." },
        { name: "Hina Circuit", email: "hina@example.com", company: "EventBus Corp" },
        { name: "Daichi Shard", email: "daichi@example.com", company: "ShardWorks" },
        { name: "Aoi Replay", email: "aoi@example.com", company: "Replay Systems" },
        { name: "Yuto Persist", email: "yuto@example.com", company: "Stateful Inc." },
        { name: "Mio Mirror", email: "mio@example.com", company: "MirrorCache" },
      ];

      const params = event.queryStringParameters || {};
      const perPageRaw = parsePositiveInt(params.per_page) || users.length;
      const pageSize = Math.min(perPageRaw, users.length); // if too large, return all

      if (pageSize === users.length) {
        return { statusCode: 200, body: JSON.stringify(users) };
      }

      const pageRaw = parsePositiveInt(params.page) || 1;
      const maxPage = Math.max(1, Math.ceil(users.length / pageSize));
      const safePage = Math.min(pageRaw, maxPage);
      const start = (safePage - 1) * pageSize;
      const end = start + pageSize;
      const picked = users.slice(start, end);
      return {
        statusCode: 200,
        body: JSON.stringify(picked),
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
