module.exports = {
  saveEmail(body) {
    console.dir('body')
    console.log(JSON.stringify(body))

    strapi.query("order").update({ id: body.cartId }, { email: body.email });
  },
};
