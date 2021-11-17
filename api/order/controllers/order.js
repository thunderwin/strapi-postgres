"use strict";
const Joi = require("joi");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /** 订单API 专用 */
  sync: async (ctx) => {
    let body = ctx.query;

    const schema = Joi.object({
      from: Joi.date().required(),
      to: Joi.date().required(),
      start: Joi.number().min(0).required(),
    });

    const { error, value } = schema.validate(body);

    if (error) {
      return ctx.send(error.details);
    }

    let r = await strapi.query("order").find({
      created_at_lt: value.to,
      created_at_gt: value.from,
      active: false,
      paymentStatus: "success",
      _limit: process.env.NODE_ENV === "development" ? 3 : 100,
      _sort: "id",
      _start: value.start,
    });

    return ctx.send(r);
  },

  /** 订单API 专用 */
  dayCount: async (ctx) => {
    let body = ctx.query;

    const schema = Joi.object({
      from: Joi.date().required(),
      to: Joi.date().required(),
    });

    const { error, value } = schema.validate(body);

    if (error) {
      return ctx.send(error.details);
    }

    let r = await strapi.query("order").count({
      created_at_lt: value.to,
      created_at_gt: value.from,
      active: false,
      paymentStatus: "success",
    });

    return ctx.send(r);
  },

  find: async (ctx) => {
    // 重写find

    let body = ctx.query;

    console.dir("body");
    console.log(body);

    const schema = Joi.object({
      _limit: Joi.number().default(10),
      _sort: Joi.string().default("id:desc"),
      _start: Joi.number().min(0).default(0),
      _from: Joi.date(),
      _to: Joi.date(),
      paymentStatus: Joi.string(),
      domain: Joi.string(),
    });
    const { error, value } = schema.validate(body);

    if (error) {
      return ctx.send(error.details);
    }

    // 加入验证当前验证该客户的权限

    console.dir("value");
    console.log(JSON.stringify(value));

    let params = {
      _limit: value._limit,
      _sort: value._sort,
      _start: value._start,
      _where: {},
    };

    if (!!value.paymentStatus) {
      params._where.paymentStatus_in = value.paymentStatus;
    }

    // if (!!value._from && !!value._to) {
    //   params._where.created_at_lt = value._to;
    //   params._where.created_at_gt = value._from;
    // }

    let user = ctx.state.user;

    let userSites = user.shopifies.map((item) => item.domain);
    if (!!value.domain) {
      // console.dir('value.domain')
      // console.log(JSON.stringify(value.domain))
      if (typeof value.domain === "string") {
        if (userSites.indexOf(value.domain) === -1) {
          return ctx.send({
            error: "没有权限",
          });
        }
        params._where.domain_in = [value.domain];
      }

      if (Array.isArray(value.domain)) {
        let temp = [];
        value.domain.forEach((item) => {
          if (userSites.indexOf(item) !== -1) {
            temp.push(item);
          }
        });
        params._where.domain_in = temp;
      }
    } else {
      // user only can see orders blongs to its sites
      params._where.domain_in = userSites;
    }

    // value._where = {
    //   domain_in: ['www.ivchicy.com',"wudizu.myshopify.com"],
    //   paymentStatus_in: ['success']
    // }

    console.dir("最终提交");
    console.log(params);

    console.log(JSON.stringify(params._where));

    let list = await strapi.query("order").find(params);
    delete params._limit;
    let count = await strapi.query("order").count(params);

    return {
      data: list,
      count: count,
    };
  },

  salesByDay: async (ctx) => {
    let body = ctx.request.body;

    const schema = Joi.object({
      from: Joi.date().required(),
      to: Joi.date().required(),
      domain: Joi.string(),
    });

    const { error, value } = schema.validate(body);

    if (error) {
      return ctx.send(error.details);
    }

    let r = await strapi
      .query("order")
      .model.query((db) => {
        db.where("created_at", ">=", value.from);
        db.where("created_at", "<", value.to);
        db.where("active", "=", false);
        db.where("paymentStatus", "=", "success");
        db.sum("totalPaidPrice");
      })
      .fetch();

    r = r.toJSON();

    console.log('%c rr','color:green;font-weight:bold')
    console.log(r)


    return {
      code: 0,
      totalSales: r.sum,
    };
  },
  /** 后台控制面板专用 */
  orderByDay: async (ctx) => {
    let body = ctx.request.body;

    const schema = Joi.object({
      from: Joi.date().required(),
      to: Joi.date().required(),
      domain: Joi.string(),
    });

    const { error, value } = schema.validate(body);

    if (error) {
      return ctx.send(error.details);
    }

    // const knex = strapi.connections.default;
    // let promise1 =  knex("orders")
    //   .where("created_at", ">=", value.from)
    //   .where("created_at", "<", value.to)
    //   .where("active", false)
    //   .where("paymentStatus", "success").sum("totalPaidPrice").count()

    let paid = {
      created_at_lt: value.to,
      created_at_gt: value.from,
      active: false,
      paymentStatus: "success",
    };

    let unpaid = {
      created_at_lt: value.to,
      created_at_gt: value.from,
      active: true,
    };

    let promise1 = strapi.query("order").count(paid);
    let promise2 = strapi.query("order").count(unpaid);

    let allCount = await Promise.all([promise1, promise2]);

    let result = {
      code: 0,
      data: {
        paidNum: allCount[0],

        unpaidNum: allCount[1],
      },
    };
    return ctx.send(result);
  },

  ads: async (ctx) => {
    let r = await strapi.services.fbad.findAdAccounts(ctx);
    return ctx.send(r);
  },
};
