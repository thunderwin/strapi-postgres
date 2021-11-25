"use strict";
const bizSdk = require("facebook-nodejs-business-sdk");
const axios = require('axios')
const {websites} = require("../../../config/website");

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
      .setDeliveryCategory(DeliveryCategory.HOME_DELIVERY);
  });

  //  const content = new Content()
  //  .setId("product123")
  //  .setQuantity(1)
  //  .setDeliveryCategory(DeliveryCategory.HOME_DELIVERY);

  const customData = new CustomData()
    .setContents(contents)
    .setCurrency(currency)
    .setValue(total_price);

  return customData;
};

module.exports = {
  // 有购物车，initCheckout
  // 有地址，邮箱，addPaymentinfo
  // 有checkout payment

  capi({ cart, capi, userIp, domain, userDetail = {} }) {

    console.dir('开始发送事件')

    try {
      axios.post(`https://graph.facebook.com/v12.0/271219534959974/events?data=%5B%0A%20%20%7B%0A%20%20%20%20%22event_name%22%3A%20%22AddPaymentInfo%22%2C%0A%20%20%20%20%22event_time%22%3A%201637815953%2C%0A%20%20%20%20%22action_source%22%3A%20%22email%22%2C%0A%20%20%20%20%22user_data%22%3A%20%7B%0A%20%20%20%20%20%20%22em%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%227b17fb0bd173f625b58636fb796407c22b3d16fc78302d79f0fd30c2fc2fc068%22%0A%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%22ph%22%3A%20%5B%0A%20%20%20%20%20%20%20%20null%0A%20%20%20%20%20%20%5D%0A%20%20%20%20%7D%2C%0A%20%20%20%20%22custom_data%22%3A%20%7B%0A%20%20%20%20%20%20%22currency%22%3A%20%22USD%22%2C%0A%20%20%20%20%20%20%22value%22%3A%20%22142.52%22%0A%20%20%20%20%7D%0A%20%20%7D%0A%5D&test_event_code=TEST15703&access_token=EAAG27dIsmAEBAB2OC6xmjmWlKfUZAVc4x1dhSSIahZCdbDzxNjkPsv7blZCfsX7vQ8vYzT5PqRFhkfEau3GgQX9KYVuUhFl9TCglrMyvl2cugtol9sni04APtfyEdzzPsyPFLSfEgj5gcfusHUYJuz1FdAdAbodLZAmulQZAs2AUlv0DGQ2piRLLknHyj5LMZD`)

    } catch (error) {
      console.log('%c 出错','color:green;font-weight:bold')
      console.log(JSON.stringify(error))

    }


    return


    if (!domain){
      throw new Error("domain is required");
    }

    let websiteConfig = websites[domain];

    console.log('%c ?????','color:green;font-weight:bold')
    console.log(JSON.stringify(websiteConfig))

    let facebookConfig = websiteConfig.facebookConfig;

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
    ).setTestEventCode(facebookConfig.capiTestId).setEvents(eventsData);

    console.dir("事件列表");
    console.log(JSON.stringify(eventsData));

    eventRequest.execute().then(
      (response) => {
        console.log("Response: ", response);
      },
      (err) => {
        console.error("Error: ", err);
      }
    );
  },




};
