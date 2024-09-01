const mongoose = require("mongoose");
const allData = require("./data.js");
const Vendor = require("../DatabaseSchema/listingSchema.js");

main().then(()=> {console.log("Database Connected")}).catch((err) => console.log(err));

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/Vendordatabase");
}

async function databaseInit(){
    await Vendor.deleteMany({});
    await Vendor.insertMany(allData.data);
    console.log("Database initialized");
}

databaseInit();