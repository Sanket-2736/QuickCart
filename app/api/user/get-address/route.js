import connectDB from "@/config/db";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/dist/types/server";
import { connect } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const {userId} = getAuth(req);
        await connectDB();
        const address = await Address.find({userId});
        return NextResponse.json({
            success: true, address, message: "Address fetched successfully"
        })
    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message || "Failed to fetch user data"
        });
    }
    
}