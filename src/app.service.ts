import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';
import { AdkamiNewEpisodeShape, CachedDOMShape } from './Interfaces/interfaces';
// WebScrap
import { HttpService } from '@nestjs/axios';
import * as jsdom from 'jsdom';
import { firstValueFrom } from 'rxjs';

const { JSDOM } = jsdom;

@Injectable()
export class AppService {
  private logger = new Logger('AppService', { timestamp: true });
  constructor(private cacheService: CacheService, private axios: HttpService) {}

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
      const HtmlDocRes = await firstValueFrom(
        this.axios.get('https://www.adkami.com/'),
      );
      const DOM = new JSDOM(HtmlDocRes.data);
      const ReleasedAnimeDiv =
        DOM.window.document.querySelectorAll('.video-item-list') || null;
      if (!ReleasedAnimeDiv) return false;
      const DOMObject: AdkamiNewEpisodeShape[] = Array.from(
        ReleasedAnimeDiv,
      ).map((animeEp): AdkamiNewEpisodeShape => {
        // Parent
        const Children = Array.from(animeEp?.children);
        const ImgParent = Children.find(
          (child) => child?.classList[0] === 'img',
        );
        const TopParent = Children.find(
          (child) => child?.classList[0] === 'top',
        );
        const InfoParent = Children.find(
          (child) => child?.classList[0] === 'info',
        );

        // Data
        const title = Array.from(TopParent.children).find(
          (TopChild) => TopChild?.tagName === 'A',
        )?.children[0]?.textContent;
        const Img = Array.from(ImgParent.children)
          .find((ImgChild) => ImgChild?.tagName === 'IMG')
          ?.getAttribute('data-original');
        const EpInfo = Array.from(TopParent.children).find(
          (TopChild) => TopChild?.classList[0] === 'episode',
        );
        const episodeId = EpInfo?.textContent;
        const Team = EpInfo?.children[0]?.textContent;
        const TimeReleased = Array.from(InfoParent.children).find(
          (InfoChild) => InfoChild?.classList[0] === 'date',
        )?.textContent;

        return {
          title,
          Img,
          episodeId,
          Team,
          TimeReleased,
        };
      });

      const CachableDOMObejct: CachedDOMShape = {
        lastRefresh: Date.now() + 3600000,
        DOMObject,
      };
      await this.cacheService.setNewCache('CachedDOMObject', CachableDOMObejct);
      this.logger.log('New Data created and cached');
      return DOMObject;
    } catch (err) {
      this.logger.error(`Failed To Cache New ADKami data`, err.stack);
      return false;
    }
  }
}
