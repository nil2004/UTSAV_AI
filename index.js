//Packages require
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Other Folder Requierments
const Vendor = require("./DatabaseSchema/listingSchema.js");
const User = require("./DatabaseSchema/userSchema.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {saveRedirectUrl, isLoggedin} = require("./middlewares.js")
const Enquiry = require("./DatabaseSchema/EnquieySchema.js");

const port = 8080;

//Middle Wares
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

//Database Connection
main().then(()=> {console.log("Database Connected")}).catch((err) => console.log(err));

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/Vendordatabase");
}

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}
//Cookies
app.use(session(sessionOptions));
app.use(flash());

//Authentication & Authorization
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

//Home Route
app.get("/", (req, res)=>{
    res.render("./MainPages/index")
});

//Listing route
app.get("/vendorlist", wrapAsync(async (req, res)=>{
    const allVendor = await Vendor.find({});
    res.render("./MainPages/listing", {allVendor});
}));

//Create New Listing Route By Admin Panel
app.post("/vendorlist/new",isLoggedin, wrapAsync(async (req, res) =>{
    let newVendor = new Vendor(req.body.vendor);
    await newVendor.save();
    res.redirect("/admin-panel")
}));

app.get("/vendorlist/:id/show", wrapAsync(async(req, res)=>{
    let {id} = req.params;
    let vendor = await Vendor.findById(id);
    res.render("./MainPages/vendorDetails", {vendor});
}))

//Edit Listing route by admin panel
app.get("/vendorlist/:id/edit",isLoggedin, wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const editVendor = await Vendor.findById(id);
    res.render("vendorListEdit", {editVendor})
}));

//Update Listing Route 
app.put("/vendorlist/:id", isLoggedin, wrapAsync(async(req, res)=>{
    let {id} = req.params;
    await Vendor.findByIdAndUpdate(id, {...req.body.vendor});
    res.redirect("/admin-panel");

}));

//Delete Listing routes
app.delete("/vendorlist/:id/delete", isLoggedin, wrapAsync(async(req, res)=>{
    const {id} = req.params;
    await Vendor.findByIdAndDelete(id);
    res.redirect("/admin-panel")
}));

//Enquiry Route
app.get("/vendorlist/enquiry", (req, res)=>{
    res.render("./MainPages/enquiry");
})

//Admin Panel Route
app.get("/admin-panel",isLoggedin, wrapAsync(async(req, res)=>{
    const allVendor = await Vendor.find({});
    res.render("adminPanel", {allVendor});
}));

//===============================================================
app.get("/login",(req, res)=>{
    res.render("adminLog");
})

app.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true, }), async (req, res) => {
    let redirectUrl = res.locals.redirectUrl || "/admin-panel";
    res.redirect(redirectUrl);
})


//CUSTOM ERROR HANDLING (MIDDLEWARE)
app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode=500, message } = err;
    res.status(statusCode).send(message);
    next();
});

//Port Listening
app.listen(port, ()=>{
    console.log(`port is listening on ${port}`)
})