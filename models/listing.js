const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js');

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: Object,
        set: function (value) {
            if (typeof value === "string") {
                return {
                    filename: String,
                    url: value.trim() === ""
                        ? "https://cdn.pixabay.com/photo/2018/08/29/09/27/india-3639503_960_720.jpg"
                        : value
                };
            }

            if (value && typeof value === "object") {
                return {
                    filename: value.filename || null,
                    url: !value.url || value.url.trim() === ""
                        ? "https://cdn.pixabay.com/photo/2018/08/29/09/27/india-3639503_960_720.jpg"
                        : value.url
                };
            }

            return {
                filename: null,
                url: "https://cdn.pixabay.com/photo/2018/08/29/09/27/india-3639503_960_720.jpg"
            };
        }
    },
    price: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    country: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review",
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    category: {
        type: String,
        enum: ["trending","mountain", "rooms","iconic cities", "castles", "pools", "camping", "farms", "arctic"],
    }
});

listingSchema.post("findOneAndDelete", async(listing) => {
    if (listing) {
        await Review.deleteMany({_id: { $in: listing.reviews}});
    }
});

 
module.exports = mongoose.model("Listing", listingSchema);
