import { sql } from '../config/db.js';

export const getAllProducts = async (req, res) => {
    try {
        const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching products:', error.message, error.stack);
        res.status(500).json({ succses:false, message: 'Internal server error', error: error.message });
    }
};

export const createProduct = async (req, res) => {
    const { name, image, price } = req.body;
    if (!name || !image || !price) {
        return res.status(400).json({ succses:false, message: 'Please provide name, image, and price' });
    }
    if (typeof price !== 'number') {
        return res.status(400).json({ succses:false, message: 'Price must be a number' });
    }
    try {
        const newProduct = await sql`INSERT INTO products (name, image, price) VALUES (${name}, ${image}, ${price}) RETURNING *`;
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.error('Error creating product:', error.message, error.stack);
        res.status(500).json({ succses:false, message: 'Internal server error', error: error.message });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await sql`SELECT * FROM products WHERE id = ${id}`;
        if (product.length === 0) {
            return res.status(404).json({ succses:false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product[0] });
    } catch (error) {
        console.error('Error fetching product:', error.message, error.stack);
        res.status(500).json({ succses:false, message: 'Internal server error', error: error.message });
    }
};
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, image, price } = req.body;
    if (!name || !image || !price) {
        return res.status(400).json({ succses:false, message: 'Please provide name, image, and price' });
    }
    if (typeof price !== 'number') {
        return res.status(400).json({ succses:false, message: 'Price must be a number' });
    }
    try {
        const updatedProduct = await sql`UPDATE products SET name = ${name}, image = ${image}, price = ${price} WHERE id = ${id} RETURNING *`;
        if (updatedProduct.length === 0) {
            return res.status(404).json({ succses:false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: updatedProduct[0] });
    } catch (error) {
        console.error('Error updating product:', error.message, error.stack);
        res.status(500).json({ succses:false, message: 'Internal server error', error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await sql`DELETE FROM products WHERE id = ${id} RETURNING *`;
        if (deletedProduct.length === 0) {
            return res.status(404).json({ succses:false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: deletedProduct[0] });
    } catch (error) {
        console.error('Error deleting product:', error.message, error.stack);
        res.status(500).json({ succses:false, message: 'Internal server error', error: error.message });
    }
};

