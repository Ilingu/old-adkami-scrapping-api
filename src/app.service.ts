import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';
import { AdkamiNewEpisodeShape } from './Interfaces/interfaces';

@Injectable()
export class AppService {
  private logger = new Logger('AppService');
  constructor(private cacheService: CacheService) {}

  async handleNewRequest(): Promise<AdkamiNewEpisodeShape[]> {
    // await this.cacheService.setNewCache('someKey', 'yo');
    const CachedData = await this.cacheService.getCache('someKey');
    if (CachedData) return JSON.parse(CachedData);

    return null;
  }

  async queryNewData() {
    // fetch adkami
    // jsdom
    // queryall
  }
}
