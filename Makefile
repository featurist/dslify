all: compile test

compile:
	./node_modules/.bin/pogo -c index.pogo

test:
	./node_modules/.bin/mocha test/*test.pogo

.PHONY: test