"use strict";
const Joi = require("joi");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
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

      _limit: 3,
      _sort: "id",
      _start: value.start,
    });

    return ctx.send(r);
  },

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

    let user = ctx.state.user;


    let userSites = user.shopifies.map((item) => item.domain);
    if (!!value.domain) {

      // console.dir('value.domain')
      // console.log(JSON.stringify(value.domain))
      if ( typeof value.domain === 'string'){
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
};
