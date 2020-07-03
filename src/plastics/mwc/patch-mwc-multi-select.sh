#!/bin/bash
cp ../../../node_modules/@material/mwc-select/src/mwc-select-base.ts ./
cp mwc-select-base.ts mwc-multi-select-base.ts
patch mwc-multi-select-base.ts < multi-select-base.patch
