/*
 * 监控配置baseUrl
 * baseUrl = 'http://xxx.xxx'
 */

// 跳转拦截
!(function () {
  const t = {
    config: {
      dataAttrAppUrl: "data-checkify-url",
      dataAttrName: "data-checkify",
      defaultAppBaseUrl: "",
      domainPath: "/a/checkout",
    },
    variables: { isPreventDefaultHandlers: !0, isCheckoutProcessing: !1 },
    cartApi: {
      clearCart: function () {
        return fetch("/cart/clear.js", {
          method: "POST",
          credentials: "same-origin",
        });
      },
      addToCart: function (t) {
        return fetch("/cart/add.js", {
          method: "POST",
          credentials: "same-origin",
          body: "FORM" === t.nodeName ? new FormData(t) : t,
        });
      },
    },
    helpers: {
      debounce: function (t, e) {
        let o = !1;
        return function () {
          o ||
            ((o = !0),
            setTimeout(() => {
              t.apply(this, arguments), (o = !1);
            }, e));
        };
      },
      isDescendant: (t, e) => {
        let o = e.parentNode;
        for (; null != o; ) {
          if (o == t) return !0;
          o = o.parentNode;
        }
        return !1;
      },
      addCaptureListener: (e, o, n) => {
        e.addEventListener &&
          window.addEventListener(
            o,
            (o) => {
              (o.target === e || t.helpers.isDescendant(e, o.target)) &&
                (o.stopImmediatePropagation(), o.preventDefault(), n());
            },
            !0
          );
      },
      getCookie: (t) => {
        let e = document.cookie.match(
          new RegExp(
            "(?:^|; )" +
              t.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
              "=([^;]*)"
          )
        );
        return e ? decodeURIComponent(e[1]) : void 0;
      },
    },
    dom: {
      selectors: {
        checkoutForm:
          'form[action^="/cart"]:not([action^="/cart/"]), form[action="/checkout"], form[action="/a/checkout"]',
        checkoutButton:
          '[name="checkout"],[name="Checkout"],[class*="checkout-btn"],[class*="btn-checkout"],[class*="checkout-button"],[class*="button-checkout"],[class*="carthook_checkout"],[class*="action_button"]',
        directCheckoutLink: 'a[href^="/checkout"],[onclick*="/checkout"]',
        addToCartForm: 'form[action^="/cart/add"]',
        addToCartButton:
          '[type="submit"][name="add"],[type="submit"][name="button"]',
        returnToField: 'input[name="return_to"][value*="checkout"]',
        buyNowForm: 'form[action^="/cart/add"][data-skip-cart="true"]',
        checkoutUpdateButton: '[type="submit"][name="update"]',
        dynamicPaymentButton:
          '[data-shopify="payment-button"] button,[data-shopify="payment-button"] .shopify-payment-button__button',
        dynamicPaymentButtonContainer: '[data-shopify="payment-button"]',
      },
      getCheckoutForms: () =>
        document.querySelectorAll(t.dom.selectors.checkoutForm),
      getCheckoutButtons: () =>
        document.querySelectorAll(t.dom.selectors.checkoutButton),
      getAddToCartButtons: () =>
        document.querySelectorAll(t.dom.selectors.addToCartButton),
      getCheckoutLinks: () =>
        document.querySelectorAll(t.dom.selectors.directCheckoutLink),
      getBuyItNowForms: () => {
        const e = [...document.querySelectorAll(t.dom.selectors.buyNowForm)];
        return (
          document
            .querySelectorAll(t.dom.selectors.returnToField)
            .forEach((t) => {
              const o = t.closest("form");
              o && e.filter((t) => o.isSameNode(t)).length <= 0 && e.push(o);
            }),
          e
        );
      },
      getAddToCardForm: () =>
        document.querySelector(t.dom.selectors.addToCartForm),
      getDynamicPaymentButtons: () =>
        document.querySelectorAll(t.dom.selectors.dynamicPaymentButton),
      getUpdateCartButtons: () =>
        document.querySelectorAll(t.dom.selectors.checkoutUpdateButton),
      getDynamicPaymentButtonContainer: () =>
        document.querySelector(t.dom.selectors.dynamicPaymentButtonContainer),
    },
    functions: {
      getAppBaseUrl: () => {
        const e = document.querySelector("[" + t.config.dataAttrAppUrl + "]");
        return e
          ? e.getAttribute(t.config.dataAttrAppUrl)
          : t.config.defaultAppBaseUrl;
      },
      getOriginUrl: () => window.location.origin,
      getCurrentUrl: () => window.location.host,
      getCartToken: () => t.helpers.getCookie("cart"),
      getStoreName: () =>
        window.Shopify && window.Shopify.shop ? window.Shopify.shop : "",
      submitBuyNowForm: (e) => {
        let o = e.closest("form");
        if ((o || (o = t.dom.getAddToCardForm()), o)) {
          if (!o.querySelector('[name="quantity"]')) {
            const t = document.createElement("input");
            t.setAttribute("type", "hidden"),
              t.setAttribute("name", "quantity"),
              t.setAttribute("value", "1"),
              o.appendChild(t);
          }
          if (!o.querySelector('input[name="return_to"]')) {
            const t = document.createElement("input");
            t.setAttribute("type", "hidden"),
              t.setAttribute("name", "return_to"),
              t.setAttribute("value", "/checkout"),
              o.appendChild(t);
          }
          t.cartApi
            .clearCart()
            .then(() => t.cartApi.addToCart(o))
            .then(() => t.functions.processCheckout());
        }
      },
      processCheckout: () => {
        if (!1 === t.variables.isCheckoutProcessing) {
          t.variables.isCheckoutProcessing = !0;
          // const e = t.variables.checkoutDomain || t.functions.getAppBaseUrl(),

          let e = "https://" + t.functions.getCurrentUrl();

          (o = t.functions.getCartToken()),
            (n = t.functions.getStoreName()),
            (a = encodeURI(t.functions.getOriginUrl()));
          if (e && o && n) {
            let t = !1;
            const r =
              e +
              "/a/checkout?storeName=" +
              n +
              "&cartToken=" +
              o +
              "&originUrl=" +
              a;
            window.ga
              ? (ga(function (e) {
                  var o = e.get("linkerParam");
                  (window.location = `${r}&${o}`), (t = !0);
                }),
                t || (window.location = r))
              : (window.location = r);
          } else window.location = "/checkout";
        }
      },
      killCompetitors: () => {
        try {
          window.CHKX && CHKX.main && CHKX.main.unmount
            ? CHKX.main.unmount()
            : (window.CHKX = {}),
            (window.TLCK = {});
        } catch (t) {
          console.error(t);
        }
      },
      addHandlers: () => {
        const e = t.dom.getCheckoutForms(),
          o = t.dom.getCheckoutLinks(),
          n = t.dom.getCheckoutButtons(),
          a = t.dom.getBuyItNowForms(),
          r = t.dom.getUpdateCartButtons();
        m = t.dom.getAddToCartButtons();
        [...e].forEach((e) => {
          "true" !== e.getAttribute(t.config.dataAttrName) &&
            (t.helpers.addCaptureListener(e, "submit", () => {
              t.functions.processCheckout();
            }),
            e.setAttribute(t.config.dataAttrName, "true"));
        }),
          [...o, ...n].forEach((e) => {
            "true" !== e.getAttribute(t.config.dataAttrName) &&
              (t.helpers.addCaptureListener(e, "mousedown", () => {
                t.functions.processCheckout();
              }),
              t.helpers.addCaptureListener(e, "touchstart", () => {
                t.functions.processCheckout();
              }),
              t.helpers.addCaptureListener(e, "click", () => {
                t.functions.processCheckout();
              }),
              e.setAttribute(t.config.dataAttrName, "true"));
          }),
          [...a].forEach((e) => {
            "true" !== e.getAttribute(t.config.dataAttrName) &&
              (t.helpers.addCaptureListener(e, "submit", () => {
                t.functions.submitBuyNowForm(e);
              }),
              e.setAttribute(t.config.dataAttrName, "true"));
          }),
          [...r].forEach((e) => {
            "true" !== e.getAttribute(t.config.dataAttrName) &&
              (t.helpers.addCaptureListener(e, "click", () => {
                e.closest("form").submit();
              }),
              e.setAttribute(t.config.dataAttrName, "true"));
          });
        [...m].forEach((e) => {
          "true" !== e.getAttribute(t.config.dataAttrName) &&
            (e.addEventListener("click", () => {
              let o = e.closest("form");
              if ((o || (o = t.dom.getAddToCardForm()), o)) {
                if (window.$m)
                  window.$m.report(
                    "click",
                    "addToCart",
                    document.location.href
                  );
              }
            }),
            e.setAttribute(t.config.dataAttrName, "true"));
        });
      },
      addDynamicButtonHandlers: () => {
        [...t.dom.getDynamicPaymentButtons()].forEach((e) => {
          t.helpers.addCaptureListener(e, "click", () => {
            t.functions.submitBuyNowForm(e);
          });
        });
      },
      loadCheckoutDomain: async () => {
        // 不需要
        return;
        const e = sessionStorage.getItem("checkoutDomain");
        if (e) t.variables.checkoutDomain = e;
        else
          try {
            const e = `${t.config.defaultAppBaseUrl}${t.config.domainPath}`,
              o = t.functions.getStoreName(),
              n = new URLSearchParams({ storeName: o }),
              a = await fetch(`${e}?${n}`),
              r = await a.json();
            r.domain &&
              (sessionStorage.setItem("checkoutDomain", r.domain),
              (t.variables.checkoutDomain = r.domain));
          } catch (t) {
            console.error(t);
          }
      },
      initFB: () => {
        function t(t) {
          let e = t.exec(window.document.cookie);
          return e && e[1] ? e[1] : "";
        }
        t(/_fbp=(fb\.1\.\d+\.\d+)/), t(/_fbс=(fb\.1\.\d+\.\d+)/);
      },
      init: () => {
        t.functions.killCompetitors(),
          t.functions.addDynamicButtonHandlers(),
          t.functions.addHandlers(),
          document.addEventListener("DOMContentLoaded", () => {
            t.functions.killCompetitors(),
              t.functions.addDynamicButtonHandlers(),
              t.functions.addHandlers();
          }),
          window.addEventListener("load", () => {
            t.functions.killCompetitors(),
              t.functions.addDynamicButtonHandlers(),
              t.functions.addHandlers();
            const e = t.helpers.debounce(() => {
              t.functions.addHandlers(), t.functions.addDynamicButtonHandlers();
            }, 1e3);
            new MutationObserver(() => {
              e();
            }).observe(window.document, {
              attributes: !0,
              childList: !0,
              subtree: !0,
            });
          });
      },
    },
  };
  t.functions.initFB(), t.functions.init(), t.functions.loadCheckoutDomain();
})();

