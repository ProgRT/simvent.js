.PHONY: nothing clean dev

nothing:
	@echo Please enter a target. No default target in this makefile.

dev:
	foot jekyll serve &
	firefox http://localhost:4000 &

clean:
	rm -R _site
