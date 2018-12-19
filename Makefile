VPATH = css _sass src lib dist test
LEGACYFY = babel --presets es2015 -o dist/
MINIFY = 

.PHONY: nothing css js legacy

nothing:
	@echo Please enter a target. No default target in this makefile.

css: css/fp-demo.css css/fp-mobile.css

js: dist/simvent.min.js dist/graphsimple.min.js dist/ventyaml.min.js

# ----------
# CSS things
# ----------

SalleDeJeux.css: SalleDeJeux.sass
	sass $< css/$(@)

fp-scratch.css: fp-scratch.sass
	sass $< css/$(@)

gs-scratch.css: gs-scratch.sass
	sass $< css/$(@)

gs-annotate.css: gs-annotate.sass
	sass $< css/$(@)

# --------------
# Legacification
# --------------

simvent-legacy.js: simvent.js
	$(LEGACYFY)$(@F) $<

animation-legacy.js: animation.js
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

graphsimple.min.js: graphsimple-legacy.js d3.v3.min.js
	uglifyjs -mc -o dist/$(@F) lib/d3.v3.min.js dist/graphsimple-legacy.js

frontPanel.min.js: frontPanel-legacy.js jquery.min.js dygraph-combined.js synchronizer.js
	uglifyjs -mc -o dist/$(@F) $?
