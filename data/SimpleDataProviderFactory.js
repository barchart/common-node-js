const assert = require('common/lang/assert'),
	is = require('common/lang/is'),
	object = require('common/lang/object');

const DataProvider = require('./DataProvider'),
	DataProviderFactory = require('./DataProviderFactory'),
	ResultProcessor = require('./ResultProcessor');

const AddResultProcessor = require('./processors/AddResultProcessor'),
	AverageResultProcessor = require('./processors/AverageResultProcessor'),
	CleanResultProcessor = require('./processors/CleanResultProcessor'),
	CoalesceResultProcessor = require('./processors/CoalesceResultProcessor'),
	CompactResultProcessor = require('./processors/CompactResultProcessor'),
	CompositeResultProcessor = require('./processors/CompositeResultProcessor'),
	ConcatenateArrayResultProcessor = require('./processors/ConcatenateArrayResultProcessor'),
	ConcatenateResultProcessor = require('./processors/ConcatenateResultProcessor'),
	ConvertResultProcessor = require('./processors/ConvertResultProcessor'),
	CopyResultProcessor = require('./processors/CopyResultProcessor'),
	CountResultProcessor = require('./processors/CountResultProcessor'),
	DefaultResultProcessor = require('./processors/DefaultResultProcessor'),
	DeleteResultProcessor = require('./processors/DeleteResultProcessor'),
	DistinctResultProcessor = require('./processors/DistinctResultProcessor'),
	DivideResultProcessor = require('./processors/DivideResultProcessor'),
	EmptyCoalescingResultProcessor = require('./processors/EmptyCoalescingResultProcessor'),
	EncodeUriResultProcessor = require('./processors/EncodeUriResultProcessor'),
	ExtractResultProcessor = require('./processors/ExtractResultProcessor'),
	FilterComparisonResultProcessor = require('./processors/FilterComparisonResultProcessor'),
	FilterContainsResultProcessor = require('./processors/FilterContainsResultProcessor'),
	FilterEqualsResultProcessor = require('./processors/FilterEqualsResultProcessor'),
	FilterExistsResultProcessor = require('./processors/FilterExistsResultProcessor'),
	FilterRegexResultProcessor = require('./processors/FilterRegexResultProcessor'),
	FilterResultProcessor = require('./processors/FilterResultProcessor'),
	FindResultProcessor = require('./processors/FindResultProcessor'),
	FirstResultProcessor = require('./processors/FirstResultProcessor'),
	FlattenResultProcessor = require('./processors/FlattenResultProcessor'),
	FormatDateResultProcessor = require('./processors/FormatDateResultProcessor'),
	FormatNumberResultProcessor = require('./processors/FormatNumberResultProcessor'),
	FormatPriceResultProcessor = require('./processors/FormatPriceResultProcessor'),
	GroupingResultProcessor = require('./processors/GroupingResultProcessor'),
	IndexResultProcessor = require('./processors/IndexResultProcessor'),
	JoinResultProcessor = require('./processors/JoinResultProcessor'),
	JsonParseResultProcessor = require('./processors/JsonParseResultProcessor'),
	JsonStringifyResultProcessor = require('./processors/JsonStringifyResultProcessor'),
	LowercaseResultProcessor = require('./processors/LowercaseResultProcessor'),
	MapResultProcessor = require('./processors/MapResultProcessor'),
	MatchResultProcessor = require('./processors/MatchResultProcessor'),
	MultiplyResultProcessor = require('./processors/MultiplyResultProcessor'),
	MySqlBlobToArrayProcessor = require('./processors/MySqlBlobToArrayProcessor'),
	NullCoalescingResultProcessor = require('./processors/NullCoalescingResultProcessor'),
	OverwriteResultProcessor = require('./processors/OverwriteResultProcessor'),
	PartitionResultProcessor = require('./processors/PartitionResultProcessor'),
	PushResultProcessor = require('./processors/PushResultProcessor'),
	ReplaceResultProcessor = require('./processors/ReplaceResultProcessor'),
	ScalarResultProcessor = require('./processors/ScalarResultProcessor'),
	SelectResultProcessor = require('./processors/SelectResultProcessor'),
	SignResultProcessor = require('./processors/SignResultProcessor'),
	SliceResultProcessor = require('./processors/SliceResultProcessor'),
	SortResultProcessor = require('./processors/SortResultProcessor'),
	SplitResultProcessor = require('./processors/SplitResultProcessor'),
	SubtractResultProcessor = require('./processors/SubtractResultProcessor'),
	SumResultProcessor = require('./processors/SumResultProcessor'),
	TranslateResultProcessor = require('./processors/TranslateResultProcessor'),
	TreeResultProcessor = require('./processors/TreeResultProcessor'),
	UnitConversionResultProcessor = require('./processors/UnitConversionResultProcessor'),
	TrimResultProcessor = require('./processors/TrimResultProcessor'),
	UnwrapResultProcessor = require('./processors/UnwrapResultProcessor'),
	UppercaseResultProcessor = require('./processors/UppercaseResultProcessor'),
	WrapResultProcessor = require('./processors/WrapResultProcessor'),

	ContextQueryProvider = require('./providers/ContextQueryProvider'),
	EnvironmentQueryProvider = require('./providers/EnvironmentQueryProvider'),
	HardcodeQueryProvider = require('./providers/HardcodeQueryProvider'),
	MySqlQueryProvider = require('./providers/MySqlQueryProvider'),
	OnDemandQueryProvider = require('./providers/OnDemandQueryProvider'),
	RestQueryProvider = require('./providers/RestQueryProvider'),
	SystemQueryProvider = require('./providers/SystemQueryProvider'),
	TimestampQueryProvider = require('./providers/TimestampQueryProvider');

module.exports = (() => {
	'use strict';

	const providerMap = {
		ContextQueryProvider: ContextQueryProvider,
		EnvironmentQueryProvider: EnvironmentQueryProvider,
		HardcodeQueryProvider: HardcodeQueryProvider,
		MySqlQueryProvider: MySqlQueryProvider,
		OnDemandQueryProvider: OnDemandQueryProvider,
		RestQueryProvider: RestQueryProvider,
		SystemQueryProvider: SystemQueryProvider,
		TimestampQueryProvider: TimestampQueryProvider,
	};

	const processorMap = {
		AddResultProcessor: AddResultProcessor,
		AverageResultProcessor: AverageResultProcessor,
		CleanResultProcessor: CleanResultProcessor,
		CoalesceResultProcessor: CoalesceResultProcessor,
		CompactResultProcessor: CompactResultProcessor,
		ConcatenateArrayResultProcessor: ConcatenateArrayResultProcessor,
		ConcatenateResultProcessor: ConcatenateResultProcessor,
		ConvertResultProcessor: ConvertResultProcessor,
		CopyResultProcessor: CopyResultProcessor,
		CountResultProcessor: CountResultProcessor,
		DefaultResultProcessor: DefaultResultProcessor,
		DeleteResultProcessor: DeleteResultProcessor,
		DistinctResultProcessor: DistinctResultProcessor,
		DivideResultProcessor: DivideResultProcessor,
		EmptyCoalescingResultProcessor: EmptyCoalescingResultProcessor,
		EncodeUriResultProcessor: EncodeUriResultProcessor,
		ExtractResultProcessor: ExtractResultProcessor,
		FilterComparisonResultProcessor: FilterComparisonResultProcessor,
		FilterContainsResultProcessor: FilterContainsResultProcessor,
		FilterEqualsResultProcessor: FilterEqualsResultProcessor,
		FilterExistsResultProcessor: FilterExistsResultProcessor,
		FilterRegexResultProcessor: FilterRegexResultProcessor,
		FilterResultProcessor: FilterResultProcessor,
		FindResultProcessor: FindResultProcessor,
		FirstResultProcessor: FirstResultProcessor,
		FlattenResultProcessor: FlattenResultProcessor,
		FormatDateResultProcessor: FormatDateResultProcessor,
		FormatNumberResultProcessor: FormatNumberResultProcessor,
		FormatPriceResultProcessor: FormatPriceResultProcessor,
		GroupingResultProcessor: GroupingResultProcessor,
		IndexResultProcessor: IndexResultProcessor,
		JoinResultProcessor: JoinResultProcessor,
		JsonParseResultProcessor: JsonParseResultProcessor,
		JsonStringifyResultProcessor: JsonStringifyResultProcessor,
		LowercaseResultProcessor: LowercaseResultProcessor,
		MapResultProcessor: MapResultProcessor,
		MatchResultProcessor: MatchResultProcessor,
		MultiplyResultProcessor: MultiplyResultProcessor,
		MySqlBlobToArrayProcessor: MySqlBlobToArrayProcessor,
		NullCoalescingResultProcessor: NullCoalescingResultProcessor,
		OverwriteResultProcessor: OverwriteResultProcessor,
		PartitionResultProcessor: PartitionResultProcessor,
		PushResultProcessor: PushResultProcessor,
		ReplaceResultProcessor: ReplaceResultProcessor,
		ScalarResultProcessor: ScalarResultProcessor,
		SelectResultProcessor: SelectResultProcessor,
		SignResultProcessor: SignResultProcessor,
		SliceResultProcessor: SliceResultProcessor,
		SortResultProcessor: SortResultProcessor,
		SplitResultProcessor: SplitResultProcessor,
		SubtractResultProcessor: SubtractResultProcessor,
		SumResultProcessor: SumResultProcessor,
		TranslateResultProcessor: TranslateResultProcessor,
		TreeResultProcessor: TreeResultProcessor,
		UnitConversionResultProcessor: UnitConversionResultProcessor,
		TrimResultProcessor: TrimResultProcessor,
		UnwrapResultProcessor: UnwrapResultProcessor,
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
			const queryProvider = new Constructor(mergeConfigurations(this._providerDefaults[providerTypeName] || {}, providerConfiguration));

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

		return new Constructor(mergeConfigurations(this._processorDefaults[processorTypeName] || {}, processorConfiguration));
	}

	function mergeConfigurations(defaultConfiguration, providerConfiguration) {
		return object.merge(defaultConfiguration, providerConfiguration);
	}

	return SimpleDataProviderFactory;
})();
