export const Vc = {
    label: 'Vc',
        unit: 'ml',
        updateCodition: (d)=>{
            if(d.length > 2){
                return d[d.length-1].Flung > 0 && d[d.length-2].Flung < 0;
            }
        },
        value: data=> (1000 * data[data.length-2].Vte).toFixed(0)
}
