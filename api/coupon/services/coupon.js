"use strict";



let handleRestrict = (coupon, order) => {
  // verify if the coupon is valid
  let amount = order.content.original_total_price;
  let qty = order.content.item_count;

  console.log(amount);
  console.log(qty);

  if (!coupon.restrict) {
    return true;
  }
  let keys = Object.keys(coupon.restrict);

  for (let i = 0; i < keys.length; i++) {
    switch (keys[i]) {
      case "minQty":
        return qty >= coupon.restrict.minQty;
      case "minAmount":
        return amount >= coupon.restrict.minAmount;

      default:
        return true;
    }
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
      return cheapItem.price * (coupon.value / 100);
    default:
      return 0;
  }
};

module.exports = {
  verifyCoupon: async (order, code) => {
    console.dir("code");
    console.log(JSON.stringify(code));

    let couponData = await strapi.query('coupon').findOne({ code });

    if (!couponData) {
      console.log("%c couponData is null","color:red;font-weight:bold")
      return {
        valid: false,
        message: "Coupon not found",
      };
    }

    // 优惠券存在，查看是不是可用，和计算折扣
    let isValid = handleRestrict(couponData, order);
    console.dir("isValid");
    console.log(JSON.stringify(isValid));

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
