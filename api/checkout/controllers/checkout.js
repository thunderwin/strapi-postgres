"use strict";
const send = require("koa-send");
const Joi = require("joi");

module.exports = {
  theme: (ctx) => {
    console.log("%c req.query", "color:green;font-weight:bold");
    console.log(JSON.stringify(ctx.query));

    ctx.set("Content-Type", "application/liquid");
    //   res.header("Content-Length", 2400);
    //   res.cookie("state", shopState);

    let filePath = "/api/checkout/theme/checkout.liquid";

    // console.dir("filePath");
    // console.log(JSON.stringify(filePath));

    return send(ctx, filePath);
  },

  init: async (ctx) => {
    let body = ctx.request.body;
    console.dir("%c 初始化购物车", "color:green;font-weight:bold");
    console.log(JSON.stringify(body));

    const schema = Joi.object({
      token: Joi.string().required(),
      content: Joi.object().required(),
      domain: Joi.string().required(),
    });

    const { error, value } = schema.validate(body);

    if (error) {
      return ctx.send(error.details);
    }

    try {
      let cart;
      cart = await strapi
        .query("order")
        .findOne({ token: value.token, active: true });

      console.dir("取到购物车");
      console.log(JSON.stringify(cart));

      if (!cart) {
        console.dir("需要存订单");
        cart = await strapi.query("order").create({
          token: value.token,
          content: value.content,
          domain: value.domain,
          active: true, // 新建的订单 active
        });
      }

      console.dir("同步订单");

      cart = await strapi.query("order").update(
        { id: cart.id },
        {
          content: value.content,
        }
      );

      return ctx.send(cart);
    } catch (error) {
      console.dir("获取购物车出错", "color:green;font-weight:bold");
      console.log(JSON.stringify(error));
      throw error;
    }
  },

  updateOrder: async (ctx) => {
    let body = ctx.request.body;
    console.dir("%c 结账参数", "color:green;font-weight:bold");
    console.log(JSON.stringify(body));

    const schema = Joi.object({
      id: Joi.number().required(),
      token: Joi.string().required(),
      email: Joi.string().email(),
      content: Joi.object().required(),
      address: Joi.object(),
      shipping: Joi.string(),
      shippingFee: Joi.number(),
      payment: Joi.string(),
      phone: Joi.string(),
      checkout: Joi.boolean(),
    });

    const { error, value } = schema.validate(body);

    if (error) {
      return ctx.send(error.details);
    }

    console.dir("%c 数通过", "color:green;font-weight:bold");
    console.log(JSON.stringify(value));

    try {
      let order = await strapi.query("order").update({ id: value.id }, value);

      console.dir("%c 再次同步购物车", "color:green;font-weight:bold");
      console.log(JSON.stringify(order.id));

      if (!!value.checkout) {
        // 如果要求结账, 获取paypal
        let paypalLinks = await strapi.services.paypal.paypalPrepay(order);
        return ctx.send(paypalLinks);
      }

      return ctx.send(order);
    } catch (error) {
      console.dir("获取购物车出错", "color:green;font-weight:bold");
      console.log(JSON.stringify(error));

      throw error;
    }
  },

  applyCoupon: async (ctx) => {
    let body = ctx.request.body;
    const schema = Joi.object({
      couponCode: Joi.string().required(),
      orderId: Joi.number().required(),
    });
    const { error, value } = schema.validate(body);
    if (error) {
      return ctx.send(error.details);
    }
    // 1 查表获取coupon 信息
    let info = await strapi.query("coupon").findOne({ code: value.couponCode });

    console.dir("coupon 信息");
    console.log(JSON.stringify(info));

    if (!info) {
      return ctx.send({
        code: 1,
        msg: "Coupon code is not available.",
      });
    }

    // 2 更新到订单上
    let updatedOrder = await strapi
      .query("order")
      .update({ id: value.orderId }, { coupon: info });

    if (updatedOrder.id) {
      console.dir("订单更新成功，");

      return ctx.send({
        code: 0,
        data: updatedOrder,
      });
    }

    //
  },

  removeCoupon: async (ctx) => {},

  payment: async (ctx) => {
    // 对某一个订单发起支付
    let body = ctx.request.body;
    console.dir("%c 结账参数", "color:green;font-weight:bold");
    console.log(JSON.stringify(body));

    let order = await strapi.query("order").findOne({ id: body.orderid });

    // 准备支付订单
    let paypalLinks = await strapi.services.paypal.paypalPrepay(order);
    return ctx.send(paypalLinks);
  },

  placeOrder: async (ctx) => {
    // 支付成功后，把订单固定
    let body = ctx.request.body;
    console.dir("%c 支付成功参数", "color:green;font-weight:bold");
    console.log(JSON.stringify(body));

    const schema = Joi.object({
      id: Joi.number().required(),
      token: Joi.string().required(),
      domain: Joi.string().required(),
    });

    const { error, value } = schema.validate(body);

    if (error) {
      return ctx.send(error.details);
    }

    console.dir("%c 验证参数通过", "color:green;font-weight:bold");
    console.log(JSON.stringify(value));

    let { token, id, domain } = value;

    try {
      let verifyPayment = await strapi.services.paypal.paypalCaptureOrder(
        token,
        domain
      );

      console.log("验证付款对不对");
      console.log(verifyPayment);

      if (!verifyPayment) {
        return ctx.send({
          code: 1,
          msg: "payment verfiy fails",
        });
      }

      let order = await strapi
        .query("order")
        .update({ id }, { paymentStatus: "success", active: false });

      console.dir("%c 修改状态为支付", "color:green;font-weight:bold");
      console.log(JSON.stringify(order.id));

      return ctx.send(order);
    } catch (error) {
      console.dir("生产订单出错", "color:green;font-weight:bold");
      console.log(JSON.stringify(error));
      throw error;
    }
  },
};
