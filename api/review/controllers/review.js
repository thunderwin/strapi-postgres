"use strict";

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

module.exports = {
  summy: async (ctx) => {
    let sku = ctx.params.sku;
    let r = await strapi
      .query("review")
      .model.query((db) => {
        db.where({
          'score' :4,
        }).sum("id").sum("score").sum("user_avatar").count()
      })
      .fetch();


    console.dir('r')
    console.log(JSON.stringify(r))

    return r

  },
};
