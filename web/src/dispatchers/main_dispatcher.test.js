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

import '../spec_helper';
import mainDispatcher from './main_dispatcher';

describe('MainDispatcher', () => {
  let retro;
  let dispatcher;
  let reduxActions;
  let routerActionDispatcher;
  let analyticsActionDispatcher;

  beforeEach(() => {
    reduxActions = {
      clearErrors: jest.fn(),
      errorsUpdated: jest.fn(),
      currentRetroUpdated: jest.fn(),
      currentRetroItemUpdated: jest.fn(),
      updateWebsocketSession: jest.fn(),
      currentRetroActionItemDeleted: jest.fn(),
      updateFeatureFlags: jest.fn(),
      setNotFound: jest.fn(),
      clearDialog: jest.fn(),
      showDialog: jest.fn(),
      showAlert: jest.fn(),
      clearAlert: jest.fn(),
      updateRetroArchives: jest.fn(),
      updateCurrentArchivedRetro: jest.fn(),
      currentRetroActionItemUpdated: jest.fn(),
      currentRetroSendArchiveEmailUpdated: jest.fn(),
      currentRetroHighlightCleared: jest.fn(),
      currentRetroItemDeleted: jest.fn(),
      currentRetroItemDoneUpdated: jest.fn(),
    };
    routerActionDispatcher = {
      newRetro: jest.fn(),
      showRetro: jest.fn(),
      home: jest.fn(),
      retroLogin: jest.fn(),
      retroRelogin: jest.fn(),
      showRetroForId: jest.fn(),
      retroArchives: jest.fn(),
      retroArchive: jest.fn(),
      retroSettings: jest.fn(),
      retroPasswordSettings: jest.fn(),
      registration: jest.fn(),
    };
    analyticsActionDispatcher = {
      archivedRetro: jest.fn(),
      createdRetro: jest.fn(),
      createdRetroItem: jest.fn(),
      visitedRetro: jest.fn(),
      doneActionItem: jest.fn(),
      undoneActionItem: jest.fn(),
    };
    dispatcher = mainDispatcher(reduxActions, routerActionDispatcher, analyticsActionDispatcher);
    dispatcher.dispatch = jest.fn();

    retro = {
      id: 1,
      name: 'retro name',
      slug: 'retro-name',
      items: [
        {
          id: 2,
          description: 'item 1',
          category: 'happy',
          vote_count: 1,
          done: false,
        },
        {
          id: 3,
          description: 'item 3',
          category: 'happy',
          vote_count: 2,
          done: true,
        },
      ],
      action_items: [
        {
          id: 1,
          description: 'action item 1',
          done: false,
        },
        {
          id: 2,
          description: 'action item 2',
          done: true,
        },
      ],
    };
  });

  describe('setRoute', () => {
    it('calls the router navigate', () => {
      dispatcher.redirectToHome();

      expect(routerActionDispatcher.home).toHaveBeenCalled();
    });
  });

  describe('retroSuccessfullyCreated', () => {
    beforeEach(() => {
      dispatcher.retroSuccessfullyCreated({data: {retro}});
    });

    it('redirects to the new retro page', () => {
      expect(routerActionDispatcher.showRetro).toHaveBeenCalledWith(retro);
    });

    it('dispatches created retro analytic', () => {
      expect(analyticsActionDispatcher.createdRetro).toHaveBeenCalledWith(retro.id);
    });

    it('empties the error messages', () => {
      expect(reduxActions.clearErrors).toHaveBeenCalled();
    });
  });

  describe('retroUnsuccessfullyCreated', () => {
    it('updates the error messages', () => {
      dispatcher.retroUnsuccessfullyCreated({
        data: {
          errors: ['Sorry! That URL is already taken.'],
        },
      });

      expect(reduxActions.errorsUpdated).toHaveBeenCalledWith(['Sorry! That URL is already taken.']);
    });
  });

  describe('retroSuccessfullyFetched', () => {
    it('updates the retro', () => {
      dispatcher.retroSuccessfullyFetched({data: {retro: {name: 'The Retro Name', id: 2}}});

      expect(reduxActions.currentRetroUpdated).toHaveBeenCalledWith({name: 'The Retro Name', id: 2});
    });

    it('dispatches visited retro analytic', () => {
      dispatcher.retroSuccessfullyFetched({data: {retro: {name: 'The Retro Name', id: 2}}});

      expect(analyticsActionDispatcher.visitedRetro).toHaveBeenCalledWith(2);
    });
  });

  describe('getRetroSettingsSuccessfullyReceived', () => {
    it('updates the retro', () => {
      const updatedRetro = {name: 'The Retro Name', slug: 'the-retro-123'};
      dispatcher.getRetroSettingsSuccessfullyReceived({data: {retro: updatedRetro}});

      expect(reduxActions.currentRetroUpdated).toHaveBeenCalledWith(updatedRetro);
    });
  });

  describe('getRetroLoginSuccessfullyReceived', () => {
    it('updates the retro name', () => {
      dispatcher.getRetroLoginSuccessfullyReceived({data: {retro: {name: 'The Retro Name'}}});
      expect(reduxActions.currentRetroUpdated).toHaveBeenCalledWith({name: 'The Retro Name'});
    });
  });

  describe('retroSettingsSuccessfullyUpdated', () => {
    const settingUpdatedRetro = {
      name: 'new retro name',
      slug: 'new-retro-slug',
    };
    beforeEach(() => {
      dispatcher.retroSettingsSuccessfullyUpdated({
        data: {
          retro: settingUpdatedRetro,
        },
      });
    });

    it('updates the retro slug and name, and clears the error message', () => {
      expect(reduxActions.currentRetroUpdated).toHaveBeenCalledWith({
        name: 'new retro name',
        slug: 'new-retro-slug',
      });

      expect(reduxActions.currentRetroUpdated).toHaveBeenCalled();
    });

    it('redirects to the retro page url with the new slug', () => {
      expect(routerActionDispatcher.showRetro).toHaveBeenCalledWith(settingUpdatedRetro);
    });
  });

  describe('retroSettingsUnsuccessfullyUpdated', () => {
    beforeEach(() => {
      dispatcher.retroSettingsUnsuccessfullyUpdated({
        data: {
          errors: ['Sorry! That URL is already taken.'],
        },
      });
    });

    it('updates the error messages', () => {
      expect(reduxActions.errorsUpdated).toHaveBeenCalledWith(['Sorry! That URL is already taken.']);
    });
  });

  describe('requireRetroLogin', () => {
    it('dispatches a set Route', () => {
      dispatcher.requireRetroLogin({data: {retro_id: 1}});
      expect(routerActionDispatcher.retroLogin).toHaveBeenCalledWith(1);
    });
  });

  describe('requireRetroRelogin', () => {
    it('dispatches a set Route', () => {
      const r = {slug: 'retro-slug-1'};
      dispatcher.requireRetroRelogin({data: {retro: r}});
      expect(routerActionDispatcher.retroRelogin).toHaveBeenCalledWith(r);
    });
  });

  describe('redirectToRetroCreatePage', () => {
    it('dispatches a set Route to new retro page', () => {
      dispatcher.redirectToRetroCreatePage({});
      expect(routerActionDispatcher.newRetro).toHaveBeenCalled();
    });
  });

  describe('retroSuccessfullyLoggedIn', () => {
    it('dispatches a set Route', () => {
      dispatcher.retroSuccessfullyLoggedIn({data: {retro_id: 1}});
      expect(routerActionDispatcher.showRetroForId).toHaveBeenCalledWith(1);
    });
  });

  describe('retroItemSuccessfullyCreated', () => {
    beforeEach(() => {
      dispatcher.retroItemSuccessfullyCreated({
        data: {
          item: {id: 10, category: 'happy'},
          retroId: retro.id,
        },
      });
    });

    it('creates the retro item', () => {
      expect(reduxActions.currentRetroItemUpdated).toHaveBeenCalledWith({id: 10, category: 'happy'});
    });

    it('dispatches created retro item analytic', () => {
      expect(analyticsActionDispatcher.createdRetroItem).toHaveBeenCalledWith(retro.id, 'happy');
    });
  });

  describe('retroItemSuccessfullyDeleted', () => {
    it('deletes the retro item', () => {
      dispatcher.retroItemSuccessfullyDeleted({data: {retro_id: 1, item: retro.items[0]}});

      expect(reduxActions.currentRetroItemDeleted).toHaveBeenCalledWith(retro.items[0]);
    });
  });

  describe('retroItemSuccessfullyVoted', () => {
    it('updates the vote count on the retro item', () => {
      const itemFromApiResponse = {
        id: 1,
        vote_count: 50,
        updated_at: '2016-10-04T23:19:05.269Z',
      };

      dispatcher.retroItemSuccessfullyVoted({data: {retro_id: 1, item: itemFromApiResponse}});
      expect(reduxActions.currentRetroItemUpdated).toHaveBeenCalledWith(itemFromApiResponse);
    });
  });

  describe('retroItemSuccessfullyDone', () => {
    it('fires retroItemDoneUpdated with true', () => {
      dispatcher.retroItemSuccessfullyDone({data: {retroId: 1, itemId: 2}});
      expect(reduxActions.currentRetroItemDoneUpdated).toHaveBeenCalledWith(2, true);
    });
  });

  describe('retroItemSuccessfullyUndone', () => {
    let item;

    beforeEach(() => {
      item = {id: 2, done: false};
      dispatcher.retroItemSuccessfullyUndone({data: {retroId: 1, item}});
    });


    it('updates the item to have attribute done = false', () => {
      item.done = false;
      retro.highlighted_item_id = null;
      expect(reduxActions.currentRetroItemDoneUpdated).toHaveBeenCalledWith(2, false);
    });
  });

  describe('retroItemSuccessfullyHighlighted', () => {
    it('updates retro in redux', () => {
      dispatcher.retroItemSuccessfullyHighlighted({data: {retro}});

      expect(reduxActions.currentRetroUpdated).toHaveBeenCalledWith(retro);
    });
  });

  describe('retroItemSuccessfullyUnhighlighted', () => {
    it('updates retro in redux', () => {
      dispatcher.retroItemSuccessfullyUnhighlighted({data: {retro}});

      expect(reduxActions.currentRetroHighlightCleared).toHaveBeenCalled();
    });
  });

  describe('toggleSendArchiveEmail', () => {
    it('toggles archive email value', () => {
      dispatcher.toggleSendArchiveEmail({data: {currentSendArchiveEmail: false}});

      expect(reduxActions.currentRetroSendArchiveEmailUpdated).toHaveBeenCalledWith(true);
    });
  });

  describe('extendTimerSuccessfullyDone', () => {
    it('updates retro in redux', () => {
      dispatcher.extendTimerSuccessfullyDone({data: {retro}});

      expect(reduxActions.currentRetroUpdated).toHaveBeenCalledWith(retro);
    });
  });

  describe('archiveRetroSuccessfullyDone', () => {
    let updated_retro;
    beforeEach(() => {
      updated_retro = {
        id: retro.id,
        name: retro.name,
        items: [],
        action_items: [retro.action_items[0]],
      };

      dispatcher.archiveRetroSuccessfullyDone({data: {retro: updated_retro}});
    });

    it('updates the retro', () => {
      retro.retro_item_end_time = 321;
      expect(reduxActions.currentRetroUpdated).toHaveBeenCalledWith(updated_retro);
    });

    it('dispatches archived retro analytics', () => {
      expect(analyticsActionDispatcher.archivedRetro).toHaveBeenCalledWith(retro.id);
    });

    it('displays an alert', () => {
      expect(dispatcher.dispatch).toHaveBeenCalledWith({
        type: 'showAlert',
        data: {
          message: 'Archived!',
        },
      });
    });
  });

  describe('websocketRetroDataReceived', () => {
    describe('when the retro is updated', () => {
      it('updates store with data from socket', () => {
        dispatcher.websocketRetroDataReceived({data: {retro}});

        expect(reduxActions.currentRetroUpdated).toHaveBeenCalledWith(retro);
      });
    });

    describe('when the command is force_relogin', () => {
      beforeEach(() => {
        const store = {getState: () => ({user: {websocketSession: {request_uuid: 'fake-request-uuid-1'}}})};
        dispatcher = mainDispatcher(reduxActions, routerActionDispatcher, analyticsActionDispatcher, store);
        dispatcher.dispatch = jest.fn();
      });

      describe('when the command was originated by someone else', () => {
        it('dispatches show alert with a password changed message', () => {
          dispatcher.websocketRetroDataReceived({
            data: {
              command: 'force_relogin',
              payload: {
                originator_id: 'fake-request-uuid-2',
                retro: {
                  slug: 'retro-slug-1',
                },
              },
            },
          });

          expect(routerActionDispatcher.retroRelogin).toHaveBeenCalledWith({
            slug: 'retro-slug-1',
          });
        });
      });

      describe('when the command was originated by me', () => {
        it('does not dispatch show alert', () => {
          dispatcher.websocketRetroDataReceived({
            data: {
              command: 'force_relogin',
              payload: {
                originator_id: 'fake-request-uuid-1',
              },
            },
          });

          expect(dispatcher.dispatch).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('websocketSessionDataReceived', () => {
    it('updates store with data from socket', () => {
      dispatcher.websocketSessionDataReceived({data: {payload: {request_uuid: 'some-request-uuid'}}});
      expect(reduxActions.updateWebsocketSession).toHaveBeenCalledWith({request_uuid: 'some-request-uuid'});
    });
  });

  describe('doneRetroActionItemSuccessfullyToggled', () => {
    it('updates the store', () => {
      const actionItem = {id: 1, done: true};
      dispatcher.doneRetroActionItemSuccessfullyToggled({data: {action_item: actionItem}});
      expect(reduxActions.currentRetroActionItemUpdated).toHaveBeenCalledWith(actionItem);
    });

    describe('when action item is marked as done', () => {
      it('dispatches completed retro action item analytic', () => {
        dispatcher.doneRetroActionItemSuccessfullyToggled({data: {action_item: {id: 1, done: true}, retro_id: 222}});
        expect(analyticsActionDispatcher.doneActionItem).toHaveBeenCalledWith(222);
      });
    });

    describe('when action item is marked as undone', () => {
      it('does not dispatch anything', () => {
        dispatcher.doneRetroActionItemSuccessfullyToggled({data: {action_item: {id: 2, done: false}, retro_id: 222}});
        expect(analyticsActionDispatcher.undoneActionItem).toHaveBeenCalledWith(222);
      });
    });
  });

  describe('retroActionItemSuccessfullyDeleted', () => {
    it('updates the store and removes the retro action item', () => {
      const action_item = retro.action_items[0];

      dispatcher.retroActionItemSuccessfullyDeleted({data: {action_item}});

      expect(reduxActions.currentRetroActionItemDeleted).toHaveBeenCalledWith(action_item);
    });
  });

  describe('retroActionItemSuccessfullyEdited', () => {
    it('updates description of the action item', () => {
      const action_item = retro.action_items[0];
      action_item.description = 'description for action item 1 has been changed';
      dispatcher.retroActionItemSuccessfullyEdited({data: {retroId: 1, action_item}});

      expect(reduxActions.currentRetroActionItemUpdated).toHaveBeenCalledWith(action_item);
    });
  });

  describe('retroArchiveSuccessfullyFetched', () => {
    it('updates the store with the archived retro items', () => {
      const retro_archives = {
        id: 1,
        name: 'retro name',
        items: [
          {
            id: 2,
            description: 'item 1',
            vote_count: 1,
            done: false,
            archived_at: '2016-07-18T00:00:00.000Z',
          },
          {
            id: 3,
            description: 'item 3',
            vote_count: 2,
            done: true,
            archived_at: '2016-07-20T00:00:00.000Z',
          },
        ],
        action_items: [
          {
            id: 1,
            description: 'archived item 1',
            archived_at: '2016-07-18T00:00:00.000Z',
          },
          {
            id: 2,
            description: 'archived item 2',
            archived_at: '2016-07-20T00:00:00.000Z',
          },
        ],
      };

      dispatcher.retroArchiveSuccessfullyFetched({data: {retro: retro_archives}});

      expect(reduxActions.updateCurrentArchivedRetro).toHaveBeenCalledWith(retro_archives);
    });
  });

  describe('retroArchivesSuccessfullyFetched', () => {
    it('updates the store with the archives', () => {
      dispatcher.retroArchivesSuccessfullyFetched({data: {archives: [{id: 123}]}});

      expect(reduxActions.updateRetroArchives).toHaveBeenCalledWith([{id: 123}]);
    });
  });

  describe('backPressedFromArchives', () => {
    beforeEach(() => {
      dispatcher.backPressedFromArchives({data: {retro_id: '1'}});
    });
    it('sets the route back to the current retro', () => {
      expect(routerActionDispatcher.showRetroForId).toHaveBeenCalledWith('1');
    });
  });

  describe('backPressedFromPasswordSettings', () => {
    beforeEach(() => {
      dispatcher.backPressedFromPasswordSettings({data: {retro_id: '1'}});
    });
    it('sets the route back to the current retro', () => {
      expect(routerActionDispatcher.retroSettings).toHaveBeenCalledWith('1');
    });
  });

  describe('showAlert', () => {
    beforeEach(() => {
      dispatcher.showAlert({
        data: {
          message: 'this is a message',
        },
      });
    });

    it('adds the alert message to the store', () => {
      expect(reduxActions.showAlert).toHaveBeenCalledWith({message: 'this is a message'});
    });

    it('schedules removal of the message after a delay', () => {
      jest.advanceTimersByTime(2000);
      expect(reduxActions.clearAlert).not.toHaveBeenCalled();

      jest.advanceTimersByTime(2000);
      expect(reduxActions.clearAlert).toHaveBeenCalled();
    });

    it('resets the removal countdown if the message updates', () => {
      jest.advanceTimersByTime(2000);
      expect(reduxActions.clearAlert).not.toHaveBeenCalled();

      dispatcher.showAlert({
        data: {message: 'a new message'},
      });

      jest.advanceTimersByTime(2000);
      expect(reduxActions.clearAlert).not.toHaveBeenCalled();

      jest.advanceTimersByTime(2000);
      expect(reduxActions.clearAlert).toHaveBeenCalled();
    });
  });

  describe('hideAlert', () => {
    beforeEach(() => {
      dispatcher.hideAlert();
    });

    it('clears the alert message from the store', () => {
      expect(reduxActions.clearAlert).toHaveBeenCalled();
    });
  });

  describe('showDialog', () => {
    it('adds dialog to the store', () => {
      dispatcher.showDialog({
        data: {
          title: 'Some title',
          message: 'Some message',
        },
      });

      expect(reduxActions.showDialog).toHaveBeenCalledWith({
        title: 'Some title',
        message: 'Some message',
      });
    });
  });

  describe('hideDialog', () => {
    it('clears the dialog from the store', () => {
      dispatcher.hideDialog();

      expect(reduxActions.clearDialog).toHaveBeenCalled();
    });
  });

  describe('retroNotFound', () => {
    it('updates the store with retro not found', () => {
      dispatcher.retroNotFound();
      expect(reduxActions.setNotFound).toHaveBeenCalledWith({retro_not_found: true});
    });
  });

  describe('resetRetroNotFound', () => {
    it('updates the store with retro not found', () => {
      dispatcher.resetRetroNotFound();
      expect(reduxActions.setNotFound).toHaveBeenCalledWith({retro_not_found: false});
    });
  });

  describe('notFound', () => {
    it('updates the store with retro not found', () => {
      dispatcher.notFound();
      expect(reduxActions.setNotFound).toHaveBeenCalledWith({not_found: true});
    });
  });

  describe('resetNotFound', () => {
    it('updates the store with retro not found', () => {
      dispatcher.resetNotFound();
      expect(reduxActions.setNotFound).toHaveBeenCalledWith({not_found: false});
    });
  });

  describe('apiServerNotFound', () => {
    it('updates the store with retro not found', () => {
      dispatcher.apiServerNotFound();
      expect(reduxActions.setNotFound).toHaveBeenCalledWith({api_server_not_found: true});
    });
  });

  describe('resetApiServerNotFound', () => {
    it('updates the store with not found to false', () => {
      dispatcher.resetApiServerNotFound();
      expect(reduxActions.setNotFound).toHaveBeenCalledWith({api_server_not_found: false});
    });
  });

  describe('signOut', () => {
    beforeEach(() => {
      localStorage.setItem('a', 'b');

      dispatcher.signOut({});
    });

    it('clears local storage', () => {
      expect(localStorage.length).toEqual(0);
    });

    it('redirects to home page', () => {
      expect(routerActionDispatcher.home).toHaveBeenCalled();
    });
  });

  describe('routeToRetroPasswordSettings', () => {
    beforeEach(() => {
      dispatcher.routeToRetroPasswordSettings({data: {retro_id: '13'}});
    });

    it('routes to the retro password settings page', () => {
      expect(routerActionDispatcher.retroPasswordSettings).toHaveBeenCalledWith('13');
    });
  });

  describe('retroPasswordSuccessfullyUpdated', () => {
    beforeEach(() => {
      dispatcher.retroPasswordSuccessfullyUpdated({data: {retro_id: '42', token: 'new-api-token'}});
    });

    it('clears the error messages', () => {
      expect(reduxActions.clearErrors).toHaveBeenCalled();
    });

    it('updates token in local storage', () => {
      expect(localStorage.getItem('apiToken-42')).toEqual('new-api-token');
    });
  });

  describe('retroPasswordUnsuccessfullyUpdated', () => {
    beforeEach(() => {
      dispatcher.retroPasswordUnsuccessfullyUpdated({
        data: {
          errors: ['Sorry! That password does not match the current one.'],
        },
      });
    });

    it('updates the error messages', () => {
      expect(reduxActions.errorsUpdated).toHaveBeenCalledWith(['Sorry! That password does not match the current one.']);
    });
  });

  describe('clearErrors', () => {
    it('clears the error messages', () => {
      dispatcher.clearErrors();
      expect(reduxActions.clearErrors).toHaveBeenCalled();
    });
  });

  describe('redirectToRegistration', () => {
    it('redirects to the registration page with the correct url parameters', () => {
      dispatcher.redirectToRegistration({
        data: {access_token: 'the-access-token', email: 'a@a.a', name: 'my full name'},
      });

      expect(routerActionDispatcher.registration).toHaveBeenCalledWith('the-access-token', 'a@a.a', 'my full name');
    });
  });

  describe('setConfig', () => {
    it('sets feature flags', () => {
      dispatcher.setConfig({
        data: {
          archive_emails: true,
        },
      });

      expect(reduxActions.updateFeatureFlags).toHaveBeenCalledWith({
        archiveEmails: true,
      });
    });
  });
});
