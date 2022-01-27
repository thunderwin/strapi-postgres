"use strict";
const sgMail = require("@sendgrid/mail");
const { getCode } = require("country-list");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

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
    console.dir("obj");
    console.log(JSON.stringify(obj));

    let isIn = await strapi.query("product").findOne({ handle: obj.handle });
    if (isIn) {

      // 如果没带属性就更新下
      if (!isIn.price || !isIn.image){
         strapi.query("product").update({id: isIn.id},{
          handle: obj.handle,
          title: obj.title,
          price: obj.line_price,
          image: obj.featured_image.url,
          domain: order.domain,
          sales: obj.quantity
        });
      }else{
        strapi
        .query("product")
        .model.query((q) => {
          q.where("id", isIn.id);
          q.increment("sales", obj.quantity);
        })
        .fetch();
      }


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

    // 创建订单后，根据配置文件创建邮件发送任务
    async afterCreate(result, data) {
      const { id: orderId, domain } = result;
      let templates = await strapi.query("email-template").find({ domain });

      if (templates.length === 0) {
         templates = await strapi.query("email-template").find({ domain: "default" });
      }

      templates.forEach(({ id: templateId, relativeTime }) => {
        strapi.services["redis-schedule"]({
          orderId,
          templateId,
          relativeTime,
        }).then(() => console.log(`Schedule Job ${orderId} : ${templateId} Ok`)).catch(err => {
          console.log(`Schedule Job ${orderId} : ${templateId} ERROR`);
          console.log(error);
        })
      });
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
      }
    },
  },
};
