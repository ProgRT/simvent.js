export function sygY(x, ymin, ymax, xid, kid){
	return ymin + (ymax - ymin)/(1.0+Math.exp(-(x - xid)/kid))
};

export function sygX(y, ymin, ymax, xid, kid){
	return xid - (kid * Math.log(((ymax - ymin)/(y - ymin))-1));
};
