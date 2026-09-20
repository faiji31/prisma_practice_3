import cookieParser from "cookie-parser";
import express,{ Application, Request, Response } from "express";
import cors from 'cors'
import config from "./config";
import httpStatus from 'http-status'
import { prisma } from "./lib/prisma";
import bcrypt from 'bcrypt'


const app:Application = express()


app.use(cors({
     origin:config.app_url,
     credentials:true
}))


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.get("/",(req:Request,res:Response)=>{
    res.send("Hello world!!")
})

app.post('/api/users/register',async(req:Request,res:Response)=>{
    const {name,email,password,profilephoto} = req.body

    const isUserexits = await prisma.user.findUnique({
        where:{email}
    })
    if(isUserexits){
        throw new Error("user is already exits!!")
    }

    const hashPassword = await bcrypt.hash(password,Number(config.bcrypt_salt_rounds))

    const createuser = await prisma.user.create({
        data:{
            name,email,password:hashPassword
        }
    })
     await prisma.profile.create({
      data:{
        userId:createuser.id,
        profilephoto
      }
    })

    const user = await prisma.user.findUnique({
        where:{
            id:createuser.id,
            email:createuser.email
        },
        
        include:{
            profile:true
        },
        omit:{
            password:true
        }
    })

    res.status(httpStatus.CREATED).json({
        success:true,
        statusCode:httpStatus.CREATED,
        message:"user register successfully!!",
        data:{
            user
        }
       
        
    })

})


export default app