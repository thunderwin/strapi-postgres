"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    console.dir("111");
    console.log(JSON.stringify(ctx.query));

    // 1 先找到对应的产品
    let list = await strapi.services.product.find(ctx.query);

    let onlyTimeSlot = {
      _where: {
        created_at_gte: ctx.query._where.created_at_gte,
        created_at_lte: ctx.query._where.created_at_lte,
      },
    };

    // 2 分别找到对应的 浏览 加车 支付
    let views = strapi.services["product-view"].find(onlyTimeSlot);
    let pays = strapi.services["product-pay"].find(onlyTimeSlot);
    let carts = strapi.services["cart"].find(onlyTimeSlot);

    let result = await Promise.all([views, pays, carts]);

    return list.map((x) => {
      x.views = result[0].filter((y) => y.handle === x.handle).length;
      x.pays = result[1].filter((y) => y.handle === x.handle).length;
      x.carts = result[2].filter((y) => y.handle === x.handle).length;

      return x;
    });
  },
};
