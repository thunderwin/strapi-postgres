"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async afterCreate(result, data) {
      console.dir("after view");
      console.log(JSON.stringify());

      let isIn = await strapi.query("product").findOne({ handle: result.handle });

      if (!isIn) {
        await strapi.query("product").create({
          handle: result.handle,
        })
      }

      strapi
        .query("product")
        .model.query((q) => {
          q.where("handle", result.handle);
          q.increment("view", 1);
        })
        .fetch();
      // data 是前台发送来的
      // result 是后台返回的
    },
  },
};
