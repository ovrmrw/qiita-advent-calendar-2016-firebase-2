import { browser, element, by } from 'protractor';

export class QiitaAdventCalendar2016Firebase2Page {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }
}
