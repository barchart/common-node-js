const FailureType = require('@barchart/common-js/api/failures/FailureType');

module.exports = (() => {
    'use strict';

    /**
     * A static container for {@link FailureType} items related to suppression scenarios.
     *
     * @public
     */
    class SuppressionFailureType {
        constructor() {

        }

        /**
         * Sending an email failed because the email is on the suppression list.
         *
         * @public
         * @static
         * @returns {FailureType}
         */
        static get EMAIL_ON_SUPPRESSION_LIST_FAILED() {
            return emailOnSuppressionListFailed;
        }

        toString() {
            return '[SuppressionFailureType]';
        }
    }

    const emailOnSuppressionListFailed = new FailureType('EMAIL_ON_SUPPRESSION_LIST', 'Cannot send email. The email address is on the suppression list.', true, 400);

    return SuppressionFailureType;
})();