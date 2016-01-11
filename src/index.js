#!/usr/bin/env node
'use strict';


import commander from 'commander';
import glob from 'glob';

import Collector from './collector';

import JsShrkinker from './shrinkers/js-shrinker';
import CssShrkinker from './shrinkers/css-shrinker';
import HtmlShrkinker from './shrinkers/html-shrinker';

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
