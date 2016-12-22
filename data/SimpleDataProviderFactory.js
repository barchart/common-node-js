var assert = require('common/lang/assert');
var is = require('common/lang/is');
var is = require('common/lang/object');

var DataProvider = require('./DataProvider');
var DataProviderFactory = require('./DataProviderFactory');
var ResultProcessor = require('./ResultProcessor');

var AddResultProcessor = require('./processors/AddResultProcessor');
var AggregateResultProcessor = require('./processors/AggregateResultProcessor');
var CompositeResultProcessor = require('./processors/CompositeResultProcessor');
var ConvertResultProcessor = require('./processors/ConvertResultProcessor');
var CopyResultProcessor = require('./processors/CopyResultProcessor');
var CountResultProcessor = require('./processors/CountResultProcessor');
var DefaultResultProcessor = require('./processors/DefaultResultProcessor');
var DeleteResultProcessor = require('./processors/DeleteResultProcessor');
var DistinctResultProcessor = require('./processors/DistinctResultProcessor');
var EmptyCoalescingResultProcessor = require('./processors/EmptyCoalescingResultProcessor');
var EncodeUriResultProcessor = require('./processors/EncodeUriResultProcessor');
var ExtractResultProcessor = require('./processors/ExtractResultProcessor');
var FilterResultProcessor = require('./processors/FilterResultProcessor');
var FirstResultProcessor = require('./processors/FirstResultProcessor');
var FormatDateResultProcessor = require('./processors/FormatDateResultProcessor');
var FormatNumberResultProcessor = require('./processors/FormatNumberResultProcessor');
var FormatPriceResultProcessor = require('./processors/FormatPriceResultProcessor');
var GroupingResultProcessor = require('./processors/GroupingResultProcessor');
var JoinResultProcessor = require('./processors/JoinResultProcessor');
var MapResultProcessor = require('./processors/MapResultProcessor');
var MatchResultProcessor = require('./processors/MatchResultProcessor');
var MySqlBlobToArrayProcessor = require('./processors/MySqlBlobToArrayProcessor');
var NullCoalescingResultProcessor = require('./processors/NullCoalescingResultProcessor');
var OverwriteResultProcessor = require('./processors/OverwriteResultProcessor');
var PartitionResultProcessor = require('./processors/PartitionResultProcessor');
var ReplaceResultProcessor = require('./processors/ReplaceResultProcessor');
var ScalarResultProcessor = require('./processors/ScalarResultProcessor');
var SelectResultProcessor = require('./processors/SelectResultProcessor');
var SignResultProcessor = require('./processors/SignResultProcessor');
var SliceResultProcessor = require('./processors/SliceResultProcessor');
var SortResultProcessor = require('./processors/SortResultProcessor');
var SplitResultProcessor = require('./processors/SplitResultProcessor');
var SubtractResultProcessor = require('./processors/SubtractResultProcessor');
var TrimResultProcessor = require('./processors/TrimResultProcessor');
var UppercaseResultProcessor = require('./processors/UppercaseResultProcessor');
var WrapResultProcessor = require('./processors/WrapResultProcessor');

var ContextQueryProvider = require('./providers/ContextQueryProvider');
var EnvironmentQueryProvider = require('./providers/EnvironmentQueryProvider');
var HardcodeQueryProvider = require('./providers/HardcodeQueryProvider');
var MySqlQueryProvider = require('./providers/MySqlQueryProvider');
var OnDemandQueryProvider = require('./providers/OnDemandQueryProvider');
var RestQueryProvider = require('./providers/RestQueryProvider');
var TimestampQueryProvider = require('./providers/TimestampQueryProvider');

