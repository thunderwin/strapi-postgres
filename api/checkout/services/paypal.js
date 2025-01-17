const paypal = require("@paypal/checkout-server-sdk");
const { getCode } = require("country-list");
const axios = require("axios");
const request = require("request");
const Promise = require("bluebird");

// 下单

// https://www.jianshu.com/p/2616edf53705s
// paypal 支付文档

// https://github.com/paypal/Checkout-NodeJS-SDK  最新文档



function genPaypalClient(config) {



  let paypalCredential = config.paypal; //  拿到paypal 配置

  let environment =
    process.env.NODE_ENV === "development"
      ? new paypal.core.SandboxEnvironment(
          paypalCredential.paypalId,
          paypalCredential.paypalKey
        )
      : new paypal.core.LiveEnvironment(
          paypalCredential.paypalId,
          paypalCredential.paypalKey
        );

  let client = new paypal.core.PayPalHttpClient(environment);
  let request = new paypal.orders.OrdersCreateRequest();
  return {
    request,
    client,
  };
}

async function fetchCartAndGenPaypalPayload(cart) {
  // 部获取购物车用来支付

  // console.dir("购物车");
  // console.log(JSON.stringify(cart));

  let coupon = cart.coupon;
  let c = cart.content; // 购物车
  let currency = c.currency;
  let totalPrice = (c.original_total_price / 100).toFixed(2);

  currency = "USD";

  //   let { prices, items, shipping_addresses } = c;

  let shippingAddress = cart.address;

  let discountTotal = 0;
  if (!!cart.discount && cart.discount.length > 0) {
    console.dir("有折扣");

    // 计算总折扣
    discountTotal = cart.discount.reduce((acc, cur) => {
      return acc + cur.value;
    }, 0);

    discountTotal = (discountTotal / 100).toFixed(2);
  }

  console.dir("总折扣");
  console.log(JSON.stringify(discountTotal));

  let payload = {
    intent: "CAPTURE",
    application_context: {
      return_url:
        "https://" + cart.domain + "/a/checkout/?successId=" + cart.id, // 支付成功
      cancel_url: "https://" + cart.domain + "/a/checkout?cancelId=" + cart.id, // 取消支付后
    },
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: (totalPrice - discountTotal + cart.shippingFee / 100).toFixed(
            2
          ),
          breakdown: {
            item_total: {
              currency_code: currency, // 不含税的商品总价
              value: totalPrice,
            },
            shipping: {
              currency_code: currency,
              value: (cart.shippingFee / 100).toFixed(2),
            },
            discount: {
              currency_code: currency,
              value: discountTotal,
            },
          },
        },

        items: c.items.map((x) => {
          return {
            name: x.product_title,
            unit_amount: {
              currency_code: currency,
              value: x.final_price / 100,
            },
            quantity: x.quantity,
          };
        }),

        shipping: {
          method: cart.shipping,
          name: {
            full_name: shippingAddress.firstname + shippingAddress.lastname,
          },
          address: {
            address_line_1: shippingAddress.address1,
            address_line_2: shippingAddress.address2 || "",
            admin_area_2: shippingAddress.city,
            admin_area_1: shippingAddress.province,
            postal_code: shippingAddress.zip || "35238",
            country_code: getCode(shippingAddress.country) || "US",
          },
        },

      },
    ],
  };
  return payload;
}

module.exports = {
  async paypalPrepay(cart,config) {
    //1 组合参数
    let payload = await fetchCartAndGenPaypalPayload(cart);
    // return payload;

    console.dir(" 组合的paypal 参数");
    console.log(JSON.stringify(payload));

    // 3 获取paypal 客户端
    let { client, request } = genPaypalClient(config);

    // 4 执行支付
    request.requestBody(payload);

    try {
      let response = await client.execute(request);

      return response.result;
    } catch (error) {
      // console.dir("paypal key error");
      // strapi.plugins.sentry.services.sentry.sendError(error);
      strapi.services.log.logError("paypal key error", error);

      throw error;
    }
  },

  async paypalCaptureOrder(token, domain, config) {

    paypalCredential = config.paypal;

    let environment =
      process.env.NODE_ENV === "development"
        ? new paypal.core.SandboxEnvironment(
            paypalCredential.paypalId,
            paypalCredential.paypalKey
          )
        : new paypal.core.LiveEnvironment(
            paypalCredential.paypalId,
            paypalCredential.paypalKey
          );

    let client = new paypal.core.PayPalHttpClient(environment);
    let request = new paypal.orders.OrdersCaptureRequest(token);

    request.requestBody({});

    try {
      let response = await client.execute(request);

      console.dir("付款验证结果");
      console.log(JSON.stringify(response));

      if (
        response.statusCode === 201 &&
        response.result.status === "COMPLETED"
      ) {
        return {
          code: 0,
          message: "付款成功",
          data: response.result,
        };
      }

      strapi.services.log.logError("付款验证失败", response);

      return {
        code: 1,
        message: "付款失败",
        data: response,
      };

      // if (response.statusCode !== 201 || !response.result.id) {
      //   strapi.services.log.logError("付款验证状态不对", response);
      //   return {
      //     code:1,
      //     message: "付款验证失败",
      //   };
      // }

      // function genResponse(response) {
      //   return {
      //     paypalDebugId: response.headers["paypal-debug-id"],
      //     transactionId: response.result.id,
      //     account: paypalCredential.paypalAccount,
      //     payer: response.result.payer,
      //   };
      // }

      // // paypalCredential.paypalAccount  也需要更新
      // return genResponse(response);
    } catch (error) {
      if (error.statusCode === 422) {
        console.log("%c 重复验证付款", "color:green;font-weight:bold");
        strapi.services.log.logError("重复验证付款", error);
        return {
          code: 2,
          message: "重复验证付款",
          data: error,
        };
      } else {
        console.log("❌" + JSON.stringify(error));
        strapi.services.log.logError("捕获付款错误", error);

        throw error;
      }
    }
  },

  paypalIPN(body) {
    return new Promise((resolve, reject) => {
      // Prepend 'cmd=_notify-validate' flag to the post string
      let postreq = "cmd=_notify-validate";

      // Iterate the original request payload object
      // and prepend its keys and values to the post string
      Object.keys(body).map((key) => {
        postreq = `${postreq}&${key}=${body[key]}`;
        return key;
      });

      const options = {
        url:
          process.env.NODE_ENV === "development"
            ? "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr"
            : "https://ipnpb.paypal.com/cgi-bin/webscr",
        method: "POST",
        headers: {
          "Content-Length": postreq.length,
        },
        encoding: "utf-8",
        body: postreq,
      };

      // Make a post request to PayPal
      request(options, (error, response, resBody) => {
        if (error || response.statusCode !== 200) {
          reject(new Error(error));
          return;
        }

        // Validate the response from PayPal and resolve / reject the promise.
        if (resBody.substring(0, 8) === "VERIFIED") {
          resolve(true);
        } else if (resBody.substring(0, 7) === "INVALID") {
          reject(new Error("IPN Message is invalid."));
        } else {
          reject(new Error("Unexpected response body."));
        }
      });
    });
  },
};
