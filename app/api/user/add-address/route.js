import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Address from "@/models/Address";

export async function POST(req) {
    try {
        const {userId} = getAuth(req);
        const {address} = await req.json();
        await connectDB();
        const newAddress = await Address.create({...address, userId});
        return NextResponse.json({
            success: true, message: "Address added successfully", newAddress
        });
    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message || "Failed to fetch user data"
        })
    }    
}