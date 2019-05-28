import fetchRequest from "./base/request";

export default function(options) {
  // get token
  return fetchRequest({
    endpoint: "/wp-json/projecthuddle/v2/mockup-image",
    body: options.body || {},
    params: options && options.params
  });
}
