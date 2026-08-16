require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Animal = require('./models/Animal');

const app = express();
const PORT = process.env.PORT || 5000;;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// Connect to database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB via secure .env configurations.'))
  .catch(err => console.error('Database connection failed:', err
));

// GET API route, deduplicates and paginates server-side data
app.get('/api/animals', async (req, res) => {
    const filterType = req.query.type || 'All Breeds';
    const page = parseInt(req.query.page) || 1; // Read target page (defaults to page 1)
    const limit = 10; // Cap page views to 10 per page for readability
    const skipValue = (page - 1) * limit; // Calculate how many records to skip
    
    // Column sub-header keyword inputs
    const searchName = req.query.name || '';
    const searchBreed = req.query.breed || '';
    const searchSex = req.query.sex || '';
    const searchAge = req.query.age || '';

    // Column sort parameters
    const sortBy = req.query.sortBy || '';
    const sortOrder = req.query.sortOrder || '';

    console.log(`Processing filter: ${filterType} | Page: ${page}`);
    
    // Core lookup parameters container block query object
    let dbQuery = {};

    // Profile filters
    if (filterType === 'Water Rescue') {
        dbQuery = {
            breed: { $regex: /Labrador Retriever|Chesa Bay Retr|Newfoundland/i },
            sex_upon_outcome: 'Intact Female',
            age_upon_outcome_in_weeks: { $gte: 26, $lte: 156 }
        };
    } else if (filterType === 'Mountain or Wilderness Rescue') {
        dbQuery = {
            breed: { $regex: /German Shepherd|Alaskan Malamute|Old English Sheepdog|Siberian Husky|Rottweiler/i },
            sex_upon_outcome: 'Intact Male',
            age_upon_outcome_in_weeks: { $gte: 26, $lte: 156 }
        };
    } else if (filterType === 'Disaster or Individual Tracking') {
        dbQuery = {
            breed: { $regex: /Doberman Pinsch|German Shepherd|Golden Retriever|Bloodhound|Rottweiler/i },
            sex_upon_outcome: 'Intact Male',
            age_upon_outcome_in_weeks: { $gte: 20, $lte: 300 }
        };
    } // 'All Breeds' selected when no rescue animal filter is selected

    // Header search bar filters
    if (searchName) {
        dbQuery.name = { $regex: searchName, $options: 'i' }; // Case-insensitive text search
    }

    if (searchBreed) {
        // If profile filter already targeted breeds, override or narrow down safely
        dbQuery.breed = { $regex: searchBreed, $options: 'i' }; // Case-insensitive text search
    }

    if (searchSex) {
        dbQuery.sex_upon_outcome = { $regex: searchSex, $options: 'i' }; // Case-insensitive text search
    }

    if (searchAge) {
        const ageNum = parseInt(searchAge, 10);
        // Finds any animals that are AT LEAST this many weeks old (handles floats safely)
        dbQuery.age_upon_outcome_in_weeks = { $gte: ageNum };
    }

    // Dynamic sort ordering
    let sortStage = {};
    if (sortBy) {
        sortStage[sortBy] = (sortOrder === 'desc') ? -1 : 1;
    } else {
        sortStage['name'] = 1; // Default safe fallback
    }

    try {
        // MongoDB Aggregation pipeline tool array
        const aggregationResult = await Animal.aggregate([
            // Apply profile rules and header keyword string filters
            { $match: dbQuery }, 
            
            // Deduplicate matching rows by grouping uniquely by the animal_id field
            { 
                $group: {
                    _id: "$animal_id", 
                    docId: { $first: "$_id" }, 
                    name: { $first: "$name" },
                    breed: { $first: "$breed" },
                    sex_upon_outcome: { $first: "$sex_upon_outcome" },
                    age_upon_outcome_in_weeks: { $first: "$age_upon_outcome_in_weeks" },
                    location_latitude: { $first: "$location_latitude" },
                    location_longitude: { $first: "$location_longitude" }
                }
            },

            // Project properties back to standard keys
            { 
                $project: {
                    _id: "$docId",
                    animal_id: "$_id",
                    name: 1,
                    breed: 1,
                    sex_upon_outcome: 1,
                    age_upon_outcome_in_weeks: 1,
                    location_latitude: 1,
                    location_longitude: 1
                }
            },

            // Execute sort alignments on deduplicated data
            { $sort: sortStage },
            
            // Facet concurrently splits out page rows, total item counts, and full breed distributions
            { 
                $facet: {
                    metadata: [{ $count: "total" }],
                    dataSlices: [{ $skip: skipValue }, { $limit: limit }],
                    breedChartData: [
                        { $group: { _id: "$breed", count: { $sum: 1 } } },
                        { $sort: { count: -1 } } // Sorts descending by popularity
                    ]
                }
            }
        ]);

        // Unpack nested index references from aggregation array outputs
        const totalRecordsCount = aggregationResult[0]?.metadata[0]?.total || 0;
        const cleanPaginatedRecords = aggregationResult[0]?.dataSlices || [];
        const aggregatedBreedsDistribution = aggregationResult[0]?.breedChartData || [];

        // Stream metric wrapper objects back across network connection
        res.json({
            data: cleanPaginatedRecords,
            total: totalRecordsCount,
            breedsSummary: aggregatedBreedsDistribution // Send metrics to Angular
        });

    } catch (err) {
        // Intercept pipeline breaks
        console.error("Aggregation pipeline broken:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));