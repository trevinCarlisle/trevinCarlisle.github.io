const express = require('express');
const router = express.Router();
const Animal = require('../models/animal');

router.get('/animals', async (req, res) => {
    const filterType = req.query.type;
    let query = {};

    if (filterType === 'Water Rescue') {
        query = {
            breed: { $regex: /Labrador Retriever|Chesa Bay Retr|Newfoundland/i },
            sex_upon_outcome: 'Intact Female',
            age_upon_outcome_in_weeks: { $gte: 26, $lte: 156 }
        };
    } else if (filterType === 'Mountain or Wilderness Rescue') {
        query = {
            breed: { $regex: /German Shepherd|Alaskan Malamute|Old English Sheepdog|Siberian Husky|Rottweiler/i },
            sex_upon_outcome: 'Intact Male',
            age_upon_outcome_in_weeks: { $gte: 26, $lte: 156 }
        };
    } else if (filterType === 'Disaster or Individual Tracking') {
        query = {
            breed: { $regex: /Doberman Pinsch|German Shepherd|Golden Retriever|Bloodhound|Rottweiler/i },
            sex_upon_outcome: 'Intact Male',
            age_upon_outcome_in_weeks: { $gte: 20, $lte: 300 }
        };
    } // 'All Breeds' handles an empty query {} matching all entries

    try {
        const data = await Animal.find(query).lean();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;