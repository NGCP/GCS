#!/bin/bash

if [ -z $1 ]; then
  echo "ERROR: Expecting an argument (success/failure) but got none"
  exit 1
fi

if [[ $TRAVIS_BRANCH != 'master' ]]; then
  echo "INFO: Not the master branch, will not send webhook"
  exit 0
fi

echo "INFO: On master branch, sending webhook"
wget https://raw.githubusercontent.com/DiscordHooks/travis-ci-discord-webhook/master/send.sh
chmod +x send.sh
./send.sh $1 $WEBHOOK_URL
