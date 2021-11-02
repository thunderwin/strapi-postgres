"use strict";
const sgMail = require("@sendgrid/mail");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */
function genOrderConfirmEmailHTML(orderObj) {
  let email_title = `Thank you for your purchase!`;

  let items = orderObj.content.items.map((x) => {
    return `<p> ${x.product_title}  X ${x.quantity}</p>
    <div> <img width="100" src="${x.image}" />  </div>
    `;
  });


  let total = orderObj.content.total_price;
  let address = orderObj.address;

  let body = `<h2>ORDER ${orderObj.id}</h2>
<p>Thank you for your purchase!</p>
<p>Hi ${
    address.firstname
  }, we're getting your order ready to be shipped. We will notify you when it has been sent.</p>


<h3>Order summary</h3>
<div>${items}</div>

<p>Total : $ ${total/100}</p>


<h3>Shipping information</h3>
<p> ${address.firstname + " " + address.lastname} </p>
<p> ${address.address1 + " " + address.address2} </p>
<p> ${address.city + " " + address.country} </p>
<p> ${address.zip + " " + address.phone} </p>


<h3>Shipping method</h3>
<p>${orderObj.shipping}</p>

<h3>Payment method</h3>
<p>${orderObj.payment}</p>

`;

  return {
    title: email_title,
    body,
  };
}

module.exports = {
  lifecycles: {
    beforeFindOne(params, data) {

    },
    // Called before an entry is created
    beforeCreate(data) {},
    afterCreate(result, data){
      // data 是前台发送来的
      // result 是后台返回的





    },


    // Called after an entry is created
    afterUpdate(order, params, data) {
      // console.dir("创建新订单结果");
      // console.log(JSON.stringify(order));

      // using Twilio SendGrid's v3 Node.js Library
      // https://github.com/sendgrid/sendgrid-nodejs

      if (order.active === false) {
        let html = genOrderConfirmEmailHTML(order);
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: order.email, // Change to your recipient
          from: "info@wudizu.com", // Change to your verified sender
          subject: html.title,
          html: html.body,
        };
        sgMail
          .send(msg)
          .then(() => {
            console.log("Email sent");
          })
          .catch((err) => {
            console.log(err.response.body);
          });

        return;

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
