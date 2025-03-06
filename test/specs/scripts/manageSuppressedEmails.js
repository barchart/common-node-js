const SesProvider = require('../../../aws/SesProvider');

async function main() {
    const configuration = {
        region: 'us-east-1'
    };
    const emailToAdd = 'tafox89745@lassora.com';

    const sesProvider = new SesProvider(configuration);
    await sesProvider.start();

    const suppressedEmails = await sesProvider.getSuppressedEmails();
    console.log('Suppressed Emails:', suppressedEmails);

    await sesProvider.addEmailToSuppressionList(emailToAdd);
    console.log('Email added to suppression list:', emailToAdd);

    const suppressedDestination = await sesProvider.getSuppressedDestination(emailToAdd);
    console.log('Suppressed Destination:', suppressedDestination);

    await sesProvider.removeEmailFromSuppressionList(emailToAdd);
    console.log('Email removed from suppression list:', emailToAdd);
}

main().catch(error => {
    console.error('Error:', error);
});