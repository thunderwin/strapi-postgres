'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    // Called before an entry is created
    beforeCreate(data) {},
    // Called after an entry is created
    async afterUpdate(order, params, data) {
      // console.dir('创建新订单结果')
      // console.log(JSON.stringify(order))

      if (order.active ===  false){
        await strapi.plugins['email'].services.email.send({
          to: 'woooms@qq.com',
          from: 'nathan@qq.com',
          subject: 'test email',
          text: `
            The comment #${order.id} contain a bad words.
            Comment:
            ${order.content}
          `,
        });
      }

    },
  },
};
