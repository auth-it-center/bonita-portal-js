/** Copyright (C) 2015 Bonitasoft S.A.
 * BonitaSoft, 31 rue Gustave Eiffel - 38000 Grenoble
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2.0 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
  'use strict';
  describe('case admin tabs', function () {

    var activeCaseTab,
      archivedCaseTab;

    beforeEach(function () {
      browser.get('#/admin/cases/list');
      activeCaseTab = element(by.xpath('//li[a/@id="TabActiveCases"]'));
      archivedCaseTab = element(by.xpath('//li[a/@id="TabArchivedCases"]'));
    });

    afterEach(function () {
      browser.executeScript('window.sessionStorage.clear();');
      browser.executeScript('window.localStorage.clear();');
    });

    it('should navigate between tabs', function(){
      expect(activeCaseTab.getAttribute('class')).toContain('active');
      expect(archivedCaseTab.getAttribute('class')).not.toContain('active');
      browser.setLocation('/admin/cases/list/archived');
      expect(activeCaseTab.getAttribute('class')).not.toContain('active');
      expect(archivedCaseTab.getAttribute('class')).toContain('active');
      browser.setLocation('/admin/cases/list/archived');
      expect(activeCaseTab.getAttribute('class')).not.toContain('active');
      expect(archivedCaseTab.getAttribute('class')).toContain('active');
      browser.setLocation('/admin/cases/list');
      expect(activeCaseTab.getAttribute('class')).toContain('active');
      expect(archivedCaseTab.getAttribute('class')).not.toContain('active');

    });
  });
})();
