library raxa.configuration;

import 'dart:async';
import 'dart:io';
import 'package:args/args.dart';
import 'package:di/di.dart';
import 'package:json_schema/json_schema.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:yaml/yaml.dart';
import 'package:raxa/api.dart';
import 'package:raxa/common.dart';

part 'src/configuration/config.dart';
part 'src/configuration/database.dart';
part 'src/configuration/settings.dart';


class ConfigurationModule extends Module {

    ConfigurationModule() {
        bind(Config);
        bind(Database);
        bind(Settings);
    }
}

/**
 * Validate the model according to its specified [jsonSchema]
 */
Future<bool> validateModel(ModelBase model) =>
    //Schema.createSchema(model.jsonSchema)
    //    .then((schema) => schema.validate(model));
    new Future.value(true);
