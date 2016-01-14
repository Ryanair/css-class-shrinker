#!/usr/bin/env node
'use strict';


import commander from 'commander';

import Collector from './collector';

import JsShrinker from './shrinkers/js-shrinker';
import CssShrinker from './shrinkers/css-shrinker';
import HtmlShrinker from './shrinkers/html-shrinker';

/**
 * @param {Type}
 * @return {Type}
 */
export default function() {
  // TODO: read arguments from the command line
  // TODO: configure the script based on such arguments
  // TODO: run the Collector passing it necessary options
  // TODO: run the necessary shrinkers

  return true;
}
