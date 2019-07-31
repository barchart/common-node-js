const Enum = require('@barchart/common-js/lang/Enum');

module.exports = (() => {
	'use strict';

	/**
	 * Defines stage for lambda functions.
	 *
	 * @public
	 * @extends {Enum}
	 * @param {String} code
	 * @param {String} description
	 */
	class LambdaStage extends Enum {
		constructor(code, description) {
			super(code, description);
		}

		/**
		 * Development.
		 *
		 * @static
		 * @return {LambdaStage}
		 */
		static get DEV() {
			return dev;
		}

		/**
		 * Demo.
		 *
		 * @static
		 * @return {LambdaStage}
		 */
		static get DEMO() {
			return demo;
		}

		/**
		 * Stage.
		 *
		 * @static
		 * @return {LambdaStage}
		 */
		static get STAGE() {
			return stage;
		}

		/**
		 * Production.
		 *
		 * @static
		 * @return {LambdaStage}
		 */
		static get PROD() {
			return prod;
		}

		toString() {
			return `[LambdaStage (code=${this.code})]`;
		}
	}

	const dev = new LambdaStage('dev', 'Development');
	const demo = new LambdaStage('demo', 'Demo');
	const stage = new LambdaStage('stage', 'Stage');
	const prod = new LambdaStage('prod', 'Production');

	return LambdaStage;
})();
