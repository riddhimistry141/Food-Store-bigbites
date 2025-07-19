const mongoose = require('mongoose');
const Food = require('./models/FoodModel'); // Import your Food model

// Connect to MongoDB
mongoose.connect('mongodb+srv://sam:sam@cluster0.fgzbul2.mongodb.net/bigbytes', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Array of food items to be seeded (with _id and __v removed)
const seedFoods = [
    {
        name: 'Pizza',
        price: 400,
        image: 'https://recipesblob.oetker.in/assets/d8a4b00c292a43adbb9f96798e028f01/1272x764/pizza-pollo-arrostojpg.jpg'
    },
    {
        name: 'Burger',
        price: 150,
        image:  'https://t4.ftcdn.net/jpg/02/74/99/01/360_F_274990113_ffVRBygLkLCZAATF9lWymzE6bItMVuH1.jpg alt='burger''
    },
    {
        name: 'Sushi',
        price: 250,
        image: 'https://cdn.openart.ai/published/2YSXkWZk5AKX50ZWLGwo/q46NrWKO_jLED_1024.webp'
    },
    {
        name: 'Pasta',
        price: 300,
        image: 'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2021/02/05/Baked-Feta-Pasta-4_s4x3.jpg.rend.hgtvcom.1280.720.suffix/1615916524567.webp'
    }
];

// Function to seed the database
async function seedDB() {
    try {
        // Clear existing foods in the collection
        await Food.deleteMany({});
        console.log('Existing food items removed');

        // Insert the new seed food items
        await Food.insertMany(seedFoods);
        console.log('Database seeded with food items');

    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        // Close the database connection
        mongoose.connection.close();
    }
}

// Run the seed function
seedDB();