module.exports = (() => {
	'use strict';

	const providerMap = {
		ContextQueryProvider: ContextQueryProvider,
		EnvironmentQueryProvider: EnvironmentQueryProvider,
		HardcodeQueryProvider: HardcodeQueryProvider,
		MySqlQueryProvider: MySqlQueryProvider,
		OnDemandQueryProvider: OnDemandQueryProvider,
		RestQueryProvider: RestQueryProvider,
		TimestampQueryProvider: TimestampQueryProvider,
	};

	const processorMap = {
		AddResultProcessor: AddResultProcessor,
		AggregateResultProcessor: AggregateResultProcessor,
		ConvertResultProcessor: ConvertResultProcessor,
		CopyResultProcessor: CopyResultProcessor,
		CountResultProcessor: CountResultProcessor,
		DefaultResultProcessor: DefaultResultProcessor,
		DeleteResultProcessor: DeleteResultProcessor,
		DistinctResultProcessor: DistinctResultProcessor,
		EmptyCoalescingResultProcessor: EmptyCoalescingResultProcessor,
		EncodeUriResultProcessor: EncodeUriResultProcessor,
		ExtractResultProcessor: ExtractResultProcessor,
		FilterResultProcessor: FilterResultProcessor,
		FirstResultProcessor: FirstResultProcessor,
		FormatDateResultProcessor: FormatDateResultProcessor,
		FormatNumberResultProcessor: FormatNumberResultProcessor,
		FormatPriceResultProcessor: FormatPriceResultProcessor,
		GroupingResultProcessor: GroupingResultProcessor,
		JoinResultProcessor: JoinResultProcessor,
		MapResultProcessor: MapResultProcessor,
		MatchResultProcessor: MatchResultProcessor,
		MySqlBlobToArrayProcessor: MySqlBlobToArrayProcessor,
		NullCoalescingResultProcessor: NullCoalescingResultProcessor,
		OverwriteResultProcessor: OverwriteResultProcessor,
		PartitionResultProcessor: PartitionResultProcessor,
		ReplaceResultProcessor: ReplaceResultProcessor,
		ScalarResultProcessor: ScalarResultProcessor,
		SelectResultProcessor: SelectResultProcessor,
		SignResultProcessor: SignResultProcessor,
		SliceResultProcessor: SliceResultProcessor,
		SortResultProcessor: SortResultProcessor,
		SplitResultProcessor: SplitResultProcessor,
		SubtractResultProcessor: SubtractResultProcessor,
		TrimResultProcessor: TrimResultProcessor,
		UppercaseResultProcessor: UppercaseResultProcessor,
		WrapResultProcessor: WrapResultProcessor,
		Default: ResultProcessor
	};
	
	class SimpleDataProviderFactory extends DataProviderFactory {
		constructor(customProcessors, customProviders, processorDefaults, providerDefaults) {
			super();

			this._customProcessors = customProcessors || {};
			this._customProviders = customProviders || {};

			this._processorDefaults = processorDefaults || {};
			this._providerDefaults = providerDefaults || {};
		}

		_build(configuration) {
			assert.argumentIsRequired(configuration, 'configuration', Object);
			assert.argumentIsRequired(configuration.provider, 'configuration.provider', Object);
			assert.argumentIsRequired(configuration.provider.type, 'configuration.provider.type', String);

			const providerConfiguration = configuration.provider;
			const providerTypeName = providerConfiguration.type;

			if (!providerMap.hasOwnProperty(providerTypeName) && !this._customProviders.hasOwnProperty(providerTypeName)) {
				throw new Error(`Unable to construct query provider (${providerTypeName})`);
			}

			const Constructor = providerMap[providerTypeName] || this._customProviders[providerTypeName];
			const queryProvider = new Constructor(mergeConfigurations(this._providerDefaults[providerTypeName] || { }, providerConfiguration));

			let processor;

			if (is.array(configuration.processors)) {
				processor = new CompositeResultProcessor(configuration.processors.map((configuration) => {
					return buildResultProcessor.call(this, configuration);
				}));
			} else if (is.object(configuration.processor)) {
				processor = buildResultProcessor.call(this, configuration.processor);
			} else {
				processor = buildResultProcessor.call(this);
			}

			return new DataProvider(queryProvider, processor);
		}

		toString() {
			return '[SimpleDataProviderFactory]';
		}
	}

	function buildResultProcessor(processorConfiguration) {
		let processorTypeName;

		if (processorConfiguration) {
			processorTypeName = processorConfiguration.type;
		}

		if (!processorTypeName) {
			processorTypeName = 'Default';
		}

		if (!processorMap.hasOwnProperty(processorTypeName) && !this._customProcessors.hasOwnProperty(processorTypeName)) {
			throw new Error(`Unable to construct result processor (${processorTypeName})`);
		}

		const Constructor = processorMap[processorTypeName] || this._customProcessors[processorTypeName];

		return new Constructor(mergeConfigurations(this._processorDefaults[processorTypeName] || { }, processorConfiguration));
	}

	function mergeConfigurations(defaultConfiguration, providerConfiguration) {
		return object.merge(defaultConfiguration, providerConfiguration);
	}

	return SimpleDataProviderFactory;
})();
