const { default: createStrapi } = require("strapi")


module.exports = {
  couponInfo: async (couponCode) => {
    // 获取coupon 信息

    let info  = await strapi.query('coupon').findOne({code: couponCode})
    return info

  }
}
