import https from "node:https";
import http from "node:http";

export async function proxyTs(url, headers, req, res) {
  let forceHTTPS = false;

  if (url.startsWith("https://")) {
    forceHTTPS = true;
  }

  const uri = new URL(url);
  const options = {
    hostname: uri.hostname,
    port: uri.port,
    path: uri.pathname + uri.search,
    method: req.method,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
      Referer: "https://megacloud.blog/",
      ...headers,
    },
  };

  console.log("Proxying TS segment:", url);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");

  try {
    if (forceHTTPS) {
      const proxy = https.request(options, (r) => {
        r.headers["content-type"] = "video/mp2t";
        res.writeHead(r.statusCode ?? 200, r.headers);

        r.pipe(res, {
          end: true,
        });
      });

      proxy.on("error", (err) => {
        console.error("HTTPS proxy error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Failed to proxy TS segment",
            details: err.message,
            url: url,
          })
        );
      });

      req.pipe(proxy, {
        end: true,
      });
    } else {
      const proxy = http.request(options, (r) => {
        r.headers["content-type"] = "video/mp2t";
        res.writeHead(r.statusCode ?? 200, r.headers);

        r.pipe(res, {
          end: true,
        });
      });

      proxy.on("error", (err) => {
        console.error("HTTP proxy error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Failed to proxy TS segment",
            details: err.message,
            url: url,
          })
        );
      });

      req.pipe(proxy, {
        end: true,
      });
    }
  } catch (e) {
    console.error("Proxy error:", e);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to proxy TS segment",
        details: e.message,
        url: url,
      })
    );
    return null;
  }
}
