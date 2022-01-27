function UrlToHandleDomain(url) {
  let u = url.split("//")[1].split("/");

  if (u[1] !== "products") return Promise.reject(new Error("Invalid URL"));

  let handle = u[2];

  if (handle.indexOf("?") > -1) {
    handle = handle.split("?")[0];
  }

  let domain = u[0];

  return {
    handle,
    domain,
  };
}

function isArray(object) {
  return object && typeof object === "object" && Array == object.constructor;
}

module.exports = {
  async saveClick(body) {
    let url = body.url;
    if (isArray(body.url)) {
      url = body.url[0];
    }

    let { handle, domain } = UrlToHandleDomain(url);

    let isIn = await strapi.query("product-view").findOne({ uuid: body.uuid , handle, domain});
    if (isIn) {

    } else {
      return strapi.query("product-view").create({
        handle,
        domain,
        uuid: body.uuid,
      });
    }
  },
  async saveAddCart (body) {
    let { handle, domain } = UrlToHandleDomain(body.url);
    body.handle = handle;
    body.domain = domain;

    let isIn = await strapi.query("cart").findOne({ uuid: body.uuid, handle ,domain});
    if (isIn) {

    } else {
      return strapi.query("cart").create({
        handle,
        domain,
        uuid: body.uuid,
      });
    }
  },
};
