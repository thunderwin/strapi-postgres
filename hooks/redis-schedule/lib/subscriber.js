const Redis = require("ioredis");
const { locker, del } = require("./saver");

const port = process.env.REDIS_PORT || '6379';
const host = process.env.REDIS_HOST || '127.0.0.1';
const client = new Redis(port, host);

const CHANNEL = `__keyevent@0__:expired`;
client.on("ready", () => {
  client.subscribe(CHANNEL);
  console.log(`Redis channel ${CHANNEL} subscribed`);
});

module.exports = (prefix, callback) => {
  if (!prefix) prefix = "__expiredKey__";
  client.on("message", async (channel, key) => {
    if (!key.startsWith(prefix) || channel !== CHANNEL) return;
    const lock = await locker(key);
    if (lock) {
      await del(lock);
      try {
        const content = key.split(prefix)[1].split(":");
        if (callback) {
          if (content.length === 2) {
            const res = {
              orderId: content[0],
              templateId: content[1],
            };
            callback(res);
          } else {
            console.log(`invalid key => ${key}`);
          }
        }
      } catch (error) {
        console.log(`invalid key => ${key}`);
      }
    }
  });
};
