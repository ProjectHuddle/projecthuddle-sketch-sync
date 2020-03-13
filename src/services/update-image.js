import fetchRequest from "./base/request";

export default function(id = 0, options) {
  return fetchRequest({
    method: "PATCH",
    endpoint: "wp-json/projecthuddle/v2/mockup-image/" + id,
    body: options.body || {},
    params: options && options.params
  });
}
