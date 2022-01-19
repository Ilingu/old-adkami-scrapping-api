/* eslint-disable prettier/prettier */
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AdkamiNewEpisodeShape, CachedDOMShape } from './Interfaces/interfaces';

@Injectable()
export class CacheService {
  private logger = new Logger('CacheService');
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getCache(key: string): Promise<CachedDOMShape> {
    const DOMObejct: string = await this.cacheManager.get(key);
    return JSON.parse(DOMObejct || null);
  }

  async setNewCache(
    key: string,
    value: AdkamiNewEpisodeShape[],
  ): Promise<string> {
    return this.cacheManager.set(key, JSON.stringify(value));
  }
}
