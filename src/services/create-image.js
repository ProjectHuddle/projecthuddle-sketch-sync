import fetchRequest from "./base/request";

export default function(options) {
  // create image
  return fetchRequest({
    endpoint: "/wp-json/projecthuddle/v2/mockup-image",
    method: "POST",
    body: options.body || {},
    params: options && options.params
  });
}
