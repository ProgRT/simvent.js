export function exalations(data) {
  var peakEx = peakDim(data, (d) => d.Flung);
  var endEx = minDim(data, (d) => d.Flung);

  return peakEx
    .filter((d, i) => i < endEx.length)
    .map((d, i, a) => {
      let start = d;
      let end = endEx[i];
      let Tlow = end.time - start.time;
      let midPoint = start.time + 0.5 * Tlow;

      return {
        start: start,
        end: end,
        flowRatio: end.Flung / start.Flung,
        Vt: start.Vabs - end.Vabs,
        Tlow: Tlow,
        midPoint: midPoint
      };
    });
}

function sigPosToNeg( data, accessor, { nneibors = 100, peakSensitivity = 0.05 } = {}) {
  var derivated = deriv(data, accessor).map((d) => 1000 * d);
  return Object.keys(derivated).filter((d, i, a) => {
    let neibors = derivated.slice(i - nneibors, i + nneibors);
    return (
      Math.min(...neibors) == derivated[i] &&
      derivated[i] < peakSensitivity * Math.min(...derivated)
    );
  });
}

function sigNegToPos( data, accessor, { nneibors = 100, peakSensitivity = 0.05 } = {}) {
  var derivated = deriv(data, accessor);
  return Object.keys(derivated).filter((d, i, a) => {
    let neibors = derivated.slice(i - nneibors, i + nneibors);
    return (
      Math.max(...neibors) == derivated[i] &&
      derivated[i] > peakSensitivity * Math.max(...derivated)
    );
  });
}

function peakDim(data, accessor) {
  return sigPosToNeg(data, accessor).map((d) => data[d]);
}

function minDim(data, accessor) {
  return sigNegToPos(data, accessor).map((d) => data[d - 1]);
}

export function deriv(data, accessor=d=>d) {
  return data.map(accessor).map((d, i, t) => {
    return i > 0 ? t[i] - t[i - 1] : 0;
  });
}
