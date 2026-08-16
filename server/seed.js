const mongoose = require('mongoose');
const axios = require('axios');

// Connect to your local MongoDB instance (match database layout)
const MONGO_URI = 'mongodb://127.0.0.1:27017/aac';
const COLLECTION_NAME = 'animals';

// Define the schema mapping to the live Socrata JSON fields
const animalSchema = new mongoose.Schema({
    animal_id: String,
    name: String,
    breed: String,
    sex_upon_outcome: String,
    age_upon_outcome_in_weeks: Number,
    // Socrata provides location nested inside a location block or explicit fields
    location_latitude: Number,
    location_longitude: Number
}, { collection: COLLECTION_NAME });

const Animal = mongoose.model('Animal', animalSchema);

// Helper to clean raw strings and calculate explicit weeks like your Pandas script
function calculateWeeks(ageString) {
    if (!ageString) return 0;
    const match = ageString.match(/(\d+)\s+(year|month|week|day)/i);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit.includes('year')) return value * 52;
    if (unit.includes('month')) return value * 4.33;
    if (unit.includes('week')) return value;
    if (unit.includes('day')) return value / 7;
    return 0;
}

// Paginated Seeding Engine Loop
async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB... Starting data streaming.');

        const apiEndpoint = 'https://data.austintexas.gov/resource/9t4d-g238.json';
        const pageSize = 1000; // Socrata default pagination cap
        let offset = 0;
        let running = true;
        let totalInserted = 0;

        while (running) {
            console.log(`Fetching records ${offset} to ${offset + pageSize}...`);
            
            // Build URL with query limit tags 
            const response = await axios.get(`${apiEndpoint}?$limit=${pageSize}&$offset=${offset}`);
            const records = response.data;

            if (!records || records.length === 0) {
                running = false;
                break;
            }

            // Map incoming API columns to your specific model fields
            const cleanRecords = records.map(item => {
                // IMPORTANT NOTE: AAC dataset does NOT include location data for shelter animals
                // I am honestly not sure where the location data from the CS 340 Dashboard project came from
                // I have contacted the professor about this issue
                // As a TEMPORARY PLACEHOLDER I have generated a random scatter within 20 miles of the shelter
                
                const originLatitude = 30.2672;
                const originLongitude = -97.7431;

                const latitudeOffset = (Math.random() - 0.5) * 0.2;
                const longitudeOffset = (Math.random() - 0.5) * 0.2;

                const latitude = originLatitude + latitudeOffset;
                const longitude = originLongitude + longitudeOffset;
                
                return {
                    animal_id: item.animal_id,
                    name: item.name || 'Unnamed',
                    breed: item.breed,
                    sex_upon_outcome: item.sex_upon_outcome,
                    // Parse '3 years' or '2 months' into a clean numerical week metric
                    age_upon_outcome_in_weeks: calculateWeeks(item.age_upon_outcome),
                    // Pull explicit coordinates or safe default fallback coordinates near Austin
                    location_latitude: latitude,
                    location_longitude: longitude
                };
            });

            // Upsert / Insert batch into Mongo collection 
            await Animal.insertMany(cleanRecords);
            totalInserted += cleanRecords.length;

            // Shift cursor to next page data block
            offset += pageSize;
            
            // Optional break cap to prevent exhausting local storage during testing (e.g., 5000 rows)
            if (totalInserted >= 5000) {
                console.log('Target safety cap threshold hit.');
                break;
            }
        }

        console.log(`Success! Total records securely populated: ${totalInserted}`);
    } catch (error) {
        console.error('Seeding cycle aborted:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedDatabase();