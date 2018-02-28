module.exports = {
	"categories": {
		"default": { "appenders": [ "console" ], "level": "info" },
	},
	"appenders": {
		"console": {
			"type": "console",
				"layout": {
				"type": "pattern",
					"pattern": "[%d] [%p] %c - %m%"
			}
		}
	}
};