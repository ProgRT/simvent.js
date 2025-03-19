
export const senario = [
{
    title: "Ratio inversé",
    instructions: `Ajuster le temps inspiratoire et la fréquence afin
    que le ratio inspiration:expiration soir inversé (temps inspiratoire
    > temps expiratoire).`,
    test: (data, vent, lung) => {
        return vent.Ti > vent.Te;
    },
    completed: false
},
{
    title: "Ventilation protectrice",
    instructions: `Ajuster un volume courant de <em>300 ml</em>`,
    test: (data, vent, lung) => {
        return vent.Vt == 0.3;
    },
    completed: false
}
];
