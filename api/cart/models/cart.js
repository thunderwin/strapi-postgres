"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    afterCreate(result, data) {
      strapi
        .query("product")
        .model.query((q) => {
          q.where("handle", result.handle);
          q.increment("addCart", 1);
        })
        .fetch();
      // data 是前台发送来的
      // result 是后台返回的
    },
  },
};
