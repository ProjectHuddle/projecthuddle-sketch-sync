import fetchRequest from "./base/request";

export default function(options) {
  return fetchRequest({
    endpoint: "wp-json/projecthuddle/v2/mockup",
    body: options.body || {},
    params: options && options.params
  });
}
