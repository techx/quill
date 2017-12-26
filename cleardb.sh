#!/bin/bash
mongo admin --eval "db.dropDatabase()"
mongo test --eval "db.dropDatabase()"
mongo config --eval "db.dropDatabase()"
mongo local --eval "db.dropDatabase()"
