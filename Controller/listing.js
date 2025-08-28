const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const { category } = req.query;

    let listings = [];

    if (category && category !== 'all') {
        const filteredListings = await Listing.find({ category }).sort({ createdAt: -1 });

        const otherListings = await Listing.find({ category: { $ne: category } }).sort({ createdAt: -1 });

        listings = [...filteredListings, ...otherListings];
    } else {
        listings = await Listing.find({}).sort({ createdAt: -1 });
    }

    res.render("index", {
        listings,
        selectedCategory: category || 'all'
    });
};

module.exports.newForm = (req, res) => {
    res.render("new"); // Make sure you have views/new.ejs
};

module.exports.showListing = async (req, res) => {
    console.log("Route Params:", req.params); // Debugging log
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing does not exist.");
        return res.redirect("/listings"); // ✅ return added
    }
    console.log(listing);
    res.render("show", { listing })
};

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/c_fill,h_300,w_250,f_auto"
    )
    res.render("edit", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect("/listings");
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};


module.exports.searchResults = async (req, res) => {
  const { q } = req.query;
if (!q || q.trim() === '') {
  return res.render('search', {
    results: [],
    query: '',
    message: 'Please enter a search term.'
  });
}
   const query = {
    $or: [
      { title: { $regex: String(q), $options: 'i' } },
      { country: { $regex: String(q), $options: 'i' } },
      !isNaN(q) ? { price: Number(q) } : null
    ].filter(Boolean)
  };

  try {
    console.log(query);
    const results = await Listing.find(query);
  if (results.length === 0) {
  req.flash("error", "No listings found!");
  return res.redirect("/listings"); // Redirect to homepage or wherever you want
}
    res.render("search", { results, query: q });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).send('Search failed');
  }
};