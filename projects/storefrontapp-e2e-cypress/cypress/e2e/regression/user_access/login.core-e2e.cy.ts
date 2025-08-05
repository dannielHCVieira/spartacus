/*
 * SPDX-FileCopyrightText: 2025 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as login from '../../../helpers/login';
import { viewportContext } from '../../../helpers/viewport-context';

describe('Login', () => {
  viewportContext(['mobile'], () => {
    before(() => {
      cy.whenJDK17(() => {
        cy.visit('/login');
      });
      cy.whenJDK21(() => {
        cy.visit('/');
        cy.wait(2000);
        cy.intercept('GET', '**/csrf', (req) => {
          req.headers['Origin'] = 'http://localhost:4200';
          req.continue();
        }).as('getCsrf-before');
        cy.visit('/sign-in');
        cy.wait('@getCsrf-before');
        cy.wait(2000);
      });
      login.registerUserFromLoginPage();
    });

    it('should login and logout successfully', () => {
      cy.visit('/');
      cy.wait(2000);
      cy.intercept('GET', '**/csrf', (req) => {
        req.headers['Origin'] = 'http://localhost:4200';
        req.continue();
      }).as('getCsrf-test1');
      cy.visit('/sign-in');
      cy.wait('@getCsrf-test1');
      cy.wait(2000);
      login.loginUser();

      const tokenRevocationRequestAlias =
        login.listenForTokenRevocationRequest();
      login.signOutUser();
      cy.wait(tokenRevocationRequestAlias);
    });

    it('should not login with wrong password', () => {
      cy.visit('/');
      cy.wait(2000);
      cy.intercept('GET', '**/csrf', (req) => {
        req.headers['Origin'] = 'http://localhost:4200';
        req.continue();
      }).as('getCsrf-test2');
      cy.visit('/sign-in');
      cy.wait('@getCsrf-test2');
      cy.wait(2000);
      login.loginWithBadCredentialsFromLoginPage();
    });
  });
});
