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
};
