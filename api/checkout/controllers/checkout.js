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
    console.dir("%c 初始化购物车 ctx.body", "color:green;font-weight:bold");
    console.log(JSON.stringify(ctx.request.body));
    let body = ctx.request.body;

    try {
      let cart;
      cart = await strapi
        .query("order")
        .findOne({ token: body.token, active: true });

      console.dir("取到购物车");
      console.log(JSON.stringify(cart));

      if (!cart) {
        console.dir("需要存");
        cart = await strapi.query("order").create({
          token: body.token,
          content: body.content,
          domain: body.domain,
          active: true, // 新建的订单 active
        });
      }
      return ctx.send(cart);
    } catch (error) {
      console.dir("获取购物车出错", "color:green;font-weight:bold");
      console.log(JSON.stringify(error));
      throw error;
    }
  },

  onepage: async (ctx) => {
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
      checkout: Joi.boolean(),
    });

    const { error, value } = schema.validate(body);

    if (error) {
      return ctx.send(error.details);
    }

    console.dir("%c 验证参数通过", "color:green;font-weight:bold");
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
  placeorder: async (ctx) => {
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
