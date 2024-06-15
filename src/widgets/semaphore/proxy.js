import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const logger = createLogger("semaphoreProxyHandler");

async function fetchSemaphoreCookie(widget, loginURL) {
  const url = new URL(formatApiCall(loginURL, widget));
  const [status, , , responseHeaders] = await httpProxy(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      auth: widget.username,
      password: widget.password,
    }),
  });

  if (!(status === 204) || !("set-cookie" in responseHeaders)) {
    logger.error("Failed to fetch semaphore cookie, status: %d", status);
    return null;
  }
  return responseHeaders["set-cookie"];
}

export default async function semaphoreProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (!group || !service) {
    logger.error("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service);
  if (!widget || !widgets[widget.type].api) {
    logger.error("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid widget configuration" });
  }

  if (widget.password) {
    const semaphoreCookie = await fetchSemaphoreCookie(widget, widgets[widget.type].loginURL);

    if (!semaphoreCookie) {
      return res.status(500).json({ error: "Failed to authenticate with semaphore" });
    }
    // Add the cookie to the widget for use in subsequent requests
    widget.headers = {
      "Content-Type": "application/json",
      accept: "application/json",
    };
    widget.headers = { ...widget.headers, Cookie: semaphoreCookie };
  }

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

  try {
    const [status, , data, ,] = await httpProxy(url, {
      method: "GET",
      headers: widget.headers,
    });

    if (status !== 200) {
      logger.info("Error calling semaphore API: %d. Data: %s", status, data);
      return res.status(status).json({ error: "Failed to call semaphore API", data });
    }

    const parsedData = {};
    parsedData.taskRunning = JSON.parse(data).filter((d) => d.status === "running").length;
    parsedData.taskFailed = JSON.parse(data).filter((d) => d.status === "error").length;
    parsedData.taskSucceeded = JSON.parse(data).filter((d) => d.status === "success").length;

    return res.status(status).send(parsedData);
  } catch (error) {
    logger.error("Exception calling semaphore API: %s", error.message);
    return res.status(500).json({ error: "Server error", message: error.message });
  }
}
