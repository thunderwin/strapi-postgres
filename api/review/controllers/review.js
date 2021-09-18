"use strict";

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

module.exports = {
  summy: async (ctx) => {
    let sku = ctx.params.sku;
    return strapi
      .query("review")
      .model.query((db) => {
        db.where({
          sku,
        }).sum("score");
      })
      .fetch();
  },
};
