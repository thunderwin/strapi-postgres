'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async getTokenAndShopList(ctx) {
    let token = process.env.MY_FACEBOOK_APP_TOKEN;

    let shops = await strapi.services.myads.allShopWithAdAccount()
    return ctx.send({
      token,
      shops
    });
  },
  myads: async (ctx) => {
    let r = await strapi.services.myads.allMyAds(ctx);
    return ctx.send(r);
  },

  adsdetail: async (ctx) => {
    let accountId = ctx.params.id
    let r = await strapi.services.myads.adsdetail(accountId,ctx)
    return ctx.send(r);
  }
};
