'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var graph = function () {
			function graph(dataName, timePerScreen, target) {
						_classCallCheck(this, graph);

						this.timePerScreen = timePerScreen;
						this.dataName = dataName;

						this.svg = target.append('svg');
						this.svg.attr('class', 'gs');
						this.path = this.svg.append('path');
						this.path.attr('class', 'gsPlotLine');
						this.coord = '';

						this.setXscale();
						this.drawID();
			}

			_createClass(graph, [{
						key: 'setXscale',
						value: function setXscale() {
									this.margeG = this.svg.style('font-size').slice(0, -2) * 2.1;
									this.margeD = this.svg.style('font-size').slice(0, -2) * .8;
									this.width = this.svg.style('width').slice(0, -2);

									this.echellex = d3.scale.linear().domain([0, this.timePerScreen]).range([this.margeG, this.width - this.margeD]);
						}
			}, {
						key: 'setYscale',
						value: function setYscale(dataSet) {
									var _this = this;

									var dsMin = d3.min(dataSet, function (d) {
												return d[_this.dataName];
									});
									var dsMax = d3.max(dataSet, function (d) {
												return d[_this.dataName];
									});

									var ymin = Math.min(0, dsMin);
									var ymax = Math.max(dsMax, -dsMin);

									if (ymax > 10) {
												ymax = Math.ceil(ymax / 5) * 5;
									}
									if (ymax < 10) {
												ymax = Math.ceil(ymax);
									}
									if (ymin < 0 && ymin > -10) {
												ymin = Math.floor(ymin);
									}
									if (ymin < -10) {
												ymin = Math.floor(ymin / 5) * 5;
									}

									this.margeB = this.svg.style('font-size').slice(0, -2) * 2;
									this.margeH = this.svg.style('font-size').slice(0, -2) * 1;
									this.height = this.svg.style('height').slice(0, -2);

									this.echelley = d3.scale.linear().domain([ymin, ymax]).range([this.height - this.margeB, this.margeH]);
						}
			}, {
						key: 'drawID',
						value: function drawID() {
									this.id = this.svg.append('text').attr('x', this.margeG + 5).attr('y', 18).attr('text-anchor', 'start').text(this.dataName);
						}
			}, {
						key: 'setNLf',
						value: function setNLf() {
									this.lf = function (d) {
												var l = d.length;
												if (l == 0) {
															throw 'graph.lf: no data to plot';
												}
												var point = d[l - 1];
												if (l == 0) {
															console.log('NLF: no data to plot');
												} else if (l == 1) {
															var string = 'M' + this.echellex(point.time - this.tStart) + ',' + this.echelley(point[this.dataName]);
												} else {
															var string = 'L' + this.echellex(point.time - this.tStart) + ',' + this.echelley(point[this.dataName]);
												}
												return string;
									};
						}
			}, {
						key: 'drawGradY',
						value: function drawGradY() {

									if (this.gradYGroup) {
												this.gradYGroup.remove();
									}
									this.gradY = d3.svg.axis().ticks(4).tickSize(5).orient("left").scale(this.echelley);

									this.gradYGroup = this.svg.append("g").attr("class", "gradY").attr("transform", "translate(" + this.margeG + ", 0)").call(this.gradY);

									return this;
						}
			}, {
						key: 'drawGradX',
						value: function drawGradX() {

									if (this.gradXGroup) {
												this.gradXGroup.remove();
									}
									this.gradX = d3.svg.axis().scale(this.echellex).orient('bottom')
									//.ticks(2)
									.tickValues(d3.range(2, this.timePerScreen, 2));

									this.gradXGroup = this.svg.append("g").attr("class", "gradX").attr("transform", "translate(0, " + this.echelley(0) + ")").call(this.gradX);
						}
			}, {
						key: 'replot',
						value: function replot(data) {
									var _this2 = this;

									var lf = d3.svg.line().x(function (d) {
												return _this2.echellex(d['time'] - _this2.tStart);
									}).y(function (d) {
												return _this2.echelley(d[_this2.dataName]);
									}).interpolate("linear");
									this.coord = lf(data);
									this.path.attr('d', this.coord);
						}
			}, {
						key: 'redraw',
						value: function redraw(scalingData, plotData) {
									this.setXscale();
									this.setYscale(scalingData);
									this.drawGradX();
									this.drawGradY();
									this.replot(plotData);
						}
			}]);

			return graph;
}();

