"use strict";
const send = require("koa-send");
const Joi = require("joi");

const requestIp = require("request-ip");

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

    // console.dir("%c 初始化购物车", "color:green;font-weight:bold");
    // console.log(JSON.stringify(body));

    const schema = Joi.object({
      token: Joi.string().required(),
      content: Joi.object().required(),
      domain: Joi.string().required(),
      capi: Joi.object().required(),
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

      // console.dir("取到购物车");
      // console.log(JSON.stringify(cart));

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

      ctx.send(cart);



      return strapi.services.sendcapi.capi({
        cart: value.content, // 购物车
        capi: value.capi, // capi
        userIp: ctx.realIp,
        domain: value.domain,
      });


    } catch (error) {
      console.dir("获取购物车出错", "color:green;font-weight:bold");
      console.log(JSON.stringify(error));
      strapi.plugins.sentry.services.sentry.sendError(error);

      throw error;
    }
  },

  updateOrder: async (ctx) => {
    let body = ctx.request.body;


    const schema = Joi.object({
      id: Joi.number().required(),
      token: Joi.string().trim().required(),
      email: Joi.string().trim().email(),
      content: Joi.object().required(),
      address: Joi.object(),
      shipping: Joi.string(),
      shippingFee: Joi.number(),
      payment: Joi.string(),
      phone: Joi.string().trim(),
      checkout: Joi.boolean(),
      capi: Joi.object(),
    });

    const { error, value } = schema.validate(body);

    if (error) {
      strapi.plugins.sentry.services.sentry.sendError(error);

      return ctx.send(error.details);
    }

    // console.dir("%c 数通过", "color:green;font-weight:bold");
    // console.log(JSON.stringify(value));

    try {
      let order = await strapi.query("order").update({ id: value.id }, value);

      console.dir("%c 再次同步购物车", "color:green;font-weight:bold");
      console.log(JSON.stringify(order.id));

      if (!!value.checkout) {

        // send evernt to capi
        strapi.services.sendcapi.capi({
          cart: value.content, // 购物车
          capi: value.capi, // capi
          userIp: ctx.realIp,
          domain: order.domain,
          userDetail:{
            email: value.email,
            phone: value.phone,
          }
        });
        // 如果要求结账, 获取paypal
        let paypalLinks = await strapi.services.paypal.paypalPrepay(order);

        console.log("%c paypalLinks", "color:green;font-weight:bold");
        console.log(JSON.stringify(paypalLinks));



        return ctx.send(paypalLinks);
      }

      return ctx.send(order);
    } catch (error) {
      console.dir("获取购物车出错", "color:green;font-weight:bold");
      console.log(JSON.stringify(error));

      strapi.plugins.sentry.services.sentry.sendError(error);

      throw error;
    }
  },

  applyCoupon: async (ctx) => {
    let body = ctx.request.body;
    const schema = Joi.object({
      couponCode: Joi.string().lowercase().required(),
      orderId: Joi.number().required(),
    });
    const { error, value } = schema.validate(body);
    if (error) {
      return ctx.send(error.details);
    }

    // 1 验证 coupon 信息
    let order = await strapi.query("order").findOne({ id: value.orderId });

    let { valid, message, discount, couponData } =
      await strapi.services.coupon.verifyCoupon(order, value.couponCode);

    if (!valid) {
      return ctx.send({
        code: 1,
        msg: message,
      });
    }

    // 2 更新到订单上
    let updatedOrder = await strapi
      .query("order")
      .update({ id: value.orderId }, { coupon: couponData, discount });

    if (updatedOrder.id) {
      console.dir("订单更新成功");

      return ctx.send({
        code: 0,
        data: updatedOrder,
      });
    }

    //
  },

  removeCoupon: async (ctx) => {},

  // payment: async (ctx) => {
  //   // 对某一个订单发起支付
  //   let body = ctx.request.body;
  //   console.dir("%c 结账参数", "color:green;font-weight:bold");
  //   console.log(JSON.stringify(body));

  //   let order = await strapi.query("order").findOne({ id: body.orderid });

  //   // 准备支付订单
  //   let paypalLinks = await strapi.services.paypal.paypalPrepay(order);
  //   return ctx.send(paypalLinks);
  // },

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
      strapi.plugins.sentry.services.sentry.sendError(error);

      throw error;
    }
  },

  paypalNotify: async (ctx) => {
    let body = ctx.request.body;
    console.dir("%c paypal通知", "color:green;font-weight:bold");
    console.log(JSON.stringify(body));

    // 告诉收到了，别发了
    ctx.send("OK");

    // 检查是不是真的来自paypal
    let r = await strapi.services.paypal.paypalIPN(body);

    if (!r) return;

    // 先保存为日志

    return await strapi.query("log-ipn").create({
      body: body,
      env: process.env.NODE_ENV,
    });
  },
};
