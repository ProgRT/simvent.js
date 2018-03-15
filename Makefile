VPATH = css _sass src lib dist test
LEGACYFY = babel --presets es2015 -o dist/
MINIFY = 

.PHONY: nothing css js

nothing:
	@echo Please enter a target. No default target in this makefile.

css: css/fp-demo.css css/fp-mobile.css

js: dist/simvent.min.js dist/graphsimple.min.js dist/ventyaml.min.js

# ----------
# CSS things
# ----------

fp-scratch.css: fp-scratch.sass
	sass $< css/$@

# ------------
# Random tests
# ------------

article.html: head.html article.md tail.html
	cat test/head.html > test/$(@F)
	kramdown test/article.md >> test/$(@F)
	cat test/tail.html >> test/$(@F)
	
# --------------
# Legacification
# --------------

simvent-legacy.js: simvent.js
	$(LEGACYFY)$(@F) $<

ventyaml-legacy.js: ventyaml.js
	$(LEGACYFY)$(@F) $<

frontPanel-legacy.js: frontPanel.js
	$(LEGACYFY)$(@F) $<

graphsimple-legacy.js: graphsimple.js
	$(LEGACYFY)$(@F) $<

# --------------
# Packaging
# --------------

simvent.min.js: simvent-legacy.js
	uglifyjs -mc -o dist/$(@F) $<

ventyaml.min.js: dist/ventyaml-legacy.js lib/yaml.min.js
	uglifyjs -mc -o dist/$(@F) $?

graphsimple.min.js: dist/graphsimple-legacy.js \lib/d3.v3.min.js
	uglifyjs -mc -o dist/$(@F) $?

frontPanel.min.js: frontPanel-legacy.js \
	jquery.min.js \
	dygraph-combined.js \
	synchronizer.js
	uglifyjs -mc -o dist/$(@F) $?
