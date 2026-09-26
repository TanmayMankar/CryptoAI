const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const bcrypt = require("bcryptjs")


async function registerUser(req,res){
    const {username,email,password} = req.body;


    const isUserExist = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(isUserExist){
        return res.status(400).json({message:"user already exist"})
    }


    const hash = await bcrypt.hash(password,10)

    const user = await userModel.create({username,email,password:hash})

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.cookie("token",token)


    res.status(201).json({message:"user created successfully",user,token})
}


async function loginUser(req,res){

    const {username,email,password} = req.body;

    const user = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })


    if(!user){
        return res.status(400).json({message:"user not found"})
    }



    const isPasswordValid = await bcrypt.compare(password,user.password)

    if(!isPasswordValid){
        return res.status(400).json({message:"invalid password"})
    }


    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.cookie("token",token)

    res.status(200).json({message:"user logged in successfully",user,token})
}


async function logoutUser(req,res){

    res.clearCookie("token")

    res.status(200).json({message:"user logged out successfully"})

}


async function getUser(req,res){


    const user = await userModel.findById(req.user.id)


    if(!user){
        return res.status(400).json({message:"user not found"})
    }

    res.status(200).json({message:"user fetched successfully",user})
}

module.exports = {registerUser,loginUser,logoutUser,getUser}