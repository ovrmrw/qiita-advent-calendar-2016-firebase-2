import { QiitaAdventCalendar2016Firebase2Page } from './app.po';

describe('qiita-advent-calendar-2016-firebase-2 App', function() {
  let page: QiitaAdventCalendar2016Firebase2Page;

  beforeEach(() => {
    page = new QiitaAdventCalendar2016Firebase2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
