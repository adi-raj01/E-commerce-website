require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Setup
const uploadDir = path.join(__dirname, 'upload', 'images');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use(express.json());
app.use(cors());
app.use('/image', express.static(uploadDir));

// MongoDB connection
mongoose.connect("mongodb+srv://shopper:090909@cluster2.ydlvw.mongodb.net/")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Multer storage setup
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// Models
const Product = mongoose.model('Product', new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true }
}));

const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    cartData: { type: Map, of: Number },
    date: { type: Date, default: Date.now }
}));

// Middleware
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ errors: "No token provided" });
    try {
        req.user = jwt.verify(token, 'secret_ecom').user;
        next();
    } catch (error) {
        res.status(401).json({ errors: "Invalid token" });
    }
};

// Routes
app.get("/", (req, res) => res.send("Express App is Running"));

app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: 0, message: 'No file uploaded' });
    res.json({ success: 1, image_url: `http://localhost:${port}/image/${req.file.filename}` });
});

app.post('/addproduct', async (req, res) => {
    try {
        const { id,name, image, category, new_price, old_price } = req.body;

        if (!name || !image || !category || new_price === undefined || old_price === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const product = new Product({
            id,
            name,
            image,
            category,
            new_price,
            old_price
        });

        await product.save();
        res.json({
            success: true,
            name,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to add product' });
    }
});

app.post('/removeproduct', async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'Missing ID' });
    try {
        const result = await Product.findOneAndDelete({ id });
        if (!result) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, name: result.name });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to remove product' });
    }
});

app.get('/allproducts', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ success: false, errors: "Email exists" });
    const cart = {};
    for (let i = 0; i < 300; i++) cart[i] = 0;
    const user = new User({ name, email, password, cartData: cart });
    await user.save();
    const token = jwt.sign({ user: { id: user._id } }, 'secret_ecom');
    res.json({ success: true, token });
});


app.post('/login',async(req,res)=>{
    let user=await User.findOne({email:req.body.email});
    if(user){
        const passCompare= req.body.password===user.password;
        if(passCompare){
            const data = {
                user:{
                    id:user.id
                }}
                const token =jwt .sign (data,'secret_ecom')
                res.json ({success:true,token});
            
        }else{
            res.json({sucess:false,errors:"Wrong password"});
        }
    }
    else{
        res.json({
            success:false,errors:"Wrong Email Id"
        })
    }
})

app.get('/newcollections', async (req, res) => {
    const products = await Product.find({});
    res.json(products.slice(-8));
});

app.get('/popularinwomen', async (req, res) => {
    const products = await Product.find({ category: "women" });
    res.json(products.slice(0, 4));
});

app.post('/addtocart', fetchUser, async (req, res) => {
    const { itemId } = req.body;
    const user = await User.findById(req.user.id);
    user.cartData.set(itemId, user.cartData.get(itemId) + 1);
    await user.save();
    res.send("Added");
});

app.post('/removefromcart', fetchUser, async (req, res) => {
    const { itemId } = req.body;
    const user = await User.findById(req.user.id);
    if (user.cartData.get(itemId) > 0) {
        user.cartData.set(itemId, user.cartData.get(itemId) - 1);
        await user.save();
    }
    res.send("Removed");
});

app.post('/getcart', fetchUser, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json(user.cartData);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});

app.listen(port, () => console.log(`Server Running on Port ${port}`));
