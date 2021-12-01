"use strict";
const bizSdk = require("facebook-nodejs-business-sdk");

const Content = bizSdk.Content;
const CustomData = bizSdk.CustomData;
const DeliveryCategory = bizSdk.DeliveryCategory;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const ServerEvent = bizSdk.ServerEvent;

const genUserData = (order, capi, ctx) => {
  let { email, address } = order;
  let phone = null;
  if (address) {
    phone = address.phone;
  }
  let { userAgent, browserId, clickId } = capi;
  let ip = ctx.realIp;

  const userData = new UserData();

  if (!!email) {
    userData.setEmails([email]);
  }
  if (!!phone && phone.length > 7 && phone.length < 15) {
    userData.setPhones([phone]);
  }
  if (!!ip) {
    userData.setClientIpAddress(ip);
  }
  if (!!userAgent) {
    userData.setClientUserAgent(userAgent);
  }
  if (!!browserId) {
    userData.setFbp(browserId);
  }
  if (!!clickId) {
    userData.setFbc(clickId);
  }

  return userData;
};

const genCustomData = (order) => {
  // 内容
  let { items, currency } = order.content;
  let { subtotalPrice, totalPaidPrice } = order;

  let realSubmitAmount = totalPaidPrice || subtotalPrice / 100; // 有实付金额优先使用实付金额

  let contents = items.map((x) => {
    return new Content()
      .setId(x.product_id)
      .setQuantity(x.quantity)
      .setDeliveryCategory(DeliveryCategory.HOME_DELIVERY);
  });

  const customData = new CustomData()
    .setContents(contents)
    .setContentType("product")
    .setCurrency(currency)
    .setValue(realSubmitAmount);

  return customData;
};

const sendEvent = (type, order, capi, ctx) => {
  let facebookConfig = ctx.config.facebook;

  let { capiTestId, pixelId, pixelAccessToken } = facebookConfig;

  bizSdk.FacebookAdsApi.init(pixelAccessToken);
  let current_timestamp = Math.floor(new Date() / 1000);
  let customData = genCustomData(order);
  let userData = genUserData(order, capi, ctx);

  const event = new ServerEvent()
    .setEventName(type)
    .setEventTime(current_timestamp)
    .setUserData(userData)
    .setCustomData(customData)
    .setEventSourceUrl(capi.url)
    .setActionSource("website")
    .setEventId(type + order.id);

  const eventRequest = new EventRequest(pixelAccessToken, pixelId)
    .setTestEventCode(capiTestId)
    .setEvents([event]);

  // console.dir("事件");
  // console.log(event);

  eventRequest.execute().then(
    (response) => {
      console.log(type + " success");
    },
    (err) => {
      console.dir("发送" + type + "事件失败");
      console.log(JSON.stringify(err));
      strapi.services.log.logTracking(type + "失败", err);
    }
  );
};

module.exports = {
  // 有购物车，initCheckout
  // 有地址，邮箱，addPaymentinfo
  // 有checkout payment

  sendEvent,

  initCheckout(order, capi, ctx) {
    let facebookConfig = ctx.config.facebook;
    bizSdk.FacebookAdsApi.init(facebookConfig.pixelAccessToken);

    let current_timestamp = Math.floor(new Date() / 1000);
    let customData = genCustomData(order);
    let userData = genUserData(order, capi, ctx);

    let eventList = [];

    const initiateCheckoutEvent = new ServerEvent()
      .setEventName("InitiateCheckout")
      .setEventTime(current_timestamp)
      .setUserData(userData)
      .setCustomData(customData)
      .setEventSourceUrl(capi.url)
      .setActionSource("website")
      .setEventId("init" + order.id);

    eventList.push(initiateCheckoutEvent);

    eventRequest.execute().then(
      (response) => {
        console.log("initCheckout success");
      },
      (err) => {
        strapi.services.log.logTracking("initCheckout 失败", err);
      }
    );
  },

  capi({ cart, capi, userIp, domain, userDetail = {} }, config) {
    if (!domain) {
      throw new Error("domain is required");
    }

    let facebookConfig = config.facebook;

    const api = bizSdk.FacebookAdsApi.init(facebookConfig.pixelAccessToken);

    let current_timestamp = Math.floor(new Date() / 1000);

    let customData = genCustomData(cart);

    let userData = genUserData({
      userAgent: capi.userAgent,
      browserId: capi.fbp,
      clickId: capi.fbc,
      ip: userIp,
      email: userDetail.email,
      phone: userDetail.phone,
      // 这里没email
    });

    let eventList = [];

    const initiateCheckoutEvent = new ServerEvent()
      .setEventName("InitiateCheckout")
      .setEventTime(current_timestamp)
      .setUserData(userData)
      .setCustomData(customData)
      .setEventSourceUrl(capi.url)
      .setActionSource("website")
      .setEventId("init" + cart.token);

    eventList.push(initiateCheckoutEvent);

    if (userDetail.email) {
      const addPaymentInfoEvent = new ServerEvent()
        .setEventName("AddPaymentInfo")
        .setEventTime(current_timestamp)
        .setUserData(userData)
        .setCustomData(customData)
        .setEventSourceUrl(capi.url)
        .setActionSource("website")
        .setEventId("input" + cart.token);

      const purchaseEvent = new ServerEvent()
        .setEventName("Purchase")
        .setEventTime(current_timestamp)
        .setUserData(userData)
        .setCustomData(customData)
        .setEventSourceUrl(capi.url)
        .setActionSource("website")
        .setEventId("pay" + cart.token);

      eventList.push(addPaymentInfoEvent);
      eventList.push(purchaseEvent);
    }

    const eventsData = eventList; // 可以是数组，多个event

    const eventRequest = new EventRequest(
      facebookConfig.pixelAccessToken,
      facebookConfig.pixelId
    )
      .setTestEventCode(facebookConfig.capiTestId)
      .setEvents(eventsData);

    console.dir("事件列表");
    console.log(JSON.stringify(eventsData));

    eventRequest.execute().then(
      (response) => {
        console.log("capi成功");
      },
      (err) => {
        console.error("Error: ", err);
      }
    );
  },
};
