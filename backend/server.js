import http from "node:http";
import { initDb, getAllWards, getWardById, updateCivicMetrics } from "./db.js";
import { fetchLiveWeatherForWard, prefetchWeatherForAllWards } from "./weatherService.js";

// Ensure DB tables exist on start
initDb();

const PORT = process.env.PORT || 3001;

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error("Request payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  // Handle pre-flight CORS
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  try {
    // GET /api/health
    if (req.method === "GET" && pathname === "/api/health") {
      return sendJson(res, 200, {
        status: "ok",
        service: "PMC Outbreak Risk API",
        time: new Date().toISOString(),
      });
    }

    // GET /api/wards
    if (req.method === "GET" && pathname === "/api/wards") {
      const wards = getAllWards();
      return sendJson(res, 200, {
        count: wards.length,
        wards,
      });
    }

    // Match /api/wards/{id}/weather
    const weatherMatch = pathname.match(/^\/api\/wards\/([a-zA-Z0-9_-]+)\/weather$/);
    if (req.method === "GET" && weatherMatch) {
      const wardId = weatherMatch[1];
      const weatherData = await fetchLiveWeatherForWard(wardId);
      if (!weatherData) {
        return sendJson(res, 404, { error: `Ward '${wardId}' not found` });
      }
      return sendJson(res, 200, weatherData);
    }

    // Match /api/wards/{id}/metrics
    const metricsMatch = pathname.match(/^\/api\/wards\/([a-zA-Z0-9_-]+)\/metrics$/);
    if (req.method === "POST" && metricsMatch) {
      const wardId = metricsMatch[1];
      const body = await parseBody(req);
      const updatedWard = updateCivicMetrics(wardId, body);
      if (!updatedWard) {
        return sendJson(res, 404, { error: `Ward '${wardId}' not found` });
      }
      return sendJson(res, 200, {
        message: "Metrics successfully updated and risk recalculated",
        ward: updatedWard,
      });
    }

    // Match /api/wards/{id}
    const wardMatch = pathname.match(/^\/api\/wards\/([a-zA-Z0-9_-]+)$/);
    if (req.method === "GET" && wardMatch) {
      const wardId = wardMatch[1];
      const ward = getWardById(wardId);
      if (!ward) {
        return sendJson(res, 404, { error: `Ward '${wardId}' not found` });
      }
      return sendJson(res, 200, ward);
    }

    // 404 Not Found
    return sendJson(res, 404, { error: "Endpoint not found" });
  } catch (err) {
    console.error(`[Server Error] ${req.method} ${pathname}:`, err);
    return sendJson(res, 500, {
      error: "Internal server error",
      message: err.message,
    });
  }
});

server.listen(PORT, () => {
  console.log(`[PMC API Server] Running on http://localhost:${PORT}`);
  console.log(`Endpoints available:`);
  console.log(`  - GET  http://localhost:${PORT}/api/wards`);
  console.log(`  - GET  http://localhost:${PORT}/api/wards/:id`);
  console.log(`  - GET  http://localhost:${PORT}/api/wards/:id/weather`);
  console.log(`  - POST http://localhost:${PORT}/api/wards/:id/metrics`);
  console.log(`  - GET  http://localhost:${PORT}/api/health`);

  // Pre-fetch live weather in background for all wards
  prefetchWeatherForAllWards().catch((err) =>
    console.warn("[WeatherService] Background pre-fetch encountered error:", err.message),
  );
});
