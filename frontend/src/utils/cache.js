import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'gb_cache_';

/**
 * Save data to cache
 * @param {string} key 
 * @param {any} data 
 */
export const saveToCache = async (key, data) => {
  try {
    const cacheData = {
      timestamp: Date.now(),
      data: data
    };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Cache save error:', error);
  }
};

/**
 * Get data from cache
 * @param {string} key 
 * @returns {any|null}
 */
export const getFromCache = async (key) => {
  try {
    const value = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (value !== null) {
      const cacheData = JSON.parse(value);
      return cacheData.data;
    }
    return null;
  } catch (error) {
    console.warn('Cache get error:', error);
    return null;
  }
};

/**
 * Clear specific cache or all app cache
 * @param {string} [key] 
 */
export const clearCache = async (key) => {
  try {
    if (key) {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
    } else {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.warn('Cache clear error:', error);
  }
};
