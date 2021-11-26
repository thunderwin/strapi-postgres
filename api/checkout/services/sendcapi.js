"use strict";
const bizSdk = require("facebook-nodejs-business-sdk");
const axios = require("axios");
const { websites } = require("../../../config/website");

const Content = bizSdk.Content;
const CustomData = bizSdk.CustomData;
const DeliveryCategory = bizSdk.DeliveryCategory;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const ServerEvent = bizSdk.ServerEvent;

// curl -i -X POST \
//  "https://graph.facebook.com/v12.0/{PIXEL_ID}/events/?access_token=EAAMXXNt4pbABAEKyDOE8nMMcVZAMSdeaZBkOjHqX11HMYfra0ZCwKVIVzzxebbUCyZAV1mLwPQXviPlUMTuYLioaJLXwZBTsv9xmibaShtN1ZAMENoInW2PzZCxe5YH3l0GF7cuLX6C8XuK4QAkMYecxRztiiAkFAkk4JHwmdSaoZAp2SmmTg13dgiRLCzQbuP1upz5po4dtNAmjSZCevdpVZCzp1UZBYTqCK6shkVkXmZC8wypbOuY4qngJ"

const genUserData = ({ email, phone, ip, userAgent, browserId, clickId }) => {
  const userData = new UserData();

  if (!!email) {
    userData.setEmails([email]);
  }
  if (!!phone) {
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

const genCustomData = (orderContent) => {
  // 内容
  let { items, total_price, currency } = orderContent;

  let contents = items.map((x) => {
    return new Content()
      .setId(x.product_id)
      .setQuantity(x.quantity)
      .setDeliveryCategory(DeliveryCategory.HOME_DELIVERY)

  });



  const customData = new CustomData()
    .setContents(contents)
    .setContentType('product')
    .setCurrency(currency)
    .setValue((total_price/100).toFixed(2));

  return customData;
};

module.exports = {
  // 有购物车，initCheckout
  // 有地址，邮箱，addPaymentinfo
  // 有checkout payment

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
      .setEventName("initiateCheckout")
      .setEventTime(current_timestamp)
      .setUserData(userData)
      .setCustomData(customData)
      .setEventSourceUrl(capi.url)
      .setActionSource("website")
      .setEventId("init" + cart.token);

    eventList.push(initiateCheckoutEvent);

    if (userDetail.email) {
      const addPaymentInfoEvent = new ServerEvent()
        .setEventName("addPaymentInfo")
        .setEventTime(current_timestamp)
        .setUserData(userData)
        .setCustomData(customData)
        .setEventSourceUrl(capi.url)
        .setActionSource("website")
        .setEventId("input" + cart.token);

      const purchaseEvent = new ServerEvent()
        .setEventName("purchase")
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
