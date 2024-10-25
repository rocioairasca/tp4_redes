import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Products = () => {
    //const [products, setProducts] = useState([]);
    //const [product, setProduct] = useState({ name: '', type: '', quantity: '' });
    //const [editMode, setEditMode] = useState(false);
    //const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/products/inventory');
            //setProducts(response.data);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
        }
    };



    return (
        <div>
            
        </div>
    );
};

export default Products;