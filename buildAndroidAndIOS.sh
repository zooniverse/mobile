#!/bin/bash
# This script accepts one parameter as either: major, minor, patch

localDirectory=`pwd`
rm -rf node_modules
npm install
npm test
if [ $# -eq 0 ] || ([ $1 != "major" ] && [ $1 != "minor" ] && [ $1 != "patch" ]);
then 
    buildNumber="patch"
else 
    buildNumber=$1
fi

osascript -e "tell application \"Terminal\" to do script \"cd $localDirectory; ./buildIOS.sh $buildNumber\""
osascript -e "tell application \"Terminal\" to do script \"cd $localDirectory; ./buildAndroid.sh $buildNumber\""
