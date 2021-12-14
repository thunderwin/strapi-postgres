"use strict";
const sgMail = require("@sendgrid/mail");
const { getCode } = require("country-list");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */


async function syncCustomer(order) {
  let newCustomer = {
    email: order.email,
    firstname: order.address ? order.address.firstname : null,
    lastname: order.address ? order.address.lastname : null,
    domain: order.domain,
    phone: order.address ? order.address.phone : null,
    address: order.address,
  };
  let isIn = await strapi.query("customer").findOne({ email: order.email });
  if (isIn) {
    // update newest custom info, cause customer may change checkout info
    strapi.query("customer").update({ id: isIn.id }, newCustomer);
  } else {
    strapi.query("customer").create(newCustomer);
  }
}

async function recodeCustomerSpent(order) {
  let customer = await strapi.query("customer").findOne({ email: order.email });

  // console.dir("customer");
  // console.log(JSON.stringify(customer));

  // console.dir("order");
  // console.log(JSON.stringify(order));

  strapi
    .query("customer")
    .model.query((q) => {
      q.where("id", customer.id);
      q.increment("shopcount", 1);
      q.update(
        "spent",
        order.totalPaidPrice + customer.spent // add spent
      );
    })
    .fetch();
}

function recodeProduct(order) {
  async function initProduct(obj) {
    console.dir('obj')
    console.log(JSON.stringify(obj))

    let isIn = await strapi.query("product").findOne({ handle: obj.handle });
    if (isIn) {
      strapi
        .query("product")
        .model.query((q) => {
          q.where("id", isIn.id);
          q.increment("sales", obj.quantity);
        })
        .fetch();
    } else {
      strapi.query("product").create({
        handle: obj.handle,
        title: obj.title,
        price: obj.line_price,
        image: obj.featured_image.url,
        domain: order.domain,
      });
    }
  }

  return Promise.all(order.content.items.map((obj) => initProduct(obj)));
}



module.exports = {
  lifecycles: {
    beforeFindOne(params, data) {},
    beforeFind(params, populate) {},

    beforeCreate(data) {},
    afterCreate(result, data) {
      // data 是前台发送来的
      // result 是后台返回的
    },

    afterUpdate(order, params, data) {
      // console.dir("创建新订单结果");
      // console.log(JSON.stringify(order));



      if (order.active === false) {
        // 结账成功



        // 记录下销售额
        recodeProduct(order);
        // 记录下用户消费
        recodeCustomerSpent(order);

        return;

        // 未知原因，plugin not working
        try {
          let html = genOrderConfirmEmailHTML(order);

          console.dir("email");
          console.log(JSON.stringify(html));

          strapi.plugins["email"].services.email.send({
            to: order.email,
            from: "info@wudizu.com",
            subject: html.title,
            html: html.body,
          });
        } catch (error) {
          return "email fault";
        }
      } else {
        // 单纯的更新，同步下用户信息
        syncCustomer(order);
      }
    },
  },
};
