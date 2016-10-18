#!/bin/bash

rm -rf resources/public/js/compiled/
lein cljsbuild once min
npm run build
