"use server"
import { auth } from "@clerk/nextjs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import crypto from "crypto"
import { Plant } from "@/types/plant.type";
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex")

// Alternative Function without using crypto
// const generateFileName = (bytes = 32) => {
//     const array = new Uint8Array(bytes)
//     crypto.getRandomValues(array)
//     return [...array].map((b) => b.toString(16).padStart(2, "0")).join("")
//   }

const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_LOCAL!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })


const acceptedTypes= [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm"]

const maxFileSize = 1024 * 1024 * 10; //10MB



export async function getSignedURL(type:string, size: number, checksum: string){
    const session = auth();
    if(!session){
        return {failure: "Unauthorized"}
    }

    if(!acceptedTypes.includes(type)) {
        return {failure: "Invalid file type"}
    }

    if(size >maxFileSize) {
        return {failure: "File too large"}
    }
    
    let metadata = {}
    if(session.userId)
        metadata={...metadata, userId: session.userId}
    

    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: generateFileName(),
        ContentType: type,
        ContentLength: size,
        ChecksumSHA256: checksum,
        Metadata: {
            ...metadata
        }
    })

    const signedURL = await getSignedUrl(
        s3Client,
        putObjectCommand,
        { expiresIn: 60 } // 60 seconds
    )

    
    
    return {success: {url: signedURL}}
}


export const createPlant = async (plant: Plant) =>{
    try {
        const session = auth();
        if(!session){
            return {failure: "Unauthorized"}
        }
        const newPlant = {...plant,userId: session.userId};
        console.log("createPlant Called")
        console.log({newPlant});
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/plants`,{
            method:"POST",
            body: JSON.stringify(newPlant),
            headers: {
                "Content-Type": "application/json",
            },
        })
        console.log({res})
        // The return value is *not* serialized
        // You can return Date, Map, Set, etc.
    
        if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
        }
    
        return res.json()
        
    } catch (error) {
        console.log({error})
        throw new Error('Failed to fetch data')
    }
}