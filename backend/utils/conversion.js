// funcion para convertir unidades en caso de que se pasaran en cc o g para poder restar o sumar correctamente
function convertToCommonUnit(amount, unit, productType) {
    const conversionRates = {
        liquid: {
            ccToL: 0.001,
            lToCc: 1000,
        },
        solid: {
            gToKg: 0.001,
            kgToG: 1000,
        },
    };

    if (productType === 'liquido') {
        if (unit === 'cc') {
            return amount * conversionRates.liquid.ccToL;
        } else if (unit === 'l') {
            return amount;
        }
    } else if (productType === 'polvo') {
        if (unit === 'g') {
            return amount * conversionRates.solid.gToKg;
        } else if (unit === 'kg') {
            return amount;
        }
    }

    return amount;
}

module.exports = { convertToCommonUnit };