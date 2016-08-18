var _ = require('lodash');
var when = require('when');

var assert = require('common/lang/assert');

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
var UppercaseResultProcessor = require('./processors/UppercaseResultProcessor');
var WrapResultProcessor = require('./processors/WrapResultProcessor');

var ContextQueryProvider = require('./providers/ContextQueryProvider');
var EnvironmentQueryProvider = require('./providers/EnvironmentQueryProvider');
var HardcodeQueryProvider = require('./providers/HardcodeQueryProvider');
var MySqlQueryProvider = require('./providers/MySqlQueryProvider');
var OnDemandQueryProvider = require('./providers/OnDemandQueryProvider');
var SimpleRestQueryProvider = require('./providers/SimpleRestQueryProvider');
var TimestampQueryProvider = require('./providers/TimestampQueryProvider');

module.exports = function() {
	'use strict';

	var SimpleDataProviderFactory = DataProviderFactory.extend({
		init: function(customProcessors, customProviders) {
			this._super();

			this._customProcessors = customProcessors || {};
			this._customProviders = customProviders || {};
		},

		_build: function(configuration) {
			assert.argumentIsRequired(configuration, 'configuration', Object);
			assert.argumentIsRequired(configuration.provider, 'configuration.provider', Object);
			assert.argumentIsRequired(configuration.provider.type, 'configuration.provider.type', String);

			var that = this;

			var providerConfiguration = configuration.provider;
			var providerTypeName = providerConfiguration.type;

			if (!_.has(providerMap, providerTypeName) && !_.has(this._customProviders, providerTypeName)) {
				throw new Error('Unable to construct query provider (' + providerTypeName + ').');
			}

			var Constructor = providerMap[providerTypeName] || this._customProviders[providerTypeName];
			var queryProvider = new Constructor(providerConfiguration);

			var processor;

			if (_.isArray(configuration.processors) && _.isArray(configuration.processors)) {
				processor = new CompositeResultProcessor(_.map(configuration.processors, function(configuration) {
					return buildResultProcessor.call(that, configuration);
				}));
			} else if (_.isObject(configuration.processor)) {
				processor = buildResultProcessor.call(that, configuration.processor);
			} else {
				processor = buildResultProcessor.call(that);
			}

			return new DataProvider(queryProvider, processor);
		},

		toString: function() {
			return '[SimpleDataProviderFactory]';
		}
	});

	function buildResultProcessor(processorConfiguration) {
		var processorTypeName;

		if (processorConfiguration) {
			processorTypeName = processorConfiguration.type;
		}

		if (!processorTypeName) {
			processorTypeName = 'Default';
		}

		if (!_.has(processorMap, processorTypeName) && !_.has(this._customProcessors, processorTypeName)) {
			throw new Error('Unable to construct result processor (' + processorTypeName + ').');
		}

		var Constructor = processorMap[processorTypeName] || this._customProcessors[processorTypeName];

		return new Constructor(processorConfiguration);
	}

	var providerMap = {
		ContextQueryProvider: ContextQueryProvider,
		EnvironmentQueryProvider: EnvironmentQueryProvider,
		HardcodeQueryProvider: HardcodeQueryProvider,
		MySqlQueryProvider: MySqlQueryProvider,
		OnDemandQueryProvider: OnDemandQueryProvider,
		SimpleRestQueryProvider: SimpleRestQueryProvider,
		TimestampQueryProvider: TimestampQueryProvider,
	};

	var processorMap = {
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
		UppercaseResultProcessor: UppercaseResultProcessor,
		WrapResultProcessor: WrapResultProcessor,
		Default: ResultProcessor
	};

	return SimpleDataProviderFactory;
}();