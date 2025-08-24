// =======================
// Datos de Distritos y Zonas
// =======================
const DATA = {
    "San Isidro": { zones: { "San Isidro Sur (Financiero)": 11781, "San Isidro Centro": 10850 } },
    "Miraflores": { zones: { "Malecon de Miraflores": 10800, "Parque Kennedy": 10200 } },
    "Santiago de Surco": { zones: { "Monterrico": 7800, "Chacarilla": 7400 } },
    "La Molina": { zones: { "La Molina Club": 7200, "La Planicie": 6900 } }
    // Agrega más distritos y zonas según necesites
};

// =======================
// Factores de Tasación
// =======================
const FACTORES = {
    antiguedad: { depreciacionAnual: 0.01, max: 0.3 },
    dormitorios: { base: 2, incremento: 0.08, max: 0.25 },
    banos: { base: 2, incremento: 0.06, max: 0.18 },
    areaLibre: { departamento: 0.25, casa: 0.4, terreno: 0.9 },
    tipoInmueble: { departamento: 1, casa: 1.12, terreno: 0.8 },
    eficiencia: { A: 1.10, B:1.05, C:1, D:0.95, E:0.9, F:0.85 },
    estado: { excelente:1.05, bueno:1, regular:0.9, remodelar:0.75 }
};

// =======================
// Elementos DOM
// =======================
const tipoSel = document.getElementById("tipo");
const distritoSel = document.getElementById("distrito");
const zonaSel = document.getElementById("zona");
const antiguedad = document.getElementById("antiguedad");
const piso = document.getElementById("piso");
const ascensor = document.getElementById("ascensor");
const dormitorios = document.getElementById("dormitorios");
const banos = document.getElementById("banos");
const areaConstruida = document.getElementById("areaConstruida");
const areaLibre = document.getElementById("areaLibre");
const areaTerreno = document.getElementById("areaTerreno");
const moneda = document.getElementById("moneda");
const estado = document.getElementById("estado");
const eficiencia = document.getElementById("eficiencia");
const resultado = document.getElementById("resultado");

// =======================
// Cargar Distritos
// =======================
Object.keys(DATA).forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    distritoSel.appendChild(opt);
});

// =======================
// Cargar Zonas según Distrito
// =======================
distritoSel.addEventListener("change", () => {
    zonaSel.innerHTML = '<option value="">Selecciona zona</option>';
    const dist = distritoSel.value;
    if(DATA[dist]?.zones){
        Object.keys(DATA[dist].zones).forEach(z => {
            const opt = document.createElement("option");
            opt.value = z;
            opt.textContent = z;
            zonaSel.appendChild(opt);
        });
    }
});

// =======================
// Habilitar/Deshabilitar campos según tipo
// =======================
tipoSel.addEventListener("change", () => {
    const t = tipoSel.value;
    if(t==="departamento"){
        antiguedad.disabled=false; piso.disabled=false; ascensor.disabled=false;
        dormitorios.disabled=false; banos.disabled=false;
        areaConstruida.disabled=false; areaLibre.disabled=false; areaTerreno.disabled=true;
        estado.disabled=false; eficiencia.disabled=false;
    } else if(t==="casa"){
        antiguedad.disabled=false; piso.disabled=true; ascensor.disabled=true;
        dormitorios.disabled=false; banos.disabled=false;
        areaConstruida.disabled=false; areaLibre.disabled=false; areaTerreno.disabled=false;
        estado.disabled=false; eficiencia.disabled=false;
    } else if(t==="terreno"){
        antiguedad.disabled=false; piso.disabled=true; ascensor.disabled=true;
        dormitorios.disabled=true; banos.disabled=true;
        areaConstruida.disabled=true; areaLibre.disabled=true; areaTerreno.disabled=false;
        estado.disabled=true; eficiencia.disabled=true;
    } else {
        antiguedad.disabled=true; piso.disabled=true; ascensor.disabled=true;
        dormitorios.disabled=true; banos.disabled=true;
        areaConstruida.disabled=true; areaLibre.disabled=true; areaTerreno.disabled=true;
        estado.disabled=true; eficiencia.disabled=true;
    }
});

// =======================
// Función de Cálculo
// =======================
function calcular(){
    const t = tipoSel.value;
    const dist = distritoSel.value;
    const z = zonaSel.value;
    if(!t || !dist || !z){
        alert("Selecciona tipo, distrito y zona");
        return;
    }

    let base = DATA[dist].zones[z]; // precio base por m²

    // Área
    let area = 0;
    if(t==="departamento" || t==="casa"){
        area = Number(areaConstruida.value) + Number(areaLibre.value)*FACTORES.areaLibre[t];
    } else if(t==="terreno"){
        area = Number(areaTerreno.value);
    }

    let precio = base * area * FACTORES.tipoInmueble[t];

    // Antiguedad
    const dep = Math.min(antiguedad.value*FACTORES.antiguedad.depreciacionAnual, FACTORES.antiguedad.max);
    precio *= (1 - dep);

    // Dormitorios
    if(t==="departamento" || t==="casa"){
        let incDorm = Math.min((dormitorios.value-FACTORES.dormitorios.base)*FACTORES.dormitorios.incremento, FACTORES.dormitorios.max);
        precio *= (1+incDorm);
    }

    // Baños
    if(t==="departamento" || t==="casa"){
        let incBanos = Math.min((banos.value-FACTORES.banos.base)*FACTORES.banos.incremento, FACTORES.banos.max);
        precio *= (1+incBanos);
    }

    // Estado y eficiencia
    if(t!=="terreno"){
        precio *= FACTORES.estado[estado.value] || 1;
        precio *= FACTORES.eficiencia[eficiencia.value] || 1;
    }

    // Precio mínimo, medio, máximo ±10%
    const min = precio*0.9;
    const med = precio;
    const max = precio*1.1;

    resultado.innerHTML = `Precio Mínimo: ${moneda.value} ${min.toFixed(2)} <br>
                           Precio Medio: ${moneda.value} ${med.toFixed(2)} <br>
                           Precio Máximo: ${moneda.value} ${max.toFixed(2)}`;
}

// =======================
// Form submit
// =======================
document.getElementById("calc").addEventListener("submit", e=>{
    e.preventDefault();
    calcular();
});
