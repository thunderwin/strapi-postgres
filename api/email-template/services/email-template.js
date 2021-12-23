"use strict";
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function genCartDetail(orderObj) {
  let items = orderObj.content.items.map((x) => {
    return `<div>

    <a href="https://${orderObj.domain}/products/${x.handle}"> <img width="50%" src="${x.image}" />  </a>
    <p> ${x.product_title} X ${x.quantity}</p>
    </div>
    `;
  });
  return `<div>${items}</div>`;
}

function genEmailTemplate(template, order) {
  function replaceStr(str) {
    return str
      .replace(/{{firstname}}/g, emailVars["firstname"])
      .replace(/{{lastname}}/g, emailVars["lastname"])
      .replace(/{{domain}}/g, emailVars["domain"])
      .replace(/{{brand}}/g, emailVars["brand"])
      .replace(/{{checkoutLink}}/g, emailVars["checkoutLink"])
      .replace(/{{cartItems}}/g, emailVars["cartItems"]);
  }

  let emailVars = {
    firstname: "",
    lastname: "",
    domain: "",
    cartItems: "",
    checkoutLink: "",
    brand: "",
  };

  if (order.address) {
    emailVars.firstname = order.address.firstname || "";
    emailVars.lastname = order.address.lastname || "";
  }
  emailVars.domain = order.domain;
  emailVars.brand = order.domain.split(".")[1] || order.domain;

  emailVars.cartItems = genCartDetail(order);
  emailVars.checkoutLink = `https://${emailVars.domain}/a/checkout`;

  let body = replaceStr(template.template);
  let title = replaceStr(template.title);

  return {
    title,
    body,
  };
}


module.exports = {
  async sendEmail({ orderId, templateId }) {


    let r = await Promise.all([
      strapi.query("order").findOne({ id: orderId }),
      strapi.query("email-template").findOne({ id: templateId }),
    ]);



    let order = r[0];
    let template = r[1];

    let { title, body } = genEmailTemplate(template, order);

    const msg = {
      to: order.email, // Change to your recipient
      from: "info@wudizu.com", // Change to your verified sender
      replyTo: order.serviceEmail || "info@wudizu.com",
      subject: title,
      html: body,
    };




    try {
     let r = await sgMail.send(msg);


      return r;
    } catch (e){

      console.dir('error')
      console.log(JSON.stringify(e))

    }
  },
};
