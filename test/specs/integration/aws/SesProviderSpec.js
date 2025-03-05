const SesProvider = require('../../../../aws/SesProvider');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe('When an SES Provider created', () => {
    'use strict';

    let sesProvider;
    let configuration;

    beforeEach(async () => {
        sesProvider = new SesProvider(configuration = {
            region: 'us-east-1'
        });

        await sesProvider.start();
    });

    it('should be an instance of SesProvider', () => {
        expect(sesProvider).toBeInstanceOf(SesProvider);
    });

    it('should get all suppressed emails', async () => {
        const suppressedEmails = await sesProvider.getAllSuppressedEmails();
        expect(suppressedEmails).toBeInstanceOf(Array);
    });

    it('should add an email to the suppression list', async () => {
        const email = 'tafox89745@lassora.com';
        const suppressedEmailsBefore = await sesProvider.getNumberOfSuppressedEmails();

        await sesProvider.addEmailToSuppressionList(email);

        const suppressedEmailsAfter = await sesProvider.getNumberOfSuppressedEmails();
        expect(suppressedEmailsAfter).toBeGreaterThan(suppressedEmailsBefore);
    });

    it('should remove an email from the suppression list', async () => {
        const email = 'tafox89745@lassora.com';
        const suppressedEmailsBefore = await sesProvider.getNumberOfSuppressedEmails();

        await sesProvider.removeEmailFromSuppressionList(email);

        const suppressedEmailsAfter = await sesProvider.getNumberOfSuppressedEmails();
        expect(suppressedEmailsAfter).toBeLessThan(suppressedEmailsBefore);
    });
});