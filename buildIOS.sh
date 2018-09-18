#!/bin/bash
cd "ios"
bundle install
bundle exec fastlane beta increment_type:$1