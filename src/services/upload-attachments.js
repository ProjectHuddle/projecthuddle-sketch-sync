import fetchRequest from "./base/request";

export default function(attachment, options) {
  // set filename
  let filename = "sketch-attachment";
  if (options && options.filename) {
    filename = options.filename;
  }

  // get token
  return fetchRequest(
    {
      method: "POST",
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename=${filename}.png`
      },
      endpoint: "/wp-json/projecthuddle/v2/media",
      body: { api_key: api_key, api_secret: api_secret },
      params: options && options.params
    },
    30000 // 30 second timeout
  );
}
