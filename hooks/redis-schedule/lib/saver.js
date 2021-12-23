const Redis = require("ioredis");
const dayjs = require("dayjs");

const port = process.env.REDIS_PORT || '6379';
const host = process.env.REDIS_HOST || '127.0.0.1';
const client = new Redis(port, host);

client.on("ready", () => {
  client.config("SET", "notify-keyspace-events", "Ex");
  console.log("Redis saver client inited");
});

exports.schedule = (
  { orderId, templateId, relativeTime = 0 } = {},
  prefix = "__expiredKey__"
) => {
  return new Promise(async (resolve, reject) => {

    if (!orderId || !templateId || !relativeTime) {
      reject("invalid parameters");
      return;
    }
    const key = `${prefix}${orderId}:${templateId}`;
    const expireSeconds = relativeTime * 60;
    const fireAt = dayjs().add(expireSeconds, "second");
    const result = await client.set(
      key,
      `scheduled job: order ${orderId} email event will be fired at ${fireAt}`,
      "EX",
      expireSeconds
      );
      resolve(result);
    })
};

exports.set = (key, value, mode, time) => client.set(key, value, mode, time);

exports.del = (key) => client.del(key);

exports.locker = async (key) => {
  const lockKey = `__lock-${key}`;
  const lock = await client.set(lockKey, 2, "ex", 5, "nx");
  return lock === "OK" ? lockKey : "";
};
