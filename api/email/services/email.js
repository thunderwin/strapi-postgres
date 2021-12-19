"use strict";

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

<p>Total : $ ${total / 100}</p>


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

function genCartDetail(orderObj) {
  let items = orderObj.content.items.map((x) => {
    return `<div>
    <p> ${x.product_title}  X ${x.quantity}</p>
    <a href="https://${orderObj.domain}/a/checkout"> <img width="200" src="${x.image}" />  </a>
    </div>
    `;
  });

  return `<div>${items}</div>`;
}

function genSignature(orderObj) {
  return `<p>Thanks for shopping!</p>
  <div>${orderObj.domain}</div>`;
}

const emailTemplate = {
  firstEmail(orderObj) {
    let address = orderObj.address;
    let firstname = address ? address.firstname : "";

    return {
      title: `hi ${firstname}, Your shopping cart at ${orderObj.domain} has been reserved!`,

      body: ` <p>hi ${firstname}: </p>

    <p>Your shopping cart at ${
      orderObj.domain
    } has been reserved and is waiting for your return!
    In your cart, you left:</p>

    ${genCartDetail(orderObj)}

    <p>But it's not too late! To complete your purchase, click this link:</p>

    <p>https://${orderObj.domain}/a/checkout</p>


    ${genSignature(orderObj)}
    `,
    };
  },

  secondEmail(orderObj) {
    let address = orderObj.address;
    let firstname = address ? address.firstname : "";

    return {
      title: `hi ${firstname}, Your shopping cart at ${orderObj.domain} has been reserved!`,

      body: ` <p>hi ${firstname}: </p>

    <p>Your shopping cart at ${
      orderObj.domain
    } has been reserved and is waiting for your return!
    In your cart, you left:</p>

    ${genCartDetail(orderObj)}

    <p>But it's not too late! To complete your purchase, click this link:</p>

    <p>https://${orderObj.domain}/a/checkout</p>


    ${genSignature(orderObj)}

    `,
    };
  },

  thirdEmail(orderObj) {
    let address = orderObj.address;
    let firstname = address ? address.firstname : "";

    return {
      title: `hi ${firstname}, Your shopping cart at ${orderObj.domain} has been reserved!`,

      body: ` <p>hi ${firstname}: </p>

    <p>Your shopping cart at ${
      orderObj.domain
    } has been reserved and is waiting for your return!
    In your cart, you left:</p>

    ${genCartDetail(orderObj)}

    <p>But it's not too late! To complete your purchase, click this link:</p>

    <p>https://${orderObj.domain}/a/checkout</p>



    ${genSignature(orderObj)}

    `,
    };
  },

  fourthEmail(orderObj) {
    let address = orderObj.address;
    let firstname = address ? address.firstname : "";

    return {
      title: `hi ${firstname}, Your shopping cart at ${orderObj.domain} has been reserved!`,

      body: ` <p>hi ${firstname}: </p>

    <p>Your shopping cart at ${
      orderObj.domain
    } has been reserved and is waiting for your return!
    In your cart, you left:</p>

    ${genCartDetail(orderObj)}

    <p>But it's not too late! To complete your purchase, click this link:</p>

    <p>https://${orderObj.domain}/a/checkout</p>


    ${genSignature(orderObj)}

    `,
    };
  },
};

function genEmailMessage(orderList) {
  let messages = [];

  messages = orderList.map((x) => {
    let stage = x.abandon[x.abandon.length - 1]; // 取最后一个做为当前发送的模版
    let template = emailTemplate[stage](x);

    return {
      to: x.email, // replace this with your email address
      from: `${x.domain} <${"info@wudizu.com"}>`,
      subject: template.title,
      html: template.body,
    };
  });

  return messages;
}

module.exports = {
  genEmailMessage,
};
