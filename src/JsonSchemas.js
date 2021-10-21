
export const manifestSchema = {
  "$schema": "http://json-schema.org/schema#",
  "$id": "https://reconciliation-api.github.io/specs/latest/schemas/manifest.json",
  "type": "object",
  "description": "This validates a service manifest, describing the features supported by the endpoint.",
  "properties": {
    "versions": {
      "type": "array",
      "description": "The list of API versions supported by this service.",
      "items": {
        "type": "string"
      },
      "contains": {
        "enum": ["0.2"]
      }
    },
    "name": {
      "type": "string",
      "description": "A human-readable name for the service or data source"
    },
    "identifierSpace": {
      "type": "string",
      "description": "A URI describing the entity identifiers used in this service"
    },
    "schemaSpace": {
      "type": "string",
      "description": "A URI describing the schema used in this service"
    },
    "view": {
      "type": "object",
      "properties": {
        "url": {
          "type": "string",
          "description": "A template to transform an entity identifier into the corresponding URI",
          "pattern": ".*\\{\\{id\\}\\}.*"
        }
      },
      "required": [
        "url"
      ]
    },
    "feature_view": {
      "type": "object",
      "properties": {
        "url": {
          "type": "string",
          "description": "A template to transform a matching feature identifier into the corresponding URI",
          "pattern": ".*\\{\\{id\\}\\}.*"
        }
      },
      "required": [
        "url"
      ]
    },
    "defaultTypes": {
      "type": "array",
      "description": "A list of default types that are considered good generic choices for reconciliation",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          }
        },
        "required": [
          "id",
          "name"
        ]
      },
      "uniqueItems": true
    },
    "suggest": {
      "type": "object",
      "description": "Settings for the suggest protocol, to auto-complete entities, properties and types",
      "definitions": {
        "service_definition": {
          "type": "object",
          "properties": {
            "service_url": {
              "type": "string"
            },
            "service_path": {
              "type": "string"
            },
            "flyout_service_url": {
              "type": "string"
            },
            "flyout_service_path": {
              "type": "string",
              "pattern": ".*\\$\\{id\\}.*"
            }
          },
          "required": []
        }
      },
      "properties": {
        "entity": {
          "$ref": "#/properties/suggest/definitions/service_definition"
        },
        "property": {
          "$ref": "#/properties/suggest/definitions/service_definition"
        },
        "type": {
          "$ref": "#/properties/suggest/definitions/service_definition"
        }
      }
    },
    "preview": {
      "type": "object",
      "description": "Settings for the preview protocol, for HTML previews of entities",
      "properties": {
        "url": {
          "type": "string",
          "pattern": ".*\\{\\{id\\}\\}.*",
          "description": "A URL pattern which transforms the entity ID into a preview URL for it"
        },
        "width": {
          "type": "integer",
          "description": "The width of the iframe where to include the HTML preview"
        },
        "height": {
          "type": "integer",
          "description": "The height of the iframe where to include the HTML preview"
        }
      },
      "required": [
        "url",
        "width",
        "height"
      ]
    },
    "extend": {
      "type": "object",
      "description": "Settings for the data extension protocol, to fetch property values",
      "properties": {
        "propose_properties": {
          "type": "object",
          "description": "Location of the endpoint to propose properties to fetch for a given type",
          "properties": {
            "service_url": {
              "type": "string"
            },
            "service_path": {
              "type": "string"
            }
          }
        },
        "property_settings": {
          "type": "array",
          "description": "Definition of the settings configurable by the user when fetching a property",
          "items": {
            "oneOf": [
              {
                "type": "object",
                "description": "Defines a numerical setting on a property",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": [
                      "number"
                    ]
                  },
                  "default": {
                    "type": "number"
                  },
                  "label": {
                    "type": "string"
                  },
                  "name": {
                    "type": "string"
                  },
                  "help_text": {
                    "type": "string"
                  }
                },
                "required": [
                  "type",
                  "label",
                  "name"
                ]
              },
              {
                "type": "object",
                "description": "Defines a string setting on a property",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": [
                      "text"
                    ]
                  },
                  "default": {
                    "type": "string"
                  },
                  "label": {
                    "type": "string"
                  },
                  "name": {
                    "type": "string"
                  },
                  "help_text": {
                    "type": "string"
                  }
                },
                "required": [
                  "type",
                  "label",
                  "name"
                ]
              },
              {
                "type": "object",
                "description": "Defines a boolean setting on a property",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": [
                      "checkbox"
                    ]
                  },
                  "default": {
                    "type": "boolean"
                  },
                  "label": {
                    "type": "string"
                  },
                  "name": {
                    "type": "string"
                  },
                  "help_text": {
                    "type": "string"
                  }
                },
                "required": [
                  "type",
                  "label",
                  "name"
                ]
              },
              {
                "type": "object",
                "description": "Defines a setting with a fixed set of choices",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": [
                      "select"
                    ]
                  },
                  "default": {
                    "type": "string"
                  },
                  "label": {
                    "type": "string"
                  },
                  "name": {
                    "type": "string"
                  },
                  "help_text": {
                    "type": "string"
                  },
                  "choices": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "value": {
                          "type": "string"
                        },
                        "name": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "value",
                        "name"
                      ]
                    }
                  }
                },
                "required": [
                  "type",
                  "label",
                  "name",
                  "choices"
                ]
              }
            ]
          }
        }
      }
    }
  },
  "required": [
    "versions",
    "name",
    "identifierSpace",
    "schemaSpace"
  ]
};

