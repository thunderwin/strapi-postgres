


module.exports = {
  async syncCustomer(order) {

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

}