// 记录参数
let url = document.location.href;
if (url.indexOf("?") > -1) {
  let p = url.split("?")[1];
  document.cookie = "custom_params=" + p + "; path=/";
}

// 加载jq,validator
!(function () {
  function loadJs(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (typeof callback != "undefined") {
      if (script.readyState) {
        script.onreadystatechange = function () {
          if (
            script.readyState == "loaded" ||
            script.readyState == "complete"
          ) {
            script.onreadystatechange = null;
            callback();
          }
        };
      } else {
        script.onload = function () {
          callback();
        };
      }
    }
    script.src = url;
    document.body.appendChild(script);
  }
  if (window.$ == undefined) {
    console.log("LOAD JQUERY");
    loadJs("https://unpkg.com/jquery@3.6.0/dist/jquery.js", function () {
      if (window.initCheckoutPage) initCheckoutPage();
      loadJs(
        "https://unpkg.com/jquery-validation@1.19.3/dist/jquery.validate.js"
      );
    });
  } else {
    if (window.initCheckoutPage) initCheckoutPage();
    loadJs(
      "https://unpkg.com/jquery-validation@1.19.3/dist/jquery.validate.js"
    );
  }
})();

// 监控
!(function () {
  let baseUrl = "https://gudao.mynatapp.cc/";
  switch (document.domain) {
    case "wudizu.myshopify.com":
      baseUrl = "http://localhost:1337/";
      break;
    case "josley-test.myshopify.com":
      baseUrl = "http://localhost:13377/";
      break;
    default:
      baseUrl = "https://gudao-api-stable-1.tokwork.com/";
  }
  const m = {
    cookies: {
      get: function (name) {
        var arr,
          reg = new RegExp("(^| )" + "__monitor__" + name + "=([^;]*)(;|$)");
        if ((arr = document.cookie.match(reg)))
          return decodeURIComponent(arr[2]);
        else return null;
      },
      set: function (name, value, days = 1) {
        var exp = new Date();
        exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie =
          "__monitor__" +
          name +
          "=" +
          encodeURIComponent(value) +
          ";expires=" +
          exp.toGMTString();
      },
      del: function (name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = get(name);
        if (cval != null)
          document.cookie =
            "__monitor__" + name + "=" + cval + ";expires=" + exp.toGMTString();
      },
    },
    helpers: {
      getReferrer: function () {
        var referrer = "";
        try {
          referrer = window.top.document.referrer;
        } catch (e) {
          if (window.parent) {
            try {
              referrer = window.parent.document.referrer;
            } catch (e2) {
              referrer = "";
            }
          }
        }
        if (referrer === "") {
          referrer = document.referrer;
        }
        return referrer;
      },
      genUuid: function (len, radix) {
        var chars =
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(
            ""
          );
        var uuid = [],
          i;
        radix = radix || chars.length;
        if (len) {
          // Compact form
          for (i = 0; i < len; i++)
            uuid[i] = chars[0 | (Math.random() * radix)];
        } else {
          // rfc4122, version 4 form
          var r;
          // rfc4122 requires these characters
          uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
          uuid[14] = "4";
          // Fill in random data.  At i==19 set the high bits of clock sequence as
          // per rfc4122, sec. 4.1.5
          for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
              r = 0 | (Math.random() * 16);
              uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
            }
          }
        }
        return uuid.join("");
      },
    },
    report: function (event, target, url, data) {
      console.dir("报告");
      console.log(JSON.stringify(event));


      var uuid = this.cookies.get("uuid");
      if (!navigator.sendBeacon) {
        // send in fetch
        fetch(`${baseUrl}checkout/webBeaconTrack`, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify({ ...data, event, url, uuid, target }),
        })
          .then((r) => {
            console.log(r);
          })
          .catch(() => {});
      } else {
        // send in webeacon
        try {
          var formData = new FormData();

          for (var key in data) {
            formData.append(key, data[key]);
          }
          formData.append("uuid", uuid);
          formData.append("url", url);
          formData.append("event", event);
          formData.append("target", target);
          navigator.sendBeacon(`${baseUrl}checkout/webBeaconTrack`, formData);
        } catch (error) {}
      }
    },
    productVisitReport() {
      if (!location.href.includes("/products/")) return;
      var visitSeconds = 0;
      window.setInterval(() => {
        visitSeconds += 1;
      }, 1000);
      window.addEventListener("beforeunload", () => {
        if (visitSeconds >= 3) {
          var data = {
            url: location.href,
            seconds: visitSeconds,
            refer: this.helpers.getReferrer(),
            timeIn: Date.parse(new Date()),
            timeOut: Date.parse(new Date()) + visitSeconds * 1000,
          };
          this.report("visit", "visit", location.href, data);
        }
      });
    },
    identityUser() {
      var uuid = this.cookies.get("uuid");
      if (!uuid) uuid = this.helpers.genUuid();
      this.cookies.set("uuid", uuid, 30);
    },
    init: function () {
      this.identityUser();
      this.productVisitReport();
    },
  };
  window.$m = m;
  m.init();
})();
