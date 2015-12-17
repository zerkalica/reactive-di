#!/bin/sh

PROJECT_NAME=$1
CWD=$(realpath $(dirname $0))

if [ "$PROJECT_NAME" = "" ] ; then
    echo "Provide project name"
    exit 1
fi

if [ ! -e "$(pwd)/package.json" ] ; then
    echo "$(pwd)/package.json not found in current directory"
    exit 1
fi

cp -f $CWD/git-hooks/* .git/hooks
