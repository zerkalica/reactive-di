#!/bin/sh

CWD=$(pwd)

for prj in $1 $2 $3 $4; do
    echo "Rebuilding $CWD/node_modules/$prj"
    cd $CWD/../$prj && \
        npm run build && \
        rm -rf $CWD/node_modules/$prj/dist && \
        cp -ra dist $CWD/node_modules/$prj/dist
    cd $CWD
done
