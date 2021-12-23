'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async send(ctx) {

    let r = await strapi.services['email-template'].sendEmail({orderid,templateId});

    return ctx.send(r);
  }
};
