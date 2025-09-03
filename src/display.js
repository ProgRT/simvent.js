export class display {

    push (data) {
        data = this.convUnits(data);

        let Tsampl = data[1].time - data[0].time;
		this.pstPerScr = this.timePerScreen / Tsampl;

		this.ptPerMs = .001 / Tsampl
        this.data = [...this.data, ...data];

        this.setYscale();
        if (this.grData.length > 0) this.redraw();
    }
}
