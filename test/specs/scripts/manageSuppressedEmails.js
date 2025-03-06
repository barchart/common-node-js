const SesProvider = require('../../../aws/SesProvider');

async function main() {
    const configuration = {
        region: 'us-east-1'
    };

    const sesProvider = new SesProvider(configuration);
    await sesProvider.start();

    const suppressedEmails = await sesProvider.getAllSuppressedEmails();
    console.log('Suppressed Emails:', suppressedEmails);

    const emailToAdd = 'tafox89745@lassora.com';

    await sesProvider.addEmailToSuppressionList(emailToAdd);
    console.log(`Added ${emailToAdd} to the suppression list`);

    const suppressedEmailsAfterAdd = await sesProvider.getNumberOfSuppressedEmails();
    console.log('Number of suppressed emails after adding:', suppressedEmailsAfterAdd);

    await sesProvider.removeEmailFromSuppressionList(emailToAdd);
    console.log(`Removed ${emailToAdd} from the suppression list`);

    const suppressedEmailsAfterRemove = await sesProvider.getNumberOfSuppressedEmails();
    console.log('Number of suppressed emails after removing:', suppressedEmailsAfterRemove);
}

main().catch(error => {
    console.error('Error:', error);
});