const sgMail = require("@sendgrid/mail");
  // using Twilio SendGrid's v3 Node.js Library
      // https://github.com/sendgrid/sendgrid-nodejs
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

module.exports = {
  sendOrderConfirmEmail(config, order) {

    let emailAddress = config.adminEmail

    let html = genOrderConfirmEmailHTML(order);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);



    const msg = {
      to: order.email, // Change to your recipient
      from: "info@wudizu.com", // Change to your verified sender
      replyTo: emailAddress,
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
  },
};
