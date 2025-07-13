// const redis = require('redis');

// class CacheService {
//   constructor() {
//     this.client = null;
//     this.isConnected = false;
//   }

//   /**
//    * Initialize Redis connection
//    */
//   async connect() {
//     try {
//       // Force the Redis host to be the Docker service name
//       const redisHost = process.env.REDIS_HOST || 'redis';
//       const redisPort = parseInt(process.env.REDIS_PORT) || 6379;
      
//       const redisConfig = {
//         host: redisHost,
//         port: redisPort,
//         password: process.env.REDIS_PASSWORD,
//         retry_strategy: (options) => {
//           console.log('Redis retry attempt:', options.attempt, 'error:', options.error?.code);
          
//           if (options.error && options.error.code === 'ECONNREFUSED') {
//             console.log('Redis server refused connection - stopping retries');
//             return new Error('Redis server refused connection');
//           }
//           if (options.total_retry_time > 1000 * 60 * 60) {
//             return new Error('Retry time exhausted');
//           }
//           if (options.attempt > 5) {
//             console.log('Max retry attempts reached - stopping');
//             return undefined;
//           }
//           return Math.min(options.attempt * 100, 3000);
//         }
//       };

//       console.log('Connecting to Redis with config:', {
//         host: redisConfig.host,
//         port: redisConfig.port,
//         env_host: process.env.REDIS_HOST,
//         env_port: process.env.REDIS_PORT
//       });

//       this.client = redis.createClient(redisConfig);

//       this.client.on('connect', () => {
//         this.isConnected = true;
//       });

//       this.client.on('error', (err) => {
//         console.error('Redis Client Error:', err);
//         this.isConnected = false;
        
//         // Don't retry if it's a connection refused error
//         if (err.code === 'ECONNREFUSED') {
//           console.log('Redis connection refused - will not retry');
//           return;
//         }
//       });

//       this.client.on('end', () => {
//         console.log('Redis connection ended');
//         this.isConnected = false;
//       });

//       await this.client.connect();
//     } catch (error) {
//       console.error('Failed to connect to Redis:', error);
//       this.isConnected = false;
//     }
//   }

//   /**
//    * Set cache with expiration
//    * @param {string} key - Cache key
//    * @param {any} value - Value to cache
//    * @param {number} ttl - Time to live in seconds
//    */
//   async set(key, value, ttl = 3600) {
//     try {
//       if (!this.isConnected) {
//         console.warn('Redis not connected, skipping cache set');
//         return;
//       }
      
//       const serializedValue = JSON.stringify(value);
//       await this.client.setEx(key, ttl, serializedValue);
//       console.log(`Cached key: ${key} with TTL: ${ttl}s`);
//     } catch (error) {
//       console.error('Error setting cache:', error);
//     }
//   }

//   /**
//    * Get value from cache
//    * @param {string} key - Cache key
//    * @returns {any} Cached value or null
//    */
//   async get(key) {
//     try {
//       if (!this.isConnected) {
//         console.warn('Redis not connected, skipping cache get');
//         return null;
//       }

//       const value = await this.client.get(key);
//       if (value) {
//         console.log(`Cache hit for key: ${key}`);
//         return JSON.parse(value);
//       }
      
//       console.log(`Cache miss for key: ${key}`);
//       return null;
//     } catch (error) {
//       console.error('Error getting from cache:', error);
//       return null;
//     }
//   }

//   /**
//    * Delete cache key
//    * @param {string} key - Cache key
//    */
//   async del(key) {
//     try {
//       if (!this.isConnected) {
//         console.warn('Redis not connected, skipping cache delete');
//         return;
//       }

//       await this.client.del(key);
//       console.log(`Deleted cache key: ${key}`);
//     } catch (error) {
//       console.error('Error deleting cache:', error);
//     }
//   }

//   /**
//    * Clear all cache
//    */
//   async clear() {
//     try {
//       if (!this.isConnected) {
//         console.warn('Redis not connected, skipping cache clear');
//         return;
//       }

//       await this.client.flushAll();
//       console.log('Cache cleared');
//     } catch (error) {
//       console.error('Error clearing cache:', error);
//     }
//   }

//   /**
//    * Close Redis connection
//    */
//   async disconnect() {
//     try {
//       if (this.client) {
//         await this.client.quit();
//         this.isConnected = false;
//         console.log('Redis connection closed');
//       }
//     } catch (error) {
//       console.error('Error disconnecting from Redis:', error);
//     }
//   }
// }

// // Create singleton instance
// const cacheService = new CacheService();

// module.exports = cacheService; 

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