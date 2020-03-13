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
      endpoint: "wp-json/projecthuddle/v2/media",
      body: attachment,
      params: options && options.params
    },
    120000 // 120 second timeout
  );
}
