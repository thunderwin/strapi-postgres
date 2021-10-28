"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

let handleRestrict = (coupon, order) => {
  // verify if the coupon is valid
  let amount = order.content.original_total_price;
  let qty = order.content.items.quality;

  if (!coupon.restrict) {
    return true;
  }

  switch (coupon.restrict) {
    case "minQty":
      return qty >= coupon.minQty;
    case "minAmount":
      return amount >= coupon.minAmount;

    default:
      return true;
  }
};

let caculateDiscount = (coupon, order) => {
  let amount = order.content.original_total_price;
  switch (coupon.type) {
    case "percentage":
      return (amount * coupon.value) / 100;
    case "fixed":
      return coupon.value;
    case "itemPercentage":
      let cheapItem = order.content.items.sort((a, b) => a.price - b.price)[0]; // find cheap item price
      return (cheapItem.price ) * (coupon.value / 100);
    default:
      return 0;
  }
};

module.exports = {
  verifyCoupon: async (order, code) => {
    console.dir("code");
    console.log(JSON.stringify(code));

    const couponData = await strapi.services.coupon.findOne({ code });

    if (!couponData) {
      return {
        valid: false,
        message: "Coupon not found",
      };
    }

    let isValid = handleRestrict(couponData, order);
    let discountAmount = caculateDiscount(couponData, order);

    let discountItem = {
      label: couponData.label,
      value: discountAmount,
    };

    return {
      valid: isValid,
      message: isValid ? "Coupon is valid" : "Coupon is not valid",
      discount: [discountItem], // TODO: add multiple discount
      couponData,
    };
  },
};
