const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');
const opencage = require('opencage-api-client');


const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },

    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Name cannot be more than 500 characters']
    },

    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },

    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },

    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },

    address: {
        type: String,
        required: [false, 'Please add an address']
    },

    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },

    careers: {
        // Array of strings
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Others'
        ]
    },

    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must be at least 10']
    },

    averageCost: Number,

    photo: {
        type: String,
        default: 'no-photo.jpg'
    },

    housing: {
        type: Boolean,
        default: false
    },

    jobAssistance: {
        type: Boolean,
        default: false
    },

    jobGuarantee: {
        type: Boolean,
        default: false
    },

    acceptGi: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


BootcampSchema.pre('validate', async function (next) {
    // Create bootcamp slug from the name
    this.slug = slugify(this.name, { lower: true });

    // Geocode and create location field
    try {
        const data = await opencage.geocode({ q: this.address });
        if (data.status.code === 200 && data.results.length > 0) {
            const place = data.results[0];
            const placeInfo = place.components;
            const location = {
                type: 'Point',
                coordinates: [place.geometry.lng, place.geometry.lat],
                formattedAddress: place.formatted,
                street: placeInfo.building,
                city: placeInfo.city,
                state: placeInfo.state,
                zipcode: placeInfo.postcode,
                country: placeInfo.country_code
            };
            this.location = location;
        } else {
            console.log('Status', data.status.message);
            console.log('total_results', data.total_results);
        }

        // Do not save address in DB (if intended)
        this.address = undefined;
    } catch (error) {
        console.log('Error', error.message);
        if (error.status && error.status.code === 402) {
            console.log('hit free trial daily limit');
            console.log('become a customer: https://opencagedata.com/pricing');
        }
        // Pass the error to the next middleware
        next(error);
        return;
    }

    next();
});

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function (next) {
   console.log(`Courses being removed from bootcamp ${this._id}`);
   await this.model('Course').deleteMany({ bootcamp: this._id });
   next();
});

// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
})

module.exports = mongoose.model('Bootcamp', BootcampSchema);