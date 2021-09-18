"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    // Called before an entry is created
    beforeCreate(data) {
      // console.dir("创建之前");
      // console.log(JSON.stringify(data));
    },
    // Called after an entry is created
    afterCreate(result) {},
  },
};
