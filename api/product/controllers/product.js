"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const dayjs = require("dayjs");

module.exports = {
  async find(ctx) {
    console.dir("111");
    console.log(JSON.stringify(ctx.query));


    // 1 先找到对应的产品
    let list = await strapi.services.product.find(ctx.query);

    let onlyTimeSlot
    if (ctx.query._where && ctx.query._where.created_at_gte && ctx.query._where.created_at_lte ){


     onlyTimeSlot = {
      _where: {
        created_at_gte: ctx.query._where.created_at_gte || defaultTimeSlot.created_at_gte,
        created_at_lte: ctx.query._where.created_at_lte || defaultTimeSlot.created_at_lte,
      },
    };
  }else{
    onlyTimeSlot =  {
      created_at_gte:  dayjs().subtract(7, "day").format("YYYY-MM-DD"),
      created_at_lte: dayjs().add(1,'day').format("YYYY-MM-DD")
    }
  }

    console.dir('onlyTimeSlot')
    console.log(JSON.stringify(onlyTimeSlot))


    // 2 分别找到对应的 浏览 加车 支付
    let views = strapi.services["product-view"].find(onlyTimeSlot);
    let pays = strapi.services["product-pay"].find(onlyTimeSlot);
    let carts = strapi.services["cart"].find(onlyTimeSlot);

    let result = await Promise.all([views, pays, carts]);

    console.dir('result')
    console.log(result)


    return list.map((x) => {
      x.views = result[0].filter((y) => y.handle === x.handle).length;
      x.pays = result[1].filter((y) => y.handle === x.handle).length;
      x.carts = result[2].filter((y) => y.handle === x.handle).length;

      return x;
    });
  },
};