export const reconResponseBatchSchema = {
  "$schema": "http://json-schema.org/schema#",
  "$id": "https://reconciliation-api.github.io/specs/latest/schemas/reconciliation-result-batch.json",
  "type": "object",
  "description": "This schema can be used to validate the JSON serialization of any reconciliation result batch.",
  "patternProperties": {
    "^.*$": {
      "type": "object",
      "properties": {
        "result": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Entity identifier of the candidate"
              },
              "name": {
                "type": "string",
                "description": "Entity name of the candidate"
              },
              "score": {
                "type": "number",
                "description": "Number indicating how likely it is that the candidate matches the query"
              },
              "features": {
                "type": "array",
                "description": "A list of features which can be used to derive a matching score",
                "items": {
                  "type": "object",
                  "properties": {
                    "id": {
                      "type": "string",
                      "description": "A unique string identifier for the feature"
                    },
                    "value": {
                      "description": "The value of the feature for this reconciliation candidate",
                      "oneOf": [
                        {
                          "type": "boolean"
                        },
                        {
                          "type": "number"
                        }
                      ]
                    }
                  }
                }
              },
              "match": {
                "type": "boolean",
                "description": "Boolean value indicating whether the candiate is a certain match or not."
              },
              "type": {
                "type": "array",
                "description": "Types the candidate entity belongs to",
                "items": {
                  "oneOf": [
                    {
                      "type": "object",
                      "description": "A type can be given by id and name",
                      "properties": {
                        "id": {
                          "type": "string"
                        },
                        "name": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "id"
                      ]
                    },
                    {
                      "type": "string",
                      "description": "Alternatively, if only a string is given, it is treated as the id"
                    }
                  ]
                }
              }
            },
            "required": [
              "id",
              "name",
              "score"
            ]
          }
        }
      },
      "required": [
        "result"
      ]
    }
  }
};

export const dataExtensionResponseSchema = {
  "$schema": "http://json-schema.org/schema#",
  "$id": "https://reconciliation-api.github.io/specs/latest/schemas/data-extension-response.json",
  "type": "object",
  "description": "This schema validates a data extension response",
  "properties": {
    "meta": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "type": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            },
            "required": [
              "id"
            ]
          }
        },
        "required": [
          "id",
          "name"
        ]
      }
    },
    "rows": {
      "type": "object",
      "patternProperties": {
        ".*": {
          "type": "object",
          "patternProperties": {
            ".*": {
              "type": "array",
              "items": {
                "oneOf": [
                  {
                    "type": "object",
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "description": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "id",
                      "name"
                    ],
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "properties": {
                      "str": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "str"
                    ],
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "properties": {
                      "float": {
                        "type": "number"
                      }
                    },
                    "required": [
                      "float"
                    ],
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "properties": {
                      "int": {
                        "type": "integer"
                      }
                    },
                    "required": [
                      "int"
                    ],
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "properties": {
                      "date": {
                        "type": "string",
                        "description": "Date and time formatted in ISO format",
                        "pattern": "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$"
                      }
                    },
                    "required": [
                      "date"
                    ],
                    "additionalProperties": false
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "required": [
    "rows",
    "meta"
  ]
};

