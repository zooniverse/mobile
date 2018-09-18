#!/bin/bash
cd "android"
bundle install
bundle exec fastlane beta increment_type:$1