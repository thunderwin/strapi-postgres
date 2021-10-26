"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    // Called before an entry is created
    beforeCreate(data) {},
    // Called after an entry is created
    afterUpdate(order, params, data) {
      // console.dir('创建新订单结果')
      // console.log(JSON.stringify(order))

      if (order.active === false) {
        try {
          strapi.plugins["email"].services.email.send({
            to: "nathan@wudizu.com",
            from: "woooms@qq.com",
            subject: "早上好",
            text: `
              你早上吃什么
            `,
          });
        } catch (error) {
          return "email fault";
        }
      }
    },
  },
};
