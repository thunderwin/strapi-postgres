const config = require("./website");
const paypal = require("@paypal/checkout-server-sdk");
const { getCode } = require("country-list");

// 下单

// https://www.jianshu.com/p/2616edf53705s
// paypal 支付文档

// https://github.com/paypal/Checkout-NodeJS-SDK  最新文档

/**
 * 测试账户
sb-mz3sa340502@personal.example.com
$V!0d$xS

测试收钱账户
sb-qolrx340835@business.example.com
5me[]O^9

 */

// let PaypalId =
//   "AbZ5LVK5D2LWA3Cq2jZHwZGdl3rQs8iskKlezfFlsOv4FEkGTn3jd2QSwFXRWUoouw_5pFchavaQXsyo";
// let PaypalKey =
//   "EP5SHbGNiYoBx7x0Y2VAInORcFsiyeCHuH0DhHGj3Y8ecnhJ2kaNBhOALZxiOttH1ZvOXeQW8wprPCQO";

function genPaypalClient(domain) {
  let paypalCredential = config(); //  拿到paypal 配置
  paypalCredential = paypalCredential.paypalConfig;

  let environment = new paypal.core.SandboxEnvironment(
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

  console.dir("购物车");
  console.log(JSON.stringify(cart));

  let c = cart.content;
  let currency = c.currency;

  currency = "USD";

  //   let { prices, items, shipping_addresses } = c;

  let shippingAddress = cart.address;

  let discountTotal = 0;
  if (c.cart_level_discount_applications.length > 0) {
    console.dir("有折扣");

    // 计算总折扣
    discountTotal = prices.discounts.reduce((sum, x) => {
      return (sum += x.amount.value);
    }, 0);
    discountTotal = discountTotal.toFixed(2);
  }

  console.dir("总折扣");
  console.log(JSON.stringify(discountTotal));

  let payload = {
    intent: "CAPTURE",
    application_context: {
      return_url:
        "https://" + cart.domain + "/apps/checkout/?successId=" + cart.id, // 支付成功
      cancel_url:
        "https://" + cart.domain + "/apps/checkout?cancelId=" + cart.id, // 取消支付后
    },
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: c.items_subtotal_price / 100,
          breakdown: {
            item_total: {
              currency_code: currency, // 不含税的商品总价
              value: c.original_total_price / 100,
            },
            shipping: {
              currency_code: currency,
              value: 0,
            },
            discount: {
              currency_code: currency,
              value: discountTotal / 100,
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
          method: "free shipping",
          name: {
            full_name: "leisen",
          },
          address: {
            address_line_1: shippingAddress["address[address1]"],
            address_line_2: shippingAddress["address[address2]"] || "",
            admin_area_2: shippingAddress["address[city]"],
            admin_area_1: shippingAddress["address[province]"],
            postal_code: shippingAddress["address[zip]"],
            country_code: getCode(shippingAddress.country) || "US",
          },
        },
      },
    ],
  };

  return payload;
}

module.exports = {
  async paypalPrepay(cart) {
    //1 组合参数
    let payload = await fetchCartAndGenPaypalPayload(cart);
    // return payload;

    console.dir(" 组合的paypal 参数");
    console.log(JSON.stringify(payload));

    // 3 获取paypal 客户端
    let { client, request } = genPaypalClient(cart.domain);

    // 4 执行支付
    request.requestBody(payload);
    let response = await client.execute(request);

    return response.result;
  },

  async paypalCaptureOrder(req) {
    let p = req.body;

    if (!p.token || !p.orderId) {
      return "参数不对";
    }

    console.log("%c 当前的token", "color:green;font-weight:bold");
    console.log(JSON.stringify(p.token));
    console.log("%c 当前的orderId", "color:green;font-weight:bold");
    console.log(JSON.stringify(p.orderId));

    let paypalCredential = req.storeConfig.paypalConfig;

    let environment = new paypal.core.SandboxEnvironment(
      paypalCredential.paypalId,
      paypalCredential.paypalKey
    );
    let client = new paypal.core.PayPalHttpClient(environment);
    let request = new paypal.orders.OrdersCaptureRequest(p.token);
    request.requestBody({});

    try {
      let response = await client.execute(request);
      console.log("付款验证通过" + JSON.stringify(response));

      if (response.statusCode !== 201 || !response.result.id) {
        return {
          code: 1,
          msg: "付款验证失败",
        };
      }

      console.log("%c ???", "color:green;font-weight:bold");
      console.log(JSON.stringify());

      let { placeOrder } = await req.gGuest.request(placeOrderGQL, {
        input: {
          cart_id: p.orderId,
        },
      });

      console.log("%c placeOrder", "color:green;font-weight:bold");
      console.log(JSON.stringify(placeOrder));

      // let { data: r } = await req.rAdmin.post(`order/${p.orderId}/invoice`);

      // console.log("%c r", "color:green;font-weight:bold");
      // console.log(JSON.stringify(r));

      return placeOrder.order;
    } catch (error) {
      console.log("❌" + JSON.stringify(error));
      return error;
    }
  },
};
