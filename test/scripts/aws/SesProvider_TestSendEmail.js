const SesProvider = require('./../../../aws/SesProvider');

async function sesProvider_TestSendEmail() {
    const configuration = {
        region: 'us-east-1'
    };

    const sesProvider = new SesProvider(configuration);
    await sesProvider.start();

    const senderAddress = 'luka.sotra@barchart.com';
    const recipientAddress = 'luka.sotra@barchart.com';
    const subject = 'Test Email';
    const htmlBody = '<h1>Test</h1><p>email.</p>';
    const textBody = 'This is a test email.';

    try {
        await sesProvider.sendEmail(senderAddress, recipientAddress, subject, htmlBody, textBody);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Failed to send email', error);
    }
}

sesProvider_TestSendEmail().catch(error => {
    console.error('Error:', error);
});