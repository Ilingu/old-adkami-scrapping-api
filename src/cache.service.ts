/* eslint-disable prettier/prettier */
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AdkamiNewEpisodeShape } from './Interfaces/interfaces';

@Injectable()
export class CacheService {
  private logger = new Logger('CacheService');
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getCache(key: string): Promise<string> {
    return this.cacheManager.get(key);
  }

  async setNewCache(
    key: string,
    value: AdkamiNewEpisodeShape,
  ): Promise<string> {
    return this.cacheManager.set(key, JSON.stringify(value));
  }
}
