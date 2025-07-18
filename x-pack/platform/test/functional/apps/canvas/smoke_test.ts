/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { FtrProviderContext } from '../../ftr_provider_context';

export default function canvasSmokeTest({ getService, getPageObjects }: FtrProviderContext) {
  const testSubjects = getService('testSubjects');
  const browser = getService('browser');
  const retry = getService('retry');
  const { canvas } = getPageObjects(['canvas']);
  const kibanaServer = getService('kibanaServer');
  const config = getService('config');
  const archive = {
    local: 'x-pack/test/functional/fixtures/kbn_archiver/canvas/default',
    ccs: 'x-pack/test/functional/fixtures/kbn_archiver/canvas/ccs/default',
  };

  describe('smoke test', function () {
    this.tags('includeFirefox');
    const workpadListSelector = 'canvasWorkpadTable > canvasWorkpadTableWorkpad';
    const testWorkpadId = 'workpad-1705f884-6224-47de-ba49-ca224fe6ec31';

    before(async () => {
      if (config.get('esTestCluster.ccs')) {
        await kibanaServer.importExport.load(archive.ccs);
      } else {
        await kibanaServer.importExport.load(archive.local);
      }

      await canvas.goToListingPage();
    });

    after(async () => {
      await kibanaServer.savedObjects.cleanStandardList();
    });

    it('loads workpad list', async () => {
      await retry.try(async () => {
        const workpadRows = await testSubjects.findAll(workpadListSelector);
        expect(workpadRows).to.have.length(1);
        expect(await workpadRows[0].getVisibleText()).to.equal('Test Workpad');
      });
    });

    it('loads workpage when clicked', async () => {
      // click the first workpad in the list to load it
      await testSubjects.click(workpadListSelector);

      // wait for the workpad page to load
      await retry.waitFor('workpad page', () => testSubjects.exists('canvasWorkpadPage'));

      // check that workpad loaded in url
      await retry.try(async () => {
        const url = await browser.getCurrentUrl();

        const path = new URL(url).pathname;

        expect(path).to.equal(`/app/canvas/workpad/${testWorkpadId}/page/1`);
      });
    });

    it('renders elements on workpad', async () => {
      await retry.try(async () => {
        // check for elements on the page
        const elements = await testSubjects.findAll(
          'canvasWorkpadPage > canvasWorkpadPageElementContent'
        );
        expect(elements).to.have.length(4);

        // check that the elements are what we expect

        // first is a markdown element
        const md = await elements[0].findByCssSelector('.canvasMarkdown');
        expect(await md.getVisibleText()).to.contain('Welcome to Canvas');

        // second element is a datatable that uses essql
        const serverRows = await elements[1].findAllByCssSelector('.canvasDataTable tbody tr');
        expect(serverRows).to.have.length(10);

        // third is a datatable that uses csv
        const commonRows = await elements[2].findAllByCssSelector('.canvasDataTable tbody tr');
        expect(commonRows).to.have.length(2);

        // fourth is a datatable that uses timelion
        const timelionRows = await elements[3].findAllByCssSelector('.canvasDataTable tbody tr');
        expect(timelionRows).to.have.length(12);
      });
    });
  });
}
