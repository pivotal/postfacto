/*
 * Postfacto, a free, open-source and self-hosted retro tool aimed at helping
 * remote teams.
 *
 * Copyright (C) 2016 - Present Pivotal Software, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 *
 * it under the terms of the GNU Affero General Public License as
 *
 * published by the Free Software Foundation, either version 3 of the
 *
 * License, or (at your option) any later version.
 *
 *
 *
 * This program is distributed in the hope that it will be useful,
 *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *
 * GNU Affero General Public License for more details.
 *
 *
 *
 * You should have received a copy of the GNU Affero General Public License
 *
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import fetchJson from './fetch_helper';
import {SpyDispatcher} from '../spec_helper';

describe('fetchJson', () => {
  describe('errors', () => {
    beforeEach(() => {
      spyOn(window, 'fetch').and.callFake(() => Promise.reject(new Error('some error')));
    });

    it('returns empty array', async () => {
      const results = await fetchJson('http://example.com/some-url');
      expect(results).toEqual([]);
    });

    it('dispatches apiServerNotFound', async () => {
      await fetchJson('http://example.com/some-url');
      expect(SpyDispatcher).toHaveReceived('apiServerNotFound');
    });
  });

  describe('HTTP 204 no content', () => {
    beforeEach(() => {
      spyOn(window, 'fetch').and.returnValue(Promise.resolve({status: 204, json: () => Promise.resolve('')}));
    });

    it('returns the status code and empty response string', async () => {
      const results = await fetchJson('http://example.com/some-url');
      expect(results).toEqual([204, '']);
    });

    it('does not dispatch apiServerNotFound', async () => {
      await fetchJson('http://example.com/some-url');
      expect(SpyDispatcher).not.toHaveReceived('apiServerNotFound');
    });
  });
});
