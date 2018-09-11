#!/bin/bash
localDirectory=`pwd`
rm -rf node_modules
npm install
npm test
osascript -e "tell application \"Terminal\" to do script \"cd $localDirectory; ./buildIOS.sh\""
osascript -e "tell application \"Terminal\" to do script \"cd $localDirectory; ./buildAndroid.sh\""
