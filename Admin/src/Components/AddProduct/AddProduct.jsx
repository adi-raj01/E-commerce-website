import React, { useState } from 'react';
import './AddProduct.css';
import upload_area from '../../assets/Admin_Assets/upload_area.svg';

const AddProduct = () => {
    const [file, setFile] = useState(null);
    const [productDetails, setProductDetails] = useState({
        id:"",
        name: "",
        image: "",
        category: "",
        new_price: "",
        old_price: "",
    });
    const [image, setImage] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setImage(selectedFile);
        }
    };

    const changeHandler = (e) => {
        setProductDetails({
            ...productDetails,
            [e.target.name]: e.target.value
        });
    };

    const addProduct = async () => {
        console.log(productDetails);
        let responseData;

        const formData = new FormData();
        formData.append('product', file);

        try {
            const uploadResponse = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });

            if (!uploadResponse.ok) throw new Error('Failed to upload image');

            responseData = await uploadResponse.json();

            if (responseData.success) {
                const productWithImage = {
                    ...productDetails,
                    image: responseData.image_url
                };

                const addProductResponse =
                 fetch('http://localhost:3000/addproduct', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify(productWithImage),
                });

                const addProductData = await addProductResponse.json();

                if (addProductData.success) {
                    alert("Product Added");
                } else {
                    alert("Failed to add product");
                }
            } else {
                alert("Failed to upload image");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        }
    };

    return (
        <div className="add-product">
            <div className="addproduct-itemfield">
                <p>Product title</p>
                <input 
                    value={productDetails.name} 
                    onChange={changeHandler} 
                    type="text" 
                    name='name' 
                    placeholder='Type Here' 
                />
            </div>
            <div className="addproduct-price">
                <div className="addproduct-itemfield">
                    <p>Price</p>
                    <input 
                        value={productDetails.old_price} 
                        onChange={changeHandler} 
                        type="text" 
                        name='old_price' 
                        placeholder='Type Here' 
                    />
                </div>
                <div className="addproduct-itemfield">
                    <p>Offer Price</p>
                    <input 
                        value={productDetails.new_price} 
                        onChange={changeHandler} 
                        type="text" 
                        name='new_price' 
                        placeholder='Type Here' 
                    />
                </div>
            </div>
            <div className="addproduct-itemfield">
                <p>Product Category</p>
                <select 
                    value={productDetails.category} 
                    onChange={changeHandler} 
                    name='category' 
                    className='add-product-selector'
                >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kid">Kid</option>
                </select>
            </div>
            <div className="addproduct-itemfield">
                <label htmlFor='file-input'>
                    <img 
                        src={image ? URL.createObjectURL(image) : upload_area} 
                        alt="Upload Area" 
                        className='addproduct-thumbnail-img' 
                    />
                </label>
                <input 
                    type="file" 
                    name='image' 
                    id='file-input' 
                    hidden 
                    onChange={handleFileChange} 
                />
            </div>
            <button onClick={addProduct} className='addproduct-btn'>ADD</button>
        </div>
    );
};

export default AddProduct;
