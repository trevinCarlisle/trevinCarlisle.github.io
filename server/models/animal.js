const mongoose = require('mongoose');

// Defines imported data to avoid crashes
const animalSchema = new mongoose.Schema({
    name: String,
    breed: String,
    sex_upon_outcome: String,
    age_upon_outcome_in_weeks: Number,
    location_latitude: Number,   // TEMPORARY: randomly generated due to lack of location data in original dataset
    location_longitude: Number   // TEMPORARY: randomly generated due to lack of location data in original dataset
}, { collection: process.env.COLLECTION_NAME || 'animals' });

module.exports = mongoose.model('Animal', animalSchema, 'animals');