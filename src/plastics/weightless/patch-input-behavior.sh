#!/bin/bash
cd ../../../node_modules/weightless/behavior/input/
patch --forward -s input-behavior.d.ts < ../../../../src/plastics/weightless/input-behavior.d.ts.patch || true
#patch input-behavior.d.ts < ../../../../src/plastics/weightless/input-behavior.d.ts.patch
