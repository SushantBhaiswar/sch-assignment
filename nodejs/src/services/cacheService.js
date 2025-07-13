const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Use REDIS_URL if set, otherwise default to Docker service name
      const url = process.env.REDIS_URL || 'redis://redis:6379';
      this.client = redis.createClient({ url });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      await this.client.connect();
      this.isConnected = true;
      console.log('Redis connected successfully');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  async set(key, value, ttl = 3600) {
    if (!this.isConnected) return;
    await this.client.setEx(key, ttl, JSON.stringify(value));
  }

  async get(key) {
    if (!this.isConnected) return null;
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key) {
    if (!this.isConnected) return;
    await this.client.del(key);
  }

  async clear() {
    if (!this.isConnected) return;
    await this.client.flushAll();
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

module.exports = new CacheService();