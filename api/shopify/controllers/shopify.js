"use strict";
const nonce = require("nonce")();
const crypto = require("crypto");
const cookie = require("cookie");
const request = require("request-promise");
const querystring = require("querystring");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  initApp: (ctx) => {
    console.log("%c ctx.query", "color:green;font-weight:bold");
    console.log(JSON.stringify(ctx.query));
    const shop = ctx.query.shop;

    if (!shop) {
      return ctx.status(400).send('Missing "Shop Name" parameter!!');
    }

    // Shop Name

    const shopState = nonce();
    // shopify callback redirect
    const redirectURL = process.env.TUNNEL_URL + "/shopify/callback";

    console.log("%c redirectURL", "color:green;font-weight:bold");
    console.log(JSON.stringify(redirectURL));

    // Install URL for app install
    const shopifyURL =
      "https://" +
      shop +
      "/admin/oauth/authorize?client_id=" +
      process.env.SHOPIFY_API_KEY +
      "&scope=" +
      process.env.SCOPES +
      "&state=" +
      shopState +
      "&redirect_uri=" +
      redirectURL;

    ctx.cookies.set("state", shopState);
    ctx.redirect(shopifyURL);
  },

  callback: (ctx) => {
    console.log("%c 访问callback", "color:green;font-weight:bold");
    console.log(JSON.stringify(ctx.query));

    const { shop, hmac, code, state } = ctx.query;
    const stateCookie = cookie.parse(ctx.headers.cookie).state;

    if (state !== stateCookie) {
      return ctx.send("Request origin cannot be verified");
    }


    if (shop && hmac && code) {
      const queryMap = Object.assign({}, ctx.query);
      delete queryMap["signature"];
      delete queryMap["hmac"];

      const message = querystring.stringify(queryMap);
      const providedHmac = Buffer.from(hmac, "utf-8");
      const generatedHash = Buffer.from(
        crypto
          .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
          .update(message)
          .digest("hex"),
        "utf-8"
      );

      let hashEquals = false;

      try {
        hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac);
      } catch (e) {
        hashEquals = false;
      }

      if (!hashEquals) {
        return ctx.send("HMAC validation failed");
      }

      const accessTokenRequestUrl =
        "https://" + shop + "/admin/oauth/access_token";
      const accessTokenPayload = {
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      };

      console.dir('accessTokenRequestUrl')
      console.log(JSON.stringify(accessTokenRequestUrl))


      request
        .post(accessTokenRequestUrl, { json: accessTokenPayload })
        .then((accessTokenResponse) => {

          console.dir('accessTokenResponse')
          console.log(JSON.stringify(accessTokenResponse))

          const accessToken = accessTokenResponse.access_token;
          const shopRequestURL =
            "https://" + shop + "/admin/api/2020-04/shop.json";
          const shopRequestHeaders = { "X-Shopify-Access-Token": accessToken };

          request
            .get(shopRequestURL, { headers: shopRequestHeaders })
            .then((shopResponse) => {
              ctx.redirect("https://" + shop + "/admin/apps");
            })
            .catch((error) => {
              console.log("%c error", "color:red;font-weight:bold");
              ctx.send(error.error.error_description);
            });
        })
        .catch((error) => {
          console.log("%c error", "color:red;font-weight:bold");

          console.log(error.error.error_description);

          ctx.send(error.error.error_description);
        });


    } else {

      ctx.send("Required parameters missing");
    }
  },
};
