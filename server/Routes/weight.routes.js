const express=require('express')
const route=express.Router();
 
const {getWeightController}=require('../Controllers/weight.controller');
 
route.get('/getWeight',getWeightController)
 
module.exports=route;