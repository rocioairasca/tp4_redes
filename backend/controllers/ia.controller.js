// importaciones de la biblioteca de google para utilizar la IA
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// le pasamos el modelo de productos para que realice estadísticas en base a este
const products = require('../models/Product');

const generateContent = async (req, res) => {
    // pasamos el modelo a una constante
    const data = await products.find();
    // console.log(data);

    // le damos un prompt detallado para que nos realice estadisticas específicas
    const prompt = 
    `Te voy a pasar un JSON que contiene una lista de productos: ${JSON.stringify(data)}. Necesito que, teniendo en cuenta unicamente las entradas que tengan isDisabled en false, me devuelvas un JSON con los campos "productoMasCaro", "productoMasBarato", 
    "cantidadTipoPolvo", "cantidadTipoLiquido". productoMasCaro se calcula viendo cual de los productos tiene el valor mas alto en el campo price, devolveme solo el valor name y price. productoMasBarato se calcula 
    viendo cual de los productos tiene el valor mas bajo en el campo price, devolveme solo el valor name y price. cantidadTipoPolvo se calcula sumando la cantidad de entradas de esa tabla cuyo type sea "Polvo".
    cantidadTipoLiquido se calcula sumando la cantidad de entradas de esa tabla cuyo type sea "Líquido". NO ME DES UNA EXPLICACIÓN DEL CÓDIGO, SOLO EL JSON.`;

    try {
        // Crea una instancia del cliente AI
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Genera el contenido
        const result = await model.generateContent(prompt);

        // Envía la respuesta
        res.json(result.response.text());
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al consultar la IA');
    }
};

// exportamos el módulo
module.exports = {
    generateContent,
};

