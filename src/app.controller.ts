import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { AdkamiNewEpisodeShape } from './Interfaces/interfaces';

@Controller()
export class AppController {
  private logger = new Logger('AppController');
  constructor(private readonly appService: AppService) {}

  @Get('/last')
  getLastest(): Promise<AdkamiNewEpisodeShape[]> {
    return this.appService.handleNewRequest();
  }
}