var simulator = function () {
			function simulator() {
						_classCallCheck(this, simulator);

						this.debugMode = false;
						this.Tsampl = 20;
						this.ventTsampl = 0.005;
						this.target = d3.select(document.body);

						this.datasets = [{ name: 'Pao' }, { name: 'Flung' }, { name: 'PCO2' }];
						this.ventList = ['FlowControler', 'PressureControler', 'PressureAssistor', 'IPV', 'VDR'];
						this.lungList = ['SimpleLung', 'SptLung', 'SygLung', 'RLung'];

						this.ventList = ['FlowControler', 'PressureControler', 'PressureAssistor', 'IPV', 'VDR'];

						this.lungList = ['SimpleLung', 'SptLung', 'SygLung', 'RLung'];

						this.timePerScreen = 12;
						this.graphData = [];
						this.data = [];
						this.graphData = [];
						this.graphStack = [];
						this.tStart = 0;

						this.lung = new sv.SimpleLung();
						this.vent = new sv.FlowControler();

						this.ventUpdate();
			}

			_createClass(simulator, [{
						key: 'panelTitle',
						value: function panelTitle(content) {
									if (!this.panelDiv) {
												throw 'sim class: non panelDiv';
									}
									var title = document.createElement("h2");
									title.textContent = content;
									title.className = "fpPanelTitle";
									this.panelDiv.appendChild(title);
						}
			}, {
						key: 'lungMenu',
						value: function lungMenu() {
									var _this3 = this;

									this.lungSelect = document.createElement("select");
									this.lungSelect.id = "lungSelect";
									this.lungSelect.onchange = function () {
												return _this3.lungChange();
									};
									this.panelDiv.appendChild(this.lungSelect);

									var _iteratorNormalCompletion = true;
									var _didIteratorError = false;
									var _iteratorError = undefined;

									try {
												for (var _iterator = this.lungList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
															var lung = _step.value;

															var option = document.createElement("option");
															option.value = lung;
															option.textContent = lung;
															this.lungSelect.appendChild(option);
												}
									} catch (err) {
												_didIteratorError = true;
												_iteratorError = err;
									} finally {
												try {
															if (!_iteratorNormalCompletion && _iterator.return) {
																		_iterator.return();
															}
												} finally {
															if (_didIteratorError) {
																		throw _iteratorError;
															}
												}
									}

									this.lungSelect.selectedIndex = sv.lungs.indexOf(sv[this.lung.constructor.name]);
						}
			}, {
						key: 'ventMenu',
						value: function ventMenu() {
									var _this4 = this;

									this.ventSelect = document.createElement("select");
									this.ventSelect.id = "ventSelect";
									this.ventSelect.onchange = function () {
												return _this4.ventChange();
									};
									this.panelDiv.appendChild(this.ventSelect);

									var _iteratorNormalCompletion2 = true;
									var _didIteratorError2 = false;
									var _iteratorError2 = undefined;

									try {
												for (var _iterator2 = this.ventList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
															var vent = _step2.value;

															var option = document.createElement("option");
															option.value = vent;
															option.textContent = vent;
															this.ventSelect.appendChild(option);
												}
									} catch (err) {
												_didIteratorError2 = true;
												_iteratorError2 = err;
									} finally {
												try {
															if (!_iteratorNormalCompletion2 && _iterator2.return) {
																		_iterator2.return();
															}
												} finally {
															if (_didIteratorError2) {
																		throw _iteratorError2;
															}
												}
									}

									this.ventSelect.selectedIndex = this.ventList.indexOf(this.vent.constructor.name);
						}
			}, {
						key: 'ventChange',
						value: function ventChange() {
									this.nextVent = new sv[this.ventList[this.ventSelect.selectedIndex]]();
									this.nextVent.time = this.vent.time;
									this.vent = this.nextVent;
									this.ventUpdate();
									this.fillParamTable(this.vent, 'ventParams', this.ventTable);
						}
			}, {
						key: 'lungChange',
						value: function lungChange() {
									this.lung = new sv[this.lungList[this.lungSelect.selectedIndex]]();
									this.fillParamTable(this.lung, 'mechParams', this.lungTable);
						}
			}, {
						key: 'initPanel',
						value: function initPanel() {
									var _this5 = this;

									this.panelDiv = document.createElement('div');
									this.panelDiv.id = 'fpPanel';
									this.panelDiv.classList.add('hidden');
									document.body.appendChild(this.panelDiv);

									this.panelTitle('Ventilateur');

									this.ventMenu();
									this.ventTable = document.createElement('table');
									this.panelDiv.appendChild(this.ventTable);
									this.fillParamTable(this.vent, 'ventParams', this.ventTable);

									this.panelTitle('Poumon');
									this.lungMenu();
									this.lungTable = document.createElement('table');
									this.panelDiv.appendChild(this.lungTable);
									this.fillParamTable(this.lung, 'mechParams', this.lungTable);
									/*
         					 this.panelTitle('Monitorage');
         					 var text = document.createTextNode('Temps en réserve: ');
         					 this.panelDiv.append(text);
         					 this.spanDataMon = document.createElement('span');
         					 this.panelDiv.append(this.spanDataMon);
         					 var text = document.createTextNode('s');
         					 this.panelDiv.append(text);
         					 */

									/*
         this.panelTitle('Simulation');
         this.paramTable(this.ventilator, 'simParams', this.paramContainer, "Simulation"); 
         */
									this.buttonValidate = document.createElement('button');
									this.buttonValidate.textContent = 'Valider';
									this.buttonValidate.onclick = function () {
												return _this5.validate();
									};
									this.buttonValidate.disabled = true;
									this.panelDiv.appendChild(this.buttonValidate);

									// Gestion des racourcis clavier
									/*
         $("#panel input").keypress(function(event){
         		if (event.which == 13){ $("#ventiler").click(); }
         });
          $("input").change(function(){
         		this.updateModels();
         });
          $("input").keyup(function(){
         		this.updateModels();
         });
         */
						}
			}, {
						key: 'fillParamTable',
						value: function fillParamTable(object, paramSet, table) {
									var _this6 = this;

									if (typeof object[paramSet] == "undefined") {
												throw object.name + '[' + paramSet + '] does not exist';
									}

									while (table.hasChildNodes()) {
												table.removeChild(table.firstChild);
									}

									for (var id in object[paramSet]) {
												var param = object[paramSet][id];
												//var abrev = fp.translate1(id, "short");
												var abrev = id;

												if (typeof param.unit != "undefined") {
															var unit = param.unit;
												} else {
															var unit = "";
												}

												var tr = document.createElement('tr');
												table.appendChild(tr);

												// Parameter name cell

												var td = document.createElement('td');
												//td.title = fp.translate1(id, "long");
												td.title = id;
												td.textContent = abrev + ' :';
												tr.appendChild(td);

												/*
            var td = $("<td></td>")
            		  .attr("title", fp.translate1(id, "long"))
            		  .html(abrev + " :")
            		  .appendTo(tr);
            		  */

												// input or value cell

												var td = document.createElement('td');
												td.className = 'data';
												//td.title = fp.translate1(id, "long");

												if (param.calculated == true) {
															var value = Math.round(10 * this.vent[id]) / 10;
															var dataSpan = document.createElement('span');
															dataSpan.id = 'data' + id;
															dataSpan.textContent = value;
															td.appendChild(dataSpan);
												} else {
															var input = document.createElement('input');
															input.id = 'input' + id;
															input.name = id;
															input.value = object[id];
															input.type = 'number';
															input.step = param.step;
															input.onfocus = function () {
																		this.select();
															};
															input.onchange = function (evt) {
																		object[evt.target.name] = parseFloat(evt.target.value);
																		_this6.ventUpdate();
																		_this6.buttonValidate.disabled = false;
															};
															input.onkeyup = function (evt) {
																		_this6.buttonValidate.disabled = false;
															};
															td.appendChild(input);
												}
												tr.appendChild(td);

												// Parameter unit cell

												var td = document.createElement('td');
												td.className = 'unit';
												td.textContent = unit;
												tr.appendChild(td);

												// Push the row to the table

												table.appendChild(tr);
									}
						}
			}, {
						key: 'ventUpdate',
						value: function ventUpdate() {
									if (this.vent.Fconv) {
												this.vent.Tvent = 60 / this.vent.Fconv;
									};
									this.vent.Tsampl = this.ventTsampl;
									this.pointsPerMilliseconds = .001 / this.vent.Tsampl;
									this.pointsPerScreen = this.timePerScreen / this.vent.Tsampl;
						}
			}, {
						key: 'setYscale',
						value: function setYscale() {
									var dataSet = this.data.concat(this.graphData);

									var _iteratorNormalCompletion3 = true;
									var _didIteratorError3 = false;
									var _iteratorError3 = undefined;

									try {
												for (var _iterator3 = this.graphStack[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
															graph = _step3.value;

															graph.setYscale(dataSet);
															graph.drawGradY();
															graph.drawGradX();
															graph.setNLf();
												}
									} catch (err) {
												_didIteratorError3 = true;
												_iteratorError3 = err;
									} finally {
												try {
															if (!_iteratorNormalCompletion3 && _iterator3.return) {
																		_iterator3.return();
															}
												} finally {
															if (_didIteratorError3) {
																		throw _iteratorError3;
															}
												}
									}
						}
			}, {
						key: 'redraw',
						value: function redraw() {
									var scalingData = this.data.concat(this.graphData);

									var _iteratorNormalCompletion4 = true;
									var _didIteratorError4 = false;
									var _iteratorError4 = undefined;

									try {
												for (var _iterator4 = this.graphStack[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
															var graph = _step4.value;

															graph.redraw(scalingData, this.graphData);
												}
									} catch (err) {
												_didIteratorError4 = true;
												_iteratorError4 = err;
									} finally {
												try {
															if (!_iteratorNormalCompletion4 && _iterator4.return) {
																		_iterator4.return();
															}
												} finally {
															if (_didIteratorError4) {
																		throw _iteratorError4;
															}
												}
									}
						}
			}, {
						key: 'ventLoop',
						value: function ventLoop() {
									//this.spanDataMon.textContent = Math.round(this.data.length * this.vent.Tsampl * 10 )/10;
									if (this.data.length <= 2 / this.vent.Tsampl) {
												this.ventilate();
									}
						}
			}, {
						key: 'ventilate',
						value: function ventilate() {
									var newDat = this.vent.ventilate(this.lung).timeData;
									this.data = this.data.concat(newDat);
						}
			}, {
						key: 'validate',
						value: function validate() {
									document.activeElement.blur();
									this.buttonValidate.disabled = true;
						}
			}, {
						key: 'graphLoop',
						value: function graphLoop() {
									if (this.data.length == 0) {
												throw 'Stoped; no more data to plot.';
									}

									if (this.graphData.length >= this.pointsPerScreen) {

												if (this.debugMode == true) {
															this.loopEndTime = new Date();
															this.loopEndTime = this.loopEndTime.getTime();
															this.loopDuration = this.loopEndTime - this.loopStartTime;
															console.log(this.loopDuration);
															this.loopStartTime = new Date();
															this.loopStartTime = this.loopStartTime.getTime();
												}
												this.setYscale();
												this.tStart = this.data[0].time;
												this.tStartLoop = new Date().getTime();
												var _iteratorNormalCompletion5 = true;
												var _didIteratorError5 = false;
												var _iteratorError5 = undefined;

												try {
															for (var _iterator5 = this.graphStack[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
																		graph = _step5.value;

																		graph.tStart = this.tStart;
																		graph.coord = '';
															}
												} catch (err) {
															_didIteratorError5 = true;
															_iteratorError5 = err;
												} finally {
															try {
																		if (!_iteratorNormalCompletion5 && _iterator5.return) {
																					_iterator5.return();
																		}
															} finally {
																		if (_didIteratorError5) {
																					throw _iteratorError5;
																		}
															}
												}

												this.graphData = [];
									}

									this.curTime = new Date().getTime();
									this.timeToPlot = this.curTime - this.lastTime;
									this.pointsToPlot = this.timeToPlot / this.pointsPerMilliseconds;

									for (var i = 0; i < this.pointsToPlot; i++) {
												this.graphData.push(this.data.shift());
												if (this.graphData.length = 0) {
															throw 'no graph data';
												}
												var _iteratorNormalCompletion6 = true;
												var _didIteratorError6 = false;
												var _iteratorError6 = undefined;

												try {
															for (var _iterator6 = this.graphStack[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
																		var gr = _step6.value;

																		if (gr.coord == null) {
																					gr.coord = '';
																		}
																		var coord = gr.lf(this.graphData);
																		gr.coord = gr.coord + coord;
															}
												} catch (err) {
															_didIteratorError6 = true;
															_iteratorError6 = err;
												} finally {
															try {
																		if (!_iteratorNormalCompletion6 && _iterator6.return) {
																					_iterator6.return();
																		}
															} finally {
																		if (_didIteratorError6) {
																					throw _iteratorError6;
																		}
															}
												}
									}
									var _iteratorNormalCompletion7 = true;
									var _didIteratorError7 = false;
									var _iteratorError7 = undefined;

									try {
												for (var _iterator7 = this.graphStack[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
															var gr = _step7.value;

															gr.path.attr('d', gr.coord);
												}
									} catch (err) {
												_didIteratorError7 = true;
												_iteratorError7 = err;
									} finally {
												try {
															if (!_iteratorNormalCompletion7 && _iterator7.return) {
																		_iterator7.return();
															}
												} finally {
															if (_didIteratorError7) {
																		throw _iteratorError7;
															}
												}
									}
						}
			}, {
						key: 'graphLoopOld',
						value: function graphLoopOld() {
									if (this.data.length == 0) {
												throw 'Stoped; no more data to plot.';
									}

									if (this.graphData.length >= this.pointsPerScreen) {

												this.loopEndTime = new Date().getTime();
												this.loopDuration = this.loopEndTime - this.loopStartTime;
												this.loopStartTime = new Date().getTime();
												if (this.debugMode == true) {
															console.log(this.timePerScreen + 's plotted in ' + this.loopDuration / 1000 + 's');
												}
												this.setYscale();
												this.tStart = this.data[0].time;
												var _iteratorNormalCompletion8 = true;
												var _didIteratorError8 = false;
												var _iteratorError8 = undefined;

												try {
															for (var _iterator8 = this.graphStack[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
																		graph = _step8.value;

																		graph.tStart = this.tStart;
																		graph.coord = '';
															}
												} catch (err) {
															_didIteratorError8 = true;
															_iteratorError8 = err;
												} finally {
															try {
																		if (!_iteratorNormalCompletion8 && _iterator8.return) {
																					_iterator8.return();
																		}
															} finally {
																		if (_didIteratorError8) {
																					throw _iteratorError8;
																		}
															}
												}

												this.graphData = [];
									}

									this.timeInLoop = new Date().getTime() - this.loopStartTime;
									//if(this.debugMode == true){console.log('Time in loop: ' + this.timeInLoop)}
									this.targetNumPoints = Math.floor(this.timeInLoop * this.pointsPerMilliseconds);
									while (this.graphData.length < this.targetNumPoints) {
												//if(this.debugMode == true){console.log('graphdata.length: ' + this.graphData.length)}
												//if(this.debugMode == true){console.log('Target num points: ' + this.targetNumPoints)}
												this.graphData.push(this.data.shift());
												var _iteratorNormalCompletion9 = true;
												var _didIteratorError9 = false;
												var _iteratorError9 = undefined;

												try {
															for (var _iterator9 = this.graphStack[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
																		var gr = _step9.value;

																		if (gr.coord == null) {
																					gr.coord = '';
																		}
																		var coord = gr.lf(this.graphData);
																		gr.coord = gr.coord + coord;
															}
												} catch (err) {
															_didIteratorError9 = true;
															_iteratorError9 = err;
												} finally {
															try {
																		if (!_iteratorNormalCompletion9 && _iterator9.return) {
																					_iterator9.return();
																		}
															} finally {
																		if (_didIteratorError9) {
																					throw _iteratorError9;
																		}
															}
												}
									}
									var _iteratorNormalCompletion10 = true;
									var _didIteratorError10 = false;
									var _iteratorError10 = undefined;

									try {
												for (var _iterator10 = this.graphStack[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
															var gr = _step10.value;

															gr.path.attr('d', gr.coord);
												}
									} catch (err) {
												_didIteratorError10 = true;
												_iteratorError10 = err;
									} finally {
												try {
															if (!_iteratorNormalCompletion10 && _iterator10.return) {
																		_iterator10.return();
															}
												} finally {
															if (_didIteratorError10) {
																		throw _iteratorError10;
															}
												}
									}
						}
			}, {
						key: 'start',
						value: function start() {
									var _iteratorNormalCompletion11 = true;
									var _didIteratorError11 = false;
									var _iteratorError11 = undefined;

									try {
												for (var _iterator11 = this.datasets[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
															var ds = _step11.value;

															var gr = new graph(ds.name, this.timePerScreen, this.target);
															if (this.debugMode == true) {
																		gr.debugMode = true;
															}
															gr.tStart = 0;
															this.graphStack.push(gr);
												}
									} catch (err) {
												_didIteratorError11 = true;
												_iteratorError11 = err;
									} finally {
												try {
															if (!_iteratorNormalCompletion11 && _iterator11.return) {
																		_iterator11.return();
															}
												} finally {
															if (_didIteratorError11) {
																		throw _iteratorError11;
															}
												}
									}

									this.ventLoop();
									this.setYscale();
									this.startLoops();
						}
			}, {
						key: 'startLoops',
						value: function startLoops() {
									var _this7 = this;

									this.ventInt = setInterval(function () {
												return _this7.ventLoop();
									}, 500);
									if (this.debugMode == true) {
												this.loopStartTime = new Date();
												this.loopStartTime = this.loopStartTime.getTime();
									}
									this.tStartLoop = new Date().getTime();
									this.lastTime = new Date().getTime();
									this.graphInt = setInterval(function () {
												return _this7.graphLoopOld();
									}, this.vent.Tsampl * 1000);
						}
			}, {
						key: 'stop',
						value: function stop() {
									clearInterval(this.ventInt);
									clearInterval(this.graphInt);
									if (this.debugMode == true) {
												this.loopEndTime = new Date().getTime();
												this.loopDuration = this.loopEndTime - this.loopStartTime;
												console.log(this.graphData[this.graphData.length - 1].time + 's plotted in ' + this.loopDuration / 1000 + 's');
									}
						}
			}]);

			return simulator;
}();
