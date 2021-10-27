"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */
function genOrderConfirmEmailHTML(orderObj) {
  let email_title = `Thank you for your purchase!`;
  let items = orderObj.content.items.map((x) => {
    return `<p> ${x.product_title}  X ${x.quantity}</p>`;
  });
  let total = orderObj.content.total_price;

  let body = `
  <p> ${items}  </p>
  <p> Amount: ${total} </p>
`

  return {
    title: email_title,
    body
  }
}

module.exports = {
  lifecycles: {
    // Called before an entry is created
    beforeCreate(data) {},
    // Called after an entry is created
    afterUpdate(order, params, data) {
      console.dir("创建新订单结果");
      console.log(JSON.stringify(order));

      if (order.active === false) {
        try {
          let html = genOrderConfirmEmailHTML(order);

          console.dir("email");
          console.log(JSON.stringify(html));

          strapi.plugins["email"].services.email.send({
            to: order.email,
            from: "woooms@qq.com",
            subject: html.title,
            html: html.body,
          });
        } catch (error) {
          return "email fault";
        }
      }
    },
  },
};
