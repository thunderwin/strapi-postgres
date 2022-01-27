module.exports = {
  saveEmail(body) {
    strapi.query("order").update({ id: body.cartId }, { email: body.email });
  },
};
