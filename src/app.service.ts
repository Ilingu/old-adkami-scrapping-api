import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';
import { AdkamiNewEpisodeShape, CachedDOMShape } from './Interfaces/interfaces';
// WebScrap
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

@Injectable()
export class AppService {
  private logger = new Logger('AppService');
  constructor(private cacheService: CacheService) {}

  async handleNewRequest(): Promise<AdkamiNewEpisodeShape[]> {
    const CachedDOMObject = await this.cacheService.getCache('CachedDOMObject');
    if (CachedDOMObject && CachedDOMObject?.lastRefresh > Date.now()) {
      this.logger.warn('Data are up to date, return cached version');
      return CachedDOMObject?.DOMObject || null;
    }
    this.logger.warn('Old Cached Data, recreate new Data');

    const NewDom = this.queryNewData();
    if (!NewDom) return null;

    return NewDom as unknown as AdkamiNewEpisodeShape[];
  }

  async queryNewData(): Promise<AdkamiNewEpisodeShape[] | false> {
    try {
      const ADKamiURL = 'https://www.adkami.com';
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(ADKamiURL);
      const content = await page.content();

      const $ = cheerio.load(content);
      const ReleasedAnimeDiv = $('.video-item-list') || null;
      if (!ReleasedAnimeDiv) return false;

      const DOMObject: AdkamiNewEpisodeShape[] = Array.from(
        ReleasedAnimeDiv.map((_, elem): AdkamiNewEpisodeShape => {
          // Parents
          const ImgParent = $(elem).find('.img');
          const TopParent = $(elem).find('.top');
          const InfoParent = $(elem).find('.info');

          // Data
          const title = TopParent.children('a').children('.title').text();
          const Img = ImgParent.children('img').attr('data-original');
          const episodeId = TopParent.children('.episode').text();
          const Team = TopParent.children('.team.editeur').text();
          const TimeReleased = InfoParent.children('.date').text();

          return {
            title,
            Img,
            episodeId,
            Team,
            TimeReleased,
          };
        }),
      );

      const CachableDOMObejct: CachedDOMShape = {
        lastRefresh: Date.now() + 3600000,
        DOMObject,
      };

      await browser.close();
      await this.cacheService.setNewCache('CachedDOMObject', CachableDOMObejct);

      this.logger.log('New Data created and cached');
      return DOMObject;
    } catch (err) {
      this.logger.error(`Failed To Cache New ADKami data`, err.stack);
      return false;
    }
  }
}
