#!/usr/bin/env node
'use strict';


import commander from 'commander';
import glob from 'glob';

import Collector from './collector';
import { JsShrkinker, CssShrkinker, HtmlShrkinker } from './shrinkers';

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
